import Context from "koa-line-message-router/dist/lib/context";
import { GameInstance } from "./models/game";
import { UserInstance } from "./models/user";
export type LatestGameContext = Context & {
  latestGame: GameInstance;
};

export type UsersContext = Context & {
  users: UserInstance[];
};
