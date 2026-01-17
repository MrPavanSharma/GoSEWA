const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    
    const queries = [
        "ALTER TABLE Cattles ADD COLUMN rfid_tag VARCHAR(255) UNIQUE DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN lactation_number INTEGER DEFAULT 0",
        "ALTER TABLE Cattles ADD COLUMN current_status VARCHAR(255) DEFAULT 'MILKING'",
        "ALTER TABLE Cattles ADD COLUMN current_group VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN entry_type VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN entry_date DATE DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN exit_type VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN exit_date DATE DEFAULT NULL",
        "ALTER TABLE Cattles ADD COLUMN deleted_at DATETIME DEFAULT NULL"
    ];

    for (const query of queries) {
        try {
            await sequelize.query(query);
            console.log(`Executed: ${query}`);
        } catch (e) {
            console.log(`Error executing query (might already exist): ${query} - ${e.message}`);
        }
    }
    
    // Also drop old columns if needed, but let's keep them for safety for now or drop them. 
    // Usually dropping columns requires more care in SQLite/Sequelize if constraints exist.
    // We will just leave them unused for now or drop them if simple.
    // "ALTER TABLE Cattles DROP COLUMN health_status",
    // "ALTER TABLE Cattles DROP COLUMN milking_status"

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
