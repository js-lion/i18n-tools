#!/usr/bin/env node

import fs from "fs";
import path from "path";
import shelljs from "shelljs";

const project = "i18n-tools";

const dirname = path.dirname(process.argv[1]);
const src = [
  path.join(dirname, "..", "tool.js"),
  path.join(dirname, "..", project + "/tool.js"),
];

const start = function (module) {
  const argv = process.argv.slice(2);
  const sehll = `ts-node ${module} ${argv.join(" ")}`;
  return shelljs.exec(sehll);
}

let tool;
for (let i = 0; i < src.length; i++) {
  const value = src[i];
  if (fs.existsSync(value)) {
    try {
      start(value);
      break;
    } catch (error) {
      console.log(error);
      // todo
    }
  }
}

if (!tool) {
  try {
    require(project);
  } catch (error) {
    // todo
  }
}


