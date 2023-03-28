import fs from "fs";
import path from "path";
import xlsx from "node-xlsx";
import { getEnv } from "./env.js";
import { ReadLanguages, normalize} from "./result.js";

export const exportFile = function(name, title) {
  if (!name) {
    return exportFile(`langs_${Date.now()}.xlsx`);
  }
  let src;
  if (path.isAbsolute(name)) {
    src = path.posix.normalize(name);
  } else {
    const env = getEnv();
    src = path.posix.join(env.root, name);
  }
  const result = ReadLanguages();
  const option = { 
    options: {},
    name: title ? title : "中英文文案", 
    data: normalize(result),
  };
  const content = xlsx.build([option]);
  fs.writeFileSync(src, content);
  console.log("Exported Languages success. file src = %s", src);
}
