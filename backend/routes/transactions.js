const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Transaction, Product, Warehouse, User, Inventory, sequelize } = require('../models');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Get transactions with filters
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['inbound', 'outbound', 'transfer', 'adjustment']),
  query('warehouseId').optional().isUUID(),
  query('productId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { type, warehouseId, productId, startDate, endDate } = req.query;

    const where = {};
    if (type) where.type = type;
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    
    if (startDate && endDate) {
      const { Op } = require('sequelize');
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.transactionDate = { [require('sequelize').Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.transactionDate = { [require('sequelize').Op.lte]: new Date(endDate) };
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['id', 'code', 'name', 'unit']
        },
        {
          model: Warehouse,
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new transaction
router.post('/', authenticateToken, requireAdminOrManager, [
  body('type').isIn(['inbound', 'outbound', 'transfer', 'adjustment']),
  body('productId').isUUID(),
  body('warehouseId').isUUID(),
  body('quantity').isInt({ min: 1 }),
  body('unitCost').optional({ checkFalsy: true }),
  body('reason').optional({ checkFalsy: true }),
  body('notes').optional({ checkFalsy: true }),
  body('supplierName').optional({ checkFalsy: true }),
  body('customerName').optional({ checkFalsy: true }),
  body('transactionDate').optional({ checkFalsy: true })
], async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      type, productId, warehouseId, quantity, unitCost = 0,
      reason, notes, supplierName, customerName,
      transactionDate = new Date()
    } = req.body;

    // Verify product and warehouse exist
    const product = await Product.findByPk(productId);
    const warehouse = await Warehouse.findByPk(warehouseId);

    if (!product || !warehouse) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid product or warehouse ID'
      });
    }

    // Generate reference number
    const refNumber = `${type.toUpperCase()}-${moment().format('YYYYMMDD')}-${Date.now().toString().slice(-6)}`;

    // Create transaction
    const transaction = await Transaction.create({
      type,
      referenceNumber: refNumber,
      productId,
      warehouseId,
      userId: req.user.id,
      quantity,
      unitCost,
      reason,
      notes,
      supplierName,
      customerName,
      transactionDate
    }, { transaction: t });

    // Update inventory
    let inventory = await Inventory.findOne({
      where: { productId, warehouseId }
    }, { transaction: t });

    if (!inventory) {
      inventory = await Inventory.create({
        productId,
        warehouseId,
        quantity: 0
      }, { transaction: t });
    }

    let newQuantity = inventory.quantity;
    if (type === 'inbound') {
      newQuantity += quantity;
    } else if (type === 'outbound') {
      if (inventory.quantity < quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory quantity'
        });
      }
      newQuantity -= quantity;
    } else if (type === 'adjustment') {
      newQuantity = quantity; // Direct set to quantity for adjustments
    }

    await inventory.update({ quantity: newQuantity }, { transaction: t });

    await t.commit();

    // Fetch complete transaction with relations
    const completeTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Product, attributes: ['id', 'code', 'name', 'unit'] },
        { model: Warehouse, attributes: ['id', 'name', 'code'] },
        { model: User, attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction: completeTransaction }
    });
  } catch (error) {
    await t.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;