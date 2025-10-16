const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Warehouse = sequelize.define('Warehouse', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100],
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 20],
        isUppercase: true,
        isAlphanumeric: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 50],
      },
    },
    state: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 50],
      },
    },
    postalCode: {
      type: DataTypes.STRING,
      validate: {
        len: [5, 20],
      },
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'Iran',
      validate: {
        len: [2, 50],
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        len: [10, 20],
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    managerName: {
      type: DataTypes.STRING,
      validate: {
        len: [2, 100],
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'warehouses',
    timestamps: true,
  });

  return Warehouse;
};