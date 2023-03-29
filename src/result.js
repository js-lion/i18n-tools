import path from "path";
import load from "./load.js";
import shelljs from "shelljs";
import * as _ from "lodash-es";
import { getEnv } from "./env.js";
import * as util from "./util.js";
import safeSet from "@fengqiaogang/safe-set";
import safeGet from "@fengqiaogang/safe-get";

export const Languages = function() {
  const env = getEnv();
  const language = env.language;
  const keys = Object.values(language);
  const list = _.compact([language.auto]);
  for (const value of keys) {
    if (list.includes(value)) {
      continue;
    }
    list.push(value);
  }
  return list;
};

export const ReadHistory = function() {
  const result = {};
  const env = getEnv();
  shelljs.mkdir("-p", env.history);
  for (const type of Languages()) {
    const src =  path.join(env.history, `${type}.${util.suffix}`);
    const data = load(src) || {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      result[`${type}.${key}`] = value;
    }
  }
  return result;
}

export const WriteHistory = function(data) {
  const env = getEnv();
  for (const type of Languages()) {
    const value = util.flatten(safeGet(data, type));
    const item = util.createFile(type, value);
    const src = path.join(env.history, item.name);
    util.writeFile(src, item.value);
  }
}

export const ReadLanguages = function() {
  const files = [];
  const env = getEnv();
  for (const type of Languages()) {
    const dir =  path.join(env.langs, type);
    const result = util.readFlattenFile(dir);
    files.push({ language: type, value: util.flatten(result) });
  }
  return files;
};

export const ParseLanguages = function(result) {
  const data = {};
  // 读取当前双语文案
  for (const item of ReadLanguages()) {
    _.each(item.value, (value, key) => safeSet(data, [item.language, key], value));
  }

  // 解析导入的文件，整理双语文案
  let [[, ...keys], ...list] = result;
  keys = keys.map(value => _.toLower(value));

  for (const item of list) {
    const [key, ...array] = item;
    // 覆盖双语文案
    for (let index = 0, len = keys.length; index < len; index++) {
      const type = keys[index];
      const value = array[index] || "";
      safeSet(data, [type, key], value);
    }
  }

  // 更新缓存中双语文案
  WriteHistory(data);

  // 生成双语文件代码
  const files = [];
  for (const type of keys) {
    const list = util.createListFile(data[type], type);
    files.push(...list);
  }
  return files;
}