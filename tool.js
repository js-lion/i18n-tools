import shelljs from "shelljs";
import argv from "./src/argv.js";
import * as tool from "./src/tool.js";

const main = function() {
  const option = argv();
  // 导出
  if (option.export) {
    const value = option.export;
    const title = option.title || null;
    if (typeof value === "string") {
      tool.exportFile(value, title);
    } else {
      tool.exportFile(null, title);
    }
  }
  // 导入
  if (option.import) {
    const value = option.import;
    if (typeof value === "string") {
      tool.importFile(value);
    }
  }
  shelljs.exit();
}

main();