const { runFullMaintenance } = require('../utils/maintenanceCron');
const prisma = require('../utils/prisma');

const testMaintenance = async () => {
  try {
    console.log('--- MANUAL MAINTENANCE TEST INITIATED ---');
    await runFullMaintenance();
    console.log('--- TEST FINISHED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('--- TEST FAILED ---');
    console.error(err);
    process.exit(1);
  }
};

testMaintenance();
