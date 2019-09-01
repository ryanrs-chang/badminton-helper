import * as Sequelize from "sequelize";
import { Role } from "../config";

export interface RoleAttributes {
  id?: number;
  description: string;
  level: Role;
}

export type RoleInstance = Sequelize.Instance<RoleAttributes> & RoleAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<RoleAttributes> = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    description: {
      type: Sequelize.STRING
    },
    level: {
      type: Sequelize.INTEGER
    }
  };
  return sequalize.define<RoleInstance, RoleAttributes>("role", attributes);
};
