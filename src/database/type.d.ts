import {
  Model,
  Sequelize,
  SequelizeStatic,
  SequelizeStaticAndInstance
} from "sequelize";

import { UserInstance, UserAttributes } from "../models/user";
import { GroupInstance, GroupAttributes } from "../models/group";
import { UserGroupInstance, UserGroupAttributes } from "../models/userGroup";
import { UserGameInstance, UserGameAttributes } from "../models/userGame";
import { RoleInstance, RoleAttributes } from "../models/role";
import { GameInstance, GameAttributes } from "../models/game";

export type DatabaseInstance = {
  sequelize: Sequelize;
  Sequelize: SequelizeStatic;

  User: Model<UserInstance, UserAttributes>;
  Group: Model<GroupInstance, GroupAttributes>;
  UserGroup: Model<UserGroupInstance, UserGroupAttributes>;
  Role: Model<RoleInstance, RoleAttributes>;
  Game: Model<GameInstance, GameAttributes>;
  UserGame: Model<UserGameInstance, UserGameAttributes>;
  [key: string]: any;
};
