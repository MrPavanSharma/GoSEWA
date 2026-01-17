const { User } = require("./src/models");
const sequelize = require("./src/config/database");

async function findGaushala() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");
    const users = await User.findAll({
      where: { user_type: "GAUSHALA" },
      attributes: ["id", "email", "full_name", "phone"],
    });

    if (users.length > 0) {
      console.log("Found Gaushala Users:");
      users.forEach((u) => console.log(JSON.stringify(u.toJSON(), null, 2)));
    } else {
      console.log("No Gaushala users found.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

findGaushala();
