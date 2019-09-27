import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);

import MessageRouter, { fromUser, fromGroup } from "koa-line-message-router";

import { updateUserWhenMessageEvent } from "../modules/userHelper";
import { HelpMessage } from "../modules/messageTemplate";

// load controller
import joinGroup from "./joinGroup";
import updateUserInfoInJoinGroup from "./updateUserInfoWhenJoinGroup";
import groupList from "./groupList";
import gameList from "./gameList";
import gameCreate from "./gameCreate";
import * as signupGame from "./signupGame";

// load middleware
import {
  registerUserToGroup,
  hasLatestGame,
  handleMutipleUser
} from "../middleware";

const router = new MessageRouter();

router.use(async (ctx, next) => {
  await next();
});

router.message(async (ctx, next) => {
  await updateUserWhenMessageEvent(ctx.client, ctx.event);
  await next();
});

/**
 * API List
 */
router.message("help", fromUser(), ctx => ctx.$replyMessage(HelpMessage()));

/**
 * get Group list
 */
router.message(/^group_list$/, fromUser(), groupList);

/*
 * say 'game_list' <group_id>
 */
router.message(/^game_list: /g, fromUser(), gameList);

/**
 * say 'game_create'
 */
router.message(/^game_create: /g, fromUser(), gameCreate);

/**
 * handle +1 event
 */
router.message(
  /^\+1$/g,
  fromGroup(),
  registerUserToGroup(),
  signupGame.increment
);

/**
 * handle -1 event
 */
router.message(
  /^\-1$/g,
  fromGroup(),
  registerUserToGroup(),
  signupGame.decrement
);

/**
 * multiple add user
 *   #<name 1>;<name 2>;<name 3>;<name 4>;+1
 */
router.message(
  /^\#(.+;?)+\+1$/g,
  fromGroup(),
  registerUserToGroup(),
  hasLatestGame(),
  handleMutipleUser(),
  async ctx => {}
);

/**
 * handle #<name>+1 event
 */
router.message(
  /^\#.+\+1$/g,
  fromGroup(),
  registerUserToGroup(),
  hasLatestGame(),
  signupGame.helpTheOtherIncrement
);

/**
 * handle #<name>-1 event
 */
router.message(
  /^\#.+\-1$/g,
  fromGroup(),
  registerUserToGroup(),
  hasLatestGame(),
  signupGame.helpTheOtherDecrement
);

/**
 * handle finish game
 */
router.message(
  /^本週零打報名結束.*/g,
  fromGroup(),
  registerUserToGroup(),
  hasLatestGame(),
  signupGame.gameIsOver
);

router.message(
  /^本週零打開始報名.*/g,
  fromGroup(),
  registerUserToGroup(),
  hasLatestGame(game => {
    if (game) {
      return {
        type: "text",
        text: "還有零打報名尚未結束"
      };
    }
  }),
  signupGame.gameStart
);

/**
 * handle join event
 */
router.join(fromGroup(), joinGroup);

/**
 * handle 'member join' event
 */
router.memberJoined(fromGroup(), updateUserInfoInJoinGroup);

router.use(async ctx => {
  logger.info("not found function handle this event");
});

export default router;
