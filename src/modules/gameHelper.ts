import * as line from "@line/bot-sdk";
import database from "../database";
import { GameInstance, GameAttributes } from "../models/game";
import { UserInstance } from "../models/user";
import { UserGameInstance } from "../models/userGame";
import { Status } from "../config";
import sequelize = require("sequelize");
import isArray from "lodash/isArray";

export async function getLatestGameByGroup(
  groupId: string
): Promise<GameInstance> {
  const game = await database.Game.findOne({
    where: {
      groupId,
      status: Status.Normal
    },
    order: [["createdTime", "DESC"]]
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
    //
    // order by updated time of UserGmae
    order: [[database.User, database.UserGame, "updatedTime", "ASC"]],
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
  user: UserInstance | UserInstance[],
  game: GameInstance
): Promise<GameInstance> {
  let userSet = [];
  if (isArray(user)) {
    userSet = user;
  } else {
    userSet = [user];
  }

  await Promise.all(
    userSet.map(u => {
      return database.UserGame.upsert({
        userId: u.id,
        gameId: game.id,
        status: Status.Normal,
        updated_time: new Date()
      });
    })
  );

  return await findGameWithMembers(game);
}

export async function removeUserFromGame(
  user: UserInstance,
  game: GameInstance
): Promise<GameInstance> {
  const updated = await database.UserGame.update(
    { status: Status.Deleted, updatedTime: new Date() },
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
    startTime: new Date(),
    groupId: groupId
  });

  return game;
}

/**
 * end specific game
 * @param game game instance
 */
export async function endGame(game: GameInstance): Promise<GameInstance> {
  await database.Game.update(
    {
      status: Status.Completed,
      endTime: new Date()
    },
    { where: { id: game.id } }
  );

  return await findGameWithMembers(game);
}
