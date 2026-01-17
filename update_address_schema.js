const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function migrate_address_fields() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const columns = [
      'ALTER TABLE Users ADD COLUMN premises_name VARCHAR(255);',
      'ALTER TABLE Users ADD COLUMN street_address TEXT;',
      'ALTER TABLE Users ADD COLUMN state VARCHAR(100);',
      'ALTER TABLE Users ADD COLUMN city VARCHAR(100);',
      'ALTER TABLE Users ADD COLUMN pincode VARCHAR(20);'
    ];

    for (const query of columns) {
      try {
        await sequelize.query(query, { type: QueryTypes.RAW });
        console.log(`Executed: ${query}`);
      } catch (e) {
        console.log(`Failed (might exist): ${query} - ${e.message}`);
      }
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate_address_fields();
