const { Sequelize } = require('sequelize');
require('dotenv').config();

// MySQL via Sequelize ORM (see README for the justification of the
// relational/ledger design - the same reasoning applies whether the engine
// underneath is Postgres or MySQL, which is why swapping engines only
// touches this file, package.json, and the one JSON column in AuditLog).


const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: true, // snake_case columns in the DB, camelCase in JS
      timestamps: true,
    },
  }
);

module.exports = sequelize;
