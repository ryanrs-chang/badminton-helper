import Sequelize, { Model } from "sequelize";
import path from "path";
import fs from "fs";
import { DatabaseInstance } from "./type";
/**
 * rename to no Bottom line
 * @param filename filename
 */
export function rename(filename: string): string {
  let newname = filename;

  if (typeof newname !== "string") return "";

  newname = newname.charAt(0).toUpperCase() + newname.slice(1);
  const regex = /\_+[a-z]+/g;
  return newname.replace(
    regex,
    match => match.charAt(1).toUpperCase() + match.slice(2)
  );
}

export default function importModels(db: DatabaseInstance): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const directoryPath = path.join(__dirname, "../models");
    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        reject(err);
      }

      const regex = /\.(js|ts)$/;
      files = files.filter(file => regex.test(file));

      for (let file of files) {
        const newname: any = rename(file.replace(regex, ""));
        const model = await import(`${directoryPath}/${file}`);
        const modelInstance = model.default(db.sequelize) as Model<
          any,
          any,
          any
        >;

        if (modelInstance.associate) {
          modelInstance.associate(db);
        }

        db[newname] = modelInstance;
      }

      resolve();
    });
  });
}
