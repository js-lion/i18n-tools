import path from "path";
import load from "./load.js";
import shelljs from "shelljs";
import * as _ from "lodash-es";
import { getEnv } from "./env.js";
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

export const normalize = function(result) {
  const list = [
    ["Code"].concat(result.map(item => _.toUpper(item.language)))
  ];
  const data = safeGet(result, "[0].value")
  for (const key of Object.keys(data)) {
    const value = [
      key,
      data[key]
    ];
    for(let i = 1, len = result.length; i < len; i++) {
      const temp = safeGet(result, `[${i}].value`);
      value.push(temp[key]);
    }
    list.push(value);
  }
  return list;
};

const read = function(languages, path = []) {
  const result = {};
  path = _.compact(_.concat([], path));
  const keys = Object.keys(languages);
  for (const key of keys) {
    const value = languages[key];
    const name = path.concat(key);
    if (typeof value === "object") {
      Object.assign(result, read(value, name));
    } else {
      Object.assign(result, { [name.join(".")]: value });
    }
  }
  return result;
};

export const ReadLanguages = function() {
  const files = [];
  const env = getEnv();
  const langs = Languages();
  for (const type of langs) {
    const dir =  path.join(env.langs, type);
    const ls = shelljs.cd(dir).exec(`ls`, { silent: true }).toString();
    const list = ls.trim().split("\n").map(value => value.trim());
    const result = {};
    list.filter(value => !(/^index\.(j|t)s$/i.test(value))).forEach(value => {
      const data = load(path.join(dir, value));
      const name = value.replace(/\.(j|t)s$/i, "").trim();
      safeSet(result, name, data);
    });
    files.push({ language: type, value: read(result) });
  }
  return files;
};

export const ParseLanguages = function(result) {
  const data = {};
  // 读取当前双语文案
  for (const item of ReadLanguages()) {
    const type = item.language;
    for (const key of Object.keys(item.value)) {
      const value = item.value[key];
      safeSet(data, [type, key], value);
    }
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

  const files = [];
  const suffix = "ts";
  // 生成双语文件代码
  for (const type of keys) {
    const list = Object.keys(data[type]);
    const index = list.map(name => `export { default as ${name} } from "./${name}";`).join("\n");
    files.push({ name: path.join(type, `index.${suffix}`), value: index });
    for (const name of list) {
      const value = safeGet(data, [type, name]);
      const text = JSON.stringify(value, null, 2);
      const code = `export default ${text};`;
      const title = path.join(type, `${name}.${suffix}`);
      files.push({ name: title, value: code });
    }
  }
  return files;
}