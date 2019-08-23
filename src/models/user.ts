import * as Sequelize from "sequelize";

export interface UserAttributes {
  id?: string;
  display_name: string;
  picture_url: string;
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserAttributes> = {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
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
