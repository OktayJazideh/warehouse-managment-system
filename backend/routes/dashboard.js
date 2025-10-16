const express = require('express');
const { Op } = require('sequelize');
const { Product, Warehouse, Inventory, Transaction, Category, sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();

    // Get basic counts
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalWarehouses = await Warehouse.count({ where: { isActive: true } });
    
    // Get inventory summary
    const inventory = await Inventory.findAll({
      include: [{ 
        model: Product, 
        attributes: ['minStockLevel'],
        where: { isActive: true }
      }]
    });

    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => 
      item.quantity <= item.Product.minStockLevel
    ).length;

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      where: {
        transactionDate: { [Op.gte]: thirtyDaysAgo }
      },
      include: [
        { model: Product, attributes: ['code', 'name'] },
        { model: Warehouse, attributes: ['name'] }
      ],
      order: [['transactionDate', 'DESC']],
      limit: 10
    });

    // Get transaction stats
    const inboundCount = await Transaction.count({
      where: { 
        type: 'inbound',
        transactionDate: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const outboundCount = await Transaction.count({
      where: { 
        type: 'outbound',
        transactionDate: { [Op.gte]: thirtyDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalWarehouses,
          totalItems,
          lowStockItems
        },
        transactions: {
          recent: recentTransactions,
          inboundCount,
          outboundCount
        }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get transaction trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();

    const transactions = await Transaction.findAll({
      where: {
        transactionDate: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('transactionDate')), 'date'],
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [
        sequelize.fn('DATE', sequelize.col('transactionDate')),
        'type'
      ],
      order: [[sequelize.fn('DATE', sequelize.col('transactionDate')), 'ASC']]
    });

    res.json({
      success: true,
      data: { trends: transactions }
    });
  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get category distribution
router.get('/category-distribution', authenticateToken, async (req, res) => {
  try {
    const distribution = await Category.findAll({
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('Products.id')), 'productCount']
      ],
      include: [{
        model: Product,
        attributes: [],
        where: { isActive: true }
      }],
      group: ['Category.id', 'Category.name'],
      order: [[sequelize.fn('COUNT', sequelize.col('Products.id')), 'DESC']]
    });

    res.json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    console.error('Category distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;