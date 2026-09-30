const { Sequelize } = require('sequelize');
require('dotenv').config();

const isDev = process.env.NODE_ENV !== 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',

    // Enable logging in development (prints raw SQL queries)
    logging: isDev ? console.log : false,

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

// Verify the connection immediately
if (isDev) {
  sequelize
    .authenticate()
    .then(() => console.log(' Database connected successfully.'))
    .catch((err) => console.error(' Database connection failed:', err.message));
}

module.exports = sequelize;
