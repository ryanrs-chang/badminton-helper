import Router from "koa-router";
import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);
import { lineSignature } from "koa-line-message-router/dist";
import { RouterConfig } from "koa-line-message-router/dist/lib/types";
import { channelAccessToken, channelSecret, path as api_path } from "../config";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path: api_path
};

const liffId = process.env.LIFF_ID;

const router = new Router();

router.get("/send-id", ctx => {
  logger.info("call send-id");
  ctx.body = { id: liffId };
});

router.get("/liff", async ctx => {
  logger.info("/liff");
  await ctx.render("index");
});

router.get("/", async ctx => {
  ctx.body = "Line Robot";
});

export default router;
