import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import * as database from "./database";
import { channelAccessToken, channelSecret, path } from "./config";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

import messageRouter from "./controllers";
import { RouterConfig } from "koa-line-message-router/dist/lib/types";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path
};

const app = new Koa();
const router = new Router();

app.use(async function(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`response time: ${ms}ms`);
  ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(bodyParser());
app.use(messageRouter.lineSignature(config));
app.use(messageRouter.routes(config));

async function start() {
  try {
    await database.init();
    app.context.$db = database;
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

start();
