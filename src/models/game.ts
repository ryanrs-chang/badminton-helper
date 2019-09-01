import * as Sequelize from "sequelize";
import { Status } from "../config";
import { UserInstance } from "./user";
export interface GameAttributes {
  id?: string;
  description: string;
  status?: Status;
  createdTime?: Date;
  startTime?: Date;
  endTime?: Date;
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
      type: Sequelize.ENUM(Status.Normal, Status.Deleted, Status.Completed),
      defaultValue: Status.Normal
    },
    createdTime: {
      type: Sequelize.DATE,
      defaultValue: new Date()
    },
    startTime: {
      type: Sequelize.DATE,
      allowNull: true
    },
    endTime: {
      type: Sequelize.DATE,
      allowNull: true
    }
  };
  return sequalize.define<GameInstance, GameAttributes>("game", attributes);
};
