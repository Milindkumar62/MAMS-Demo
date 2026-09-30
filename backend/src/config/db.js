const { Sequelize } = require('sequelize');
const path = require('path');

// Ensure dotenv finds the .env file if running in subdirectories
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config(); 

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = Number(process.env.DB_PORT) || 3306;

if (!dbHost || dbHost === 'localhost' || dbHost === '127.0.0.1') {
  throw new Error(
    `[Database Config Error] Invalid DB_HOST: "${dbHost}". In a cloud/serverless deployment, DB_HOST must be set to a remote hosted database host, not localhost/127.0.0.1.`
  );
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
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
});

module.exports = sequelize;
