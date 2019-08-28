import * as Sequelize from "sequelize";
import { Status } from "../config";
interface UserGameAttributes {
  userId?: string;
  gameId?: string;
  status?: Status;
  updated_time?: Date;
}

export type UserGameInstance = Sequelize.Instance<UserGameAttributes> &
  UserGameAttributes;

export default (sequalize: Sequelize.Sequelize) => {
  const attributes: SequelizeAttributes<UserGameAttributes> = {
    status: {
      type: Sequelize.ENUM(Status.Normal, Status.Deleted),
      defaultValue: Status.Normal
    },
    updated_time: {
      type: Sequelize.DATE,
      defaultValue: new Date()
    }
  };
  return sequalize.define<UserGameInstance, UserGameAttributes>(
    "user_game",
    attributes
  );
};
