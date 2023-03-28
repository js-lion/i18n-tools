import fs from "fs";
import path from "path";
import shell from "shelljs";
import xlsx from "node-xlsx";
import { getEnv } from "./env.js";
import { ReadLanguages, ParseLanguages, normalize} from "./result.js";
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
  const option = { 
    options: {},
    name: title ? title : "中英文文案", 
    data: normalize(result),
  };
  const content = xlsx.build([option]);
  fs.writeFileSync(src, content);
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
    // 判断文件目录是否存在，不存在则创建
    shell.mkdir("-p", path.dirname(src));
    // 写入文件, 如果文件存在则覆盖
    fs.writeFileSync(src, file.value);
  }
}