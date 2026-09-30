const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug log to verify what your serverless function sees at runtime
console.log('Database Configuration Debug:');
console.log('DB_HOST:', process.env.DB_HOST || 'MISSING (defaulting to localhost)');
console.log('DB_PORT:', process.env.DB_PORT || 3306);
console.log('DB_NAME:', process.env.DB_NAME || 'MISSING');
console.log('DB_USER:', process.env.DB_USER || 'MISSING');

if (!process.env.DB_HOST) {
  console.error('CRITICAL: DB_HOST environment variable is not defined in this environment!');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
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
