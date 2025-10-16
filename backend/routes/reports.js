const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { Product, Warehouse, Inventory, Transaction, Category, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Get inventory report
router.get('/inventory', authenticateToken, [
  query('warehouseId').optional().isUUID(),
  query('categoryId').optional().isUUID(),
  query('format').optional().isIn(['json', 'excel'])
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

    const { warehouseId, categoryId, format = 'json' } = req.query;
    
    const where = {};
    const productWhere = { isActive: true };
    
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) productWhere.categoryId = categoryId;

    const inventory = await Inventory.findAll({
      where,
      include: [
        {
          model: Product,
          where: productWhere,
          include: [{ model: Category, attributes: ['name'] }]
        },
        {
          model: Warehouse,
          attributes: ['name', 'code']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory Report');

      worksheet.columns = [
        { header: 'Product Code', key: 'code', width: 15 },
        { header: 'Product Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Warehouse', key: 'warehouse', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Min Stock Level', key: 'minStock', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      inventory.forEach(item => {
        const status = item.quantity <= item.Product.minStockLevel ? 'Low Stock' : 'OK';
        worksheet.addRow({
          code: item.Product.code,
          name: item.Product.name,
          category: item.Product.Category.name,
          warehouse: item.Warehouse.name,
          quantity: item.quantity,
          unit: item.Product.unit,
          minStock: item.Product.minStockLevel,
          status
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${moment().format('YYYY-MM-DD')}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({
        success: true,
        data: { inventory }
      });
    }
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get transaction report
router.get('/transactions', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isIn(['inbound', 'outbound', 'transfer', 'adjustment']),
  query('warehouseId').optional().isUUID(),
  query('format').optional().isIn(['json', 'excel'])
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

    const { startDate, endDate, type, warehouseId, format = 'json' } = req.query;
    
    const where = {};
    
    if (type) where.type = type;
    if (warehouseId) where.warehouseId = warehouseId;
    
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.transactionDate = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.transactionDate = { [Op.lte]: new Date(endDate) };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Product, attributes: ['code', 'name', 'unit'] },
        { model: Warehouse, attributes: ['name', 'code'] },
        { model: User, attributes: ['username', 'firstName', 'lastName'] }
      ],
      order: [['transactionDate', 'DESC']]
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transaction Report');

      worksheet.columns = [
        { header: 'Reference', key: 'reference', width: 20 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Product Code', key: 'productCode', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Warehouse', key: 'warehouse', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Unit Cost', key: 'unitCost', width: 12 },
        { header: 'Total Cost', key: 'totalCost', width: 12 },
        { header: 'User', key: 'user', width: 20 },
        { header: 'Notes', key: 'notes', width: 30 }
      ];

      transactions.forEach(trans => {
        worksheet.addRow({
          reference: trans.referenceNumber,
          date: moment(trans.transactionDate).format('YYYY-MM-DD'),
          type: trans.type,
          productCode: trans.Product.code,
          productName: trans.Product.name,
          warehouse: trans.Warehouse.name,
          quantity: trans.quantity,
          unitCost: trans.unitCost,
          totalCost: trans.totalCost,
          user: `${trans.User.firstName} ${trans.User.lastName}`,
          notes: trans.notes || ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=transaction-report-${moment().format('YYYY-MM-DD')}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({
        success: true,
        data: { transactions }
      });
    }
  } catch (error) {
    console.error('Transaction report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;