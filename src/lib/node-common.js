import fs from "fs";

export const checkFolderExists = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}