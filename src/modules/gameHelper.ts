import * as line from "@line/bot-sdk";
import database from "../database";
import { GameInstance, GameAttributes } from "../models/game";
import { UserInstance } from "../models/user";
import { UserGameInstance } from "../models/user_game";
import { Status } from "../config";
import sequelize = require("sequelize");

export async function getLatestGameByGroup(
  groupId: string
): Promise<GameInstance> {
  const game = await database.Game.findOne({
    where: {
      groupId
    },
    order: [["created_time", "DESC"]]
  });
  return game;
}

export async function findGameWithMembers(
  game: GameInstance
): Promise<GameInstance> {
  return database.Game.findOne({
    where: {
      id: game.id
    },
    include: [
      {
        model: database.User,
        as: "users",
        through: {
          attributes: [],
          where: {
            status: { [sequelize.Op.ne]: Status.Deleted }
          }
        }
      }
    ]
  });
}

/**
 *
 * @param user user instance
 */
export async function addUserToGame(
  user: UserInstance,
  game: GameInstance
): Promise<GameInstance> {
  const updated = await database.UserGame.upsert({
    userId: user.id,
    gameId: game.id,
    status: Status.Normal
  });

  return await findGameWithMembers(game);
}

export async function removeUserFromsGame(
  user: UserInstance,
  game: GameInstance
): Promise<GameInstance> {
  const updated = await database.UserGame.update(
    { status: Status.Deleted },
    { where: { userId: user.id, gameId: game.id } }
  );

  return await findGameWithMembers(game);
}

/**
 *
 * @param groupId
 *
 *
 * TODO: must be filter user
 *
 */
export async function getGameList(
  groupId: string,
  userId: string
): Promise<GameInstance[]> {
  const games = await database.Game.findAll({
    where: {
      groupId: groupId
    }
  });
  return games;
}

/**
 * create new game
 * @param groupId
 * @param gameAttr
 */
export async function createNewGame(groupId: string, gameAttr: GameAttributes) {
  const game = await database.Game.create({
    description: gameAttr.description,
    start_time: new Date(),
    groupId: groupId
  });

  return game;
}
