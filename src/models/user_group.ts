import * as Sequelize from "sequelize";
import { Role } from "../config";

interface UserGroupAttributes {
  userId?: string;
  groupId?: string;
  role?: Role;
}

export type UserGroupInstance = Sequelize.Instance<UserGroupAttributes> &
  UserGroupAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserGroupAttributes> = {
    role: {
      type: Sequelize.INTEGER,
      defaultValue: Role.User
    }
  };
  return sequalize.define<UserGroupInstance, UserGroupAttributes>(
    "user_group",
    attributes
  );
};
