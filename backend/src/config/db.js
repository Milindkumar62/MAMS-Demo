const { Sequelize } = require('sequelize');
require('dotenv').config();
require('mysql2'); // Forces the bundler to include mysql2 in the serverless build

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'), // Pass the loaded module directly to Sequelize
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
  }
);

module.exports = sequelize;
