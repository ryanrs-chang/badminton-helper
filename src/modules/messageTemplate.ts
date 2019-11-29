import line from "@line/bot-sdk";
import { UserGroupInstance } from "../models/user_group";
import { GameInstance } from "../models/game";
import { UserInstance } from "../models/user";

/**
 * Help Message: user say help!!
 *
 */
export function HelloMessage(): line.Message {
  return {
    type: "text",
    text: "Hello Message"
  };
}

/**
 * Help Message: user say help!!
 *
 */
export function HelpMessage(): line.TemplateMessage {
  return {
    type: "template",
    altText: "help list",
    template: {
      type: "buttons",
      title: "help list",
      text: "Help List",
      actions: [
        {
          type: "postback",
          label: "Game List",
          data: "action=game_list"
        },
        {
          type: "postback",
          label: "Group List",
          data: "action=group_list"
        }
      ]
    }
  } as line.TemplateMessage;
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
  groups.forEach((group, index) => {
    message += `${index + 1}. ${group.groupId}\n`;
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

export function SignupMessage(
  title: string,
  users: UserInstance[]
): line.Message {
  let message = title || "";

  message += "\n";

  users.forEach((user, index) => {
    message += `${index + 1}.${user.display_name}\n`;
  });

  return {
    type: "text",
    text: message
  };
}
