const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    availableQuantity: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.quantity - this.reservedQuantity;
      },
    },
    location: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 100],
      },
    },
    lastCountDate: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'inventory',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productId', 'warehouseId'],
      },
      {
        fields: ['warehouseId'],
      },
      {
        fields: ['quantity'],
      },
    ],
  });

  return Inventory;
};