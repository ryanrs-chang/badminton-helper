import Sequelize from "sequelize";
import { DatabaseInstance } from "./type";
import importModels from "./importModels";
import Debug from "debug";
const debug = Debug("badminton:db:debug");
const info = Debug("badminton:db");

const sequelize: Sequelize.Sequelize = new Sequelize.Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_URL,
    dialect: "postgres",
    pool: {
      max: 50,
      min: 0,
      acquire: 1000000,
      idle: 10000
    },
    logging: false,
    define: {
      timestamps: false
    }
  }
);

const db: DatabaseInstance = {
  sequelize,
  Sequelize
};

async function defineModels() {
  db.Group.belongsToMany(db.User, { through: db.UserGroup });
  db.User.belongsToMany(db.Group, { through: db.UserGroup });

  db.Game.belongsToMany(db.User, { through: db.UserGame });
  db.User.belongsToMany(db.Game, { through: db.UserGame });

  db.Group.hasMany(db.Game);
  db.Game.belongsTo(db.Group);
}

async function defaultDBValue() {
  await Promise.all([
    db.Role.upsert({ id: 0, description: "User", level: 1 }),
    db.Role.upsert({ id: 1, description: "Manager", level: 2 }),
    db.Role.upsert({ id: 2, description: "Maintainer", level: 3 }),
    db.Role.upsert({ id: 3, description: "Administrator", level: 4 })
  ]);
}

export async function init() {
  try {
    await importModels(db);

    defineModels();
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    await sequelize.sync();
    await defaultDBValue();

    info("Connection has been established successfully.");
  } catch (error) {
    info("Unable to connect to the database:", error);
    throw error;
  }
}

export default db;
