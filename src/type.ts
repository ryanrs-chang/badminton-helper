import Context from "koa-line-message-router/dist/lib/context";
import { GameInstance } from "./models/game";
export type LatestGameContext = Context & {
  latestGame: GameInstance;
};

export type UsersContext = Context & {
  users: [];
};
