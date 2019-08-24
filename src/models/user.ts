import * as Sequelize from "sequelize";
import { UserType } from "../config";

export interface UserAttributes {
  id?: string;
  display_name: string;
  picture_url: string;
  type?: UserType;
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserAttributes> = {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    type: {
      type: Sequelize.ENUM(UserType.Undefined, UserType.Line),
      defaultValue: UserType.Undefined
    },
    display_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    picture_url: {
      type: Sequelize.STRING,
      allowNull: false
    }
  };
  return sequalize.define<UserInstance, UserAttributes>("user", attributes);
};
