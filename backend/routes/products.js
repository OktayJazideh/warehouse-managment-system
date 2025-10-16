const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Product, Category, Inventory, Warehouse } = require('../models');
const { authenticateToken, requireAdminOrManager } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 10000 }),
  query('search').optional().isString(),
  query('categoryId').optional().isUUID(),
  query('isActive').optional().isBoolean()
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
    const { search, categoryId, isActive } = req.query;

    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: Inventory,
          include: [{
            model: Warehouse,
            attributes: ['id', 'name', 'code']
          }]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new product
router.post('/', authenticateToken, requireAdminOrManager, [
  body('code').isLength({ min: 2, max: 50 }).trim(),
  body('name').isLength({ min: 2, max: 200 }).trim(),
  body('categoryId').isUUID(),
  body('unit').isLength({ min: 1, max: 20 }).trim(),
  body('unitPrice').isNumeric().custom(value => value >= 0),
  body('costPrice').optional({ checkFalsy: true }),
  body('minStockLevel').optional({ checkFalsy: true }),
  body('maxStockLevel').optional({ checkFalsy: true }),
  body('weight').optional({ checkFalsy: true }),
  body('dimensions').optional({ checkFalsy: true }),
  body('barcode').optional({ checkFalsy: true }),
  body('sku').optional({ checkFalsy: true }),
  body('description').optional({ checkFalsy: true }),
  body('tags').optional().isArray()
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

    const {
      code, name, description, categoryId, unit, unitPrice, costPrice,
      minStockLevel, maxStockLevel, weight, dimensions, barcode, sku, tags
    } = req.body;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if product code already exists
    const existingProduct = await Product.findOne({ where: { code } });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product code already exists'
      });
    }

    const product = await Product.create({
      code,
      name,
      description,
      categoryId,
      unit,
      unitPrice,
      costPrice,
      minStockLevel,
      maxStockLevel,
      weight,
      dimensions,
      barcode,
      sku,
      tags: tags || []
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: productWithCategory }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', authenticateToken, requireAdminOrManager, [
  body('code').optional().isLength({ min: 2, max: 50 }).trim(),
  body('name').optional().isLength({ min: 2, max: 200 }).trim(),
  body('categoryId').optional().isUUID(),
  body('unit').optional().isLength({ min: 1, max: 20 }).trim(),
  body('unitPrice').optional().isNumeric().custom(value => value >= 0),
  body('costPrice').optional({ checkFalsy: true }),
  body('minStockLevel').optional({ checkFalsy: true }),
  body('maxStockLevel').optional({ checkFalsy: true }),
  body('weight').optional({ checkFalsy: true }),
  body('isActive').optional().isBoolean()
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

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { ...req.body };

    // Check if category exists if provided
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    // Check if product code already exists (excluding current product)
    if (updateData.code && updateData.code !== product.code) {
      const existingProduct = await Product.findOne({
        where: { code: updateData.code, id: { [require('sequelize').Op.ne]: product.id } }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product code already exists'
        });
      }
    }

    await product.update(updateData);

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has inventory
    const inventory = await Inventory.findOne({
      where: { productId: product.id, quantity: { [require('sequelize').Op.gt]: 0 } }
    });

    if (inventory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product with existing inventory. Set as inactive instead.'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;