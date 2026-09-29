require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const { User, Base, EquipmentType } = require('../src/models');

async function seed() {
  await sequelize.sync({ force: true }); // WARNING: drops and recreates tables. Dev/demo only.

  const [alpha, bravo, charlie] = await Base.bulkCreate([
    { name: 'Alpha Base', location: 'Northern Command' },
    { name: 'Bravo Base', location: 'Eastern Command' },
    { name: 'Charlie Base', location: 'Western Command' },
    { name: 'Charlie John', location: 'UK South' }
  ]);

  const [rifle, ammo556, jeep, apc] = await EquipmentType.bulkCreate([
    { name: '5.56mm Rifle', category: 'weapon', unit: 'unit' },
    { name: '5.56mm Ammunition', category: 'ammunition', unit: 'rounds' },
    { name: 'Light Utility Jeep', category: 'vehicle', unit: 'unit' },
    { name: 'Armoured Personnel Carrier', category: 'vehicle', unit: 'unit' },
  ]);

  const passwordHash = await bcrypt.hash('Password@123', 10);

  await User.bulkCreate([
    { name: 'Aria Admin', email: 'admin@mams.mil', passwordHash, role: 'admin', baseId: null },
    { name: 'Cole Commander', email: 'commander.alpha@mams.mil', passwordHash, role: 'base_commander', baseId: alpha.id },
    { name: 'Lena Logistics', email: 'logistics@mams.mil', passwordHash, role: 'logistics_officer', baseId: null },
  ]);

  console.log('Seed complete.');
  console.log('Bases:', alpha.name, bravo.name, charlie.name);
  console.log('Equipment:', rifle.name, ammo556.name, jeep.name, apc.name);
  console.log('Login with any of these (password: Password@123):');
  console.log(' - admin@mams.mil (admin)');
  console.log(' - commander.alpha@mams.mil (base_commander, Alpha Base)');
  console.log(' - logistics@mams.mil (logistics_officer)');

  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
