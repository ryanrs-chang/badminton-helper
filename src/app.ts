import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import * as database from "./database";
import { LoggerFilename } from "./logger";
const logger = LoggerFilename(__filename);

import { channelAccessToken, channelSecret, path } from "./config";
import bodyParser from "koa-bodyparser";

import messageRouter from "./controllers";
import { RouterConfig } from "koa-line-message-router/dist/lib/types";

import liffRouter from "./liff";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path
};

const app = new Koa();

app.use(async function(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`response time: ${ms}ms`);
  ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(liffRouter.routes());

app.use(bodyParser());
app.use(messageRouter.lineSignature(config));
app.use(messageRouter.routes(config));

async function start() {
  try {
    await database.init();
    app.context.$db = database;
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    logger.info(error);
    process.exit();
  }
}

start();
