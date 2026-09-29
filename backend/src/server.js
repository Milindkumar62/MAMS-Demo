require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models'); // registers associations

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // In production, prefer migrations over sync({ alter: true }).
    await sequelize.sync();
    console.log('Models synced.');

    app.listen(PORT, () => console.log(`MAMS API listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
