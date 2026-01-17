const sequelize = require('./src/config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    try {
        await sequelize.query("ALTER TABLE Cattles ADD COLUMN rfid_tag VARCHAR(255) DEFAULT NULL");
        console.log('Column rfid_tag added.');
    } catch (e) {
        console.log('Column adding failed (maybe exists?):', e.message);
    }

    try {
        await sequelize.query("CREATE UNIQUE INDEX IF NOT EXISTS rfid_tag_unique ON Cattles(rfid_tag)");
        console.log('Unique index on rfid_tag created.');
    } catch (e) {
        console.log('Index creation failed:', e.message);
    }

  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    await sequelize.close();
  }
}

fix();
