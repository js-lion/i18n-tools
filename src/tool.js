import path from "path";
import xlsx from "node-xlsx";
import * as util from "./util.js";
import { getEnv } from "./env.js";
import { ReadHistory ,ReadLanguages, ParseLanguages} from "./result.js";
import safeGet from "@fengqiaogang/safe-get";

// 导出双语文件
export const exportFile = function(name, title) {
  if (!name) {
    return exportFile(`langs_${Date.now()}.xlsx`);
  }
  let src;
  if (path.isAbsolute(name)) {
    src = path.normalize(name);
  } else {
    const env = getEnv();
    src = path.join(env.root, name);
  }
  const result = ReadLanguages();
  const value = util.toXlsx(result);
  const data = util.excludeLanguages(value, ReadHistory());
  const option = { 
    options: {},
    name: title ? title : "中英文文案", 
    data: data,
  };
  const content = xlsx.build([option]);
  // 文件写入
  util.writeFile(src, content);
  console.log("Exported Languages success. file src = %s", src);
}

// 导入双语文件
export const importFile = function(file) {
  const env = getEnv();
  if (!path.isAbsolute(file)) {
    file = path.join(env.root, file);
  }
  const fromFile = xlsx.parse(file);
  const content = safeGet(fromFile, "[0].data") || [];
  const files = ParseLanguages(content);
  for (const file of files) {
    // 拼接双语文件路径
    const src = path.join(env.langs, file.name);
    // 文件写入
    util.writeFile(src, file.value);
  }
  console.log("Import Languages success");
}