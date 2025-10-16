const express = require('express');
const { body, validationResult } = require('express-validator');
const { Warehouse } = require('../models');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Get all warehouses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { warehouses }
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new warehouse
router.post('/', authenticateToken, requireAdminOrManager, [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('code').isLength({ min: 2, max: 20 }).trim().isUppercase(),
  body('address').optional().isString(),
  body('city').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail(),
  body('managerName').optional().isString(),
  body('capacity').optional().isInt({ min: 0 })
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

    const { code, name } = req.body;

    // Check if code or name already exists
    const existing = await Warehouse.findOne({
      where: { [require('sequelize').Op.or]: [{ code }, { name }] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse code or name already exists'
      });
    }

    const warehouse = await Warehouse.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Warehouse created successfully',
      data: { warehouse }
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;