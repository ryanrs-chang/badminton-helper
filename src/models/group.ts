import * as Sequelize from "sequelize";

export interface GroupAttributes {
  id?: string;
}

export type GroupInstance = Sequelize.Instance<GroupAttributes> & GroupAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<GroupAttributes> = {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    }
  };
  return sequalize.define<GroupInstance, GroupAttributes>("group", attributes);
};
