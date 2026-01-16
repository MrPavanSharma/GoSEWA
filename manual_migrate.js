const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const columns = [
      'ALTER TABLE Users ADD COLUMN gaushala_name VARCHAR(255);',
      'ALTER TABLE Users ADD COLUMN gaushala_address TEXT;',
      'ALTER TABLE Users ADD COLUMN registration_number VARCHAR(255);',
      'ALTER TABLE Users ADD COLUMN establishment_year INTEGER;',
      'ALTER TABLE Users ADD COLUMN ownership_type VARCHAR(50);'
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

migrate();
