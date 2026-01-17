const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    // Try adding the column
    try {
        await sequelize.query("ALTER TABLE Cattles ADD COLUMN type VARCHAR(255) DEFAULT 'COW'");
        console.log('Column added successfully.');
    } catch (e) {
        console.log('Error adding column (maybe exists?):', e.message);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
