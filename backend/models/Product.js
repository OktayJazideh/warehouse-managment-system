const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 20],
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    costPrice: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    minStockLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    maxStockLevel: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      validate: {
        min: 0,
      },
    },
    dimensions: {
      type: DataTypes.STRING,
    },
    barcode: {
      type: DataTypes.STRING,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tags: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
      defaultValue: '[]',
    },
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
      {
        fields: ['categoryId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  });

  return Product;
};