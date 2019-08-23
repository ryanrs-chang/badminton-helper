import * as Sequelize from "sequelize";
import { Status } from "../config";
import { UserInstance } from "./user";
interface GameAttributes {
  id?: string;
  description: string;
  status?: Status;
  created_time?: Date;
  start_time?: Date;
  end_time?: Date;
  groupId?: string;
  users?: UserInstance[];
}

export type GameInstance = Sequelize.Instance<GameAttributes> & GameAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<GameAttributes> = {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    description: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM(Status.Normal, Status.Deleted),
      defaultValue: Status.Normal
    },
    created_time: {
      type: Sequelize.DATE,
      defaultValue: new Date()
    },
    start_time: {
      type: Sequelize.DATE,
      allowNull: true
    },
    end_time: {
      type: Sequelize.DATE,
      allowNull: true
    }
  };
  return sequalize.define<GameInstance, GameAttributes>("game", attributes);
};
