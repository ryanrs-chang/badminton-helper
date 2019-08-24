import line from "@line/bot-sdk";
import { UserGroupInstance } from "../models/user_group";
import { GameInstance } from "../models/game";

/**
 * Help Message: user say help!!
 *
 */
export function HelpMessage(): line.Message {
  let message = "";

  message += `Help List\n`;

  message += `group list\n`;
  message += `game_list: <group_id>\n`;

  return {
    type: "text",
    text: message
  };
}

export function GroupsMessage(groups: UserGroupInstance[]): line.Message {
  let message = "";

  if (groups.length === 0) {
    return {
      type: "text",
      text: "no manage any group"
    };
  }

  message += `Your management Group List\n`;
  groups.forEach(group => {
    message += `${group.groupId}\n`;
  });

  return {
    type: "text",
    text: message
  };
}

export function GamesMessage(games: GameInstance[]): line.Message {
  let message = "";

  if (games.length === 0) {
    return {
      type: "text",
      text: "no game"
    };
  }

  message += `Game List\n`;
  games.forEach(game => {
    message += `${game.description}\n`;
  });

  return {
    type: "text",
    text: message
  };
}

export function CreateGameMessage(game: GameInstance): line.Message {
  let message = "create failed!";
  if (game) {
    message = `create ${game.description} game is successful`;
  }

  return {
    type: "text",
    text: message
  };
}
