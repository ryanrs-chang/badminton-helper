import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import views from "koa-views";
import koaStatic from "koa-static";
import path from "path";
import * as database from "./database";

import { LoggerFilename } from "./logger";
const logger = LoggerFilename(__filename);

import { channelAccessToken, channelSecret, path as api_path } from "./config";
import bodyParser from "koa-bodyparser";

import messageRouter from "./controllers";
import { responseTime } from "./middleware";
import { RouterConfig } from "koa-line-message-router/dist/lib/types";

import liffRouter from "./liff";

const config: RouterConfig = {
  channelAccessToken,
  channelSecret,
  path: api_path
};

const app = new Koa();

app.use(responseTime());

app.use(
  koaStatic(path.join(__dirname, "/public"), {
    maxage: 31557600
  })
);

app.use(
  views(path.join(__dirname, "../views"), {
    extension: "hbs",
    map: { hbs: "handlebars" }
  })
);

app.use(bodyParser());

app.use(liffRouter.routes());

app.use(messageRouter.lineSignature(config));
app.use(messageRouter.routes(config));

async function start() {
  try {
    await database.init();
    app.context.$db = database;
    const port = process.env.PORT || 3000;
    app.listen(port);
    logger.info("listening on Port:", port);
  } catch (error) {
    logger.info(error);
    process.exit();
  }
}

start();
