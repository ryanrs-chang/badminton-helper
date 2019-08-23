import Sequelize, { Model } from "sequelize";

const sequelize = new Sequelize.Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_URL,
    dialect: "postgres",
    pool: {
      max: 30,
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

export interface DatabaseModel {
  [key: string]: Model<any, any>;
}
import User from "../models/user";
import Group from "../models/group";
import UserGroup from "../models/user_group";
import Role from "../models/role";
import Game from "../models/game";
import UserGame from "../models/user_game";

const db = {
  sequelize,
  Sequelize,
  User: User(sequelize),
  Group: Group(sequelize),
  UserGroup: UserGroup(sequelize),
  Game: Game(sequelize),
  Role: Role(sequelize),
  UserGame: UserGame(sequelize)
};

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

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
    db.Role.upsert({ id: 3, description: "Administrator", level: 4 }),

    // temp data
    db.Group.upsert({ id: "Cce9702dfcdf2824f50f89fd9054546c0" }),
    db.User.upsert({
      id: "U89ff8d6dbcf4c745ccbdd17e97d1c714",
      display_name: "張如賢",
      picture_url:
        "https://profile.line-scdn.net/0hG2kCfXbSGB1WOjI9ZEhnSmp_FnAhFB5VLlxfLnU8Tn16WQpNPlxTf3FqFSgrXl1KYl5efic9TyQu"
    })
  ]);

  await db.UserGroup.upsert({
    role: 2,
    groupId: "Cce9702dfcdf2824f50f89fd9054546c0",
    userId: "U89ff8d6dbcf4c745ccbdd17e97d1c714"
  });
}

export async function init() {
  try {
    defineModels();
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    await sequelize.sync();
    await defaultDBValue();

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

export default db;
