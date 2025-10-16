const express = require('express');
const { query, validationResult } = require('express-validator');
const { Inventory, Product, Warehouse, Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get inventory with filters
router.get('/', authenticateToken, [
  query('warehouseId').optional().isUUID(),
  query('productId').optional().isUUID(),
  query('categoryId').optional().isUUID(),
  query('lowStock').optional().isBoolean()
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

    const { warehouseId, productId, categoryId, lowStock } = req.query;
    const where = {};
    const productWhere = {};

    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (categoryId) productWhere.categoryId = categoryId;

    if (lowStock === 'true') {
      // This will be handled in the sequelize query with a custom condition
    }

    const inventory = await Inventory.findAll({
      where,
      include: [
        {
          model: Product,
          where: productWhere,
          include: [{ model: Category, attributes: ['id', 'name'] }]
        },
        {
          model: Warehouse,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Filter for low stock if requested
    const filteredInventory = lowStock === 'true' 
      ? inventory.filter(item => item.quantity <= item.Product.minStockLevel)
      : inventory;

    res.json({
      success: true,
      data: { inventory: filteredInventory }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get inventory summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalWarehouses = await Warehouse.count({ where: { isActive: true } });
    
    const inventory = await Inventory.findAll({
      include: [{ model: Product, attributes: ['minStockLevel'] }]
    });

    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => 
      item.quantity <= item.Product.minStockLevel
    ).length;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalWarehouses,
        totalItems,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;