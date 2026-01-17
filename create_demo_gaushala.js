const { User } = require('./src/models');
const { hashPassword } = require('./src/utils/authUtils');
const sequelize = require('./src/config/database');

async function createDemoUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');

    const email = 'gaushala@test.com';
    const password = 'password123';
    const hashedPassword = await hashPassword(password);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        password_hash: hashedPassword,
        full_name: 'Demo Gaushala User',
        phone: '1112223333',
        user_type: 'GAUSHALA'
      }
    });

    if (!created) {
      console.log('User already exists. Updating password...');
      user.password_hash = hashedPassword;
      // Ensure user_type is GAUSHALA
      user.user_type = 'GAUSHALA'; 
      await user.save();
      console.log('User updated.');
    } else {
      console.log('User created.');
    }

    console.log('\n--- Credentials ---');
    console.log(`Username (Email): ${email}`);
    console.log(`Password:         ${password}`);
    console.log(`User Type:        ${user.user_type}`);
    console.log('-------------------');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

createDemoUser();
