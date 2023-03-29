import fs from "fs";
import path from "path";
import load from "./load.js";
import shelljs from "shelljs";
import * as _ from "lodash-es";
import * as file from "./file.js";
import safeSet from "@fengqiaogang/safe-set";
import safeGet from "@fengqiaogang/safe-get";

export const suffix = "ts";

export const toXlsx = function(result) {
  const list = [
    ["Code"].concat(result.map(item => _.toUpper(item.language)))
  ];
  const size = result.length;
  const data = safeGet(result, "[0].value");
  for (const key of Object.keys(data)) {
    const array = [ key, data[key] ];
    for(let i = 1; i < size; i++) {
      const temp = safeGet(result, `[${i}].value`);
      array.push(temp[key]);
    }
    list.push(array);
  }
  return list;
};

const diff = function(history, types, name) {
  let status = true;
  for (const type of types) {
    const key = `${type}.${name}`;
    const value = history[key];
    if (value) {
      continue;
    }
    status = false;
    break;
  }
  return status;
}

export const excludeLanguages = function (data = [], history = {}) {
  const [ title ] = data;
  const list = [ title ];
  const types = title.slice(1).map(value => _.toLower(value));
  for (let index = 1, len = data.length; index < len; index++) {
    const item = data[index];
    const [ name ] = item;
    const status = diff(history, types, name);
    if (status) {
      continue;
    }
    list.push(item);
  }
  return list;
}

export const flatten = function(data = {}, prefix = "") {
  const result = {};
  const path = _.compact(_.concat([], prefix.split(".")));
  const keys = Object.keys(data);
  for (const key of keys) {
    const value = data[key];
    const name = path.concat(key);
    if (typeof value === "object") {
      Object.assign(result, flatten(value, name.join(".")));
    } else {
      Object.assign(result, { [name.join(".")]: value });
    }
  }
  return result;
}


export const readFile = function(src) {
  return load(src);
}

export const readFlattenFile = function(src) {
  let dirname = "";
  let list = [];
  if (file.isFile(src)) {
    dirname = path.dirname(src)
    list.push(path.basename(src));
  } else if (file.isDirectory(src)){
    dirname = src;
    list = file.list(src);
  }
  const result = {};
  list.filter(value => !(/^index\.(j|t)s$/i.test(value))).forEach(value => {
    const _src = path.join(dirname, value);
    const name = value.replace(/\.(j|t)s$/i, "").trim();
    if (file.isDirectory(_src)) {
      const data = readFlattenFile(_src);
      safeSet(result, name, data);
    } else {
      const data = readFile(_src);
      safeSet(result, name, data);
    }
  });
  return result;
}




export const createFile = function(name, data = {}) {
  const text = JSON.stringify(data ? data : {}, null, 2);
  const code = `export default ${text};`;
  const title = `${name}.${suffix}`;
  return { name: title, value: code };
}

export const createIndexFile = function(data = {}) {
  const keys = Object.keys(data);
  const value = keys.map(name => `export { default as ${name} } from "./${name}";`).join("\n");
  return { name: `index.${suffix}`, value: value };
}

export const createListFile = function(data = {}, prefix = "") {
  const files = [];
  const index = createIndexFile(data);
  files.push({ name: path.join(prefix, index.name), value: index.value });
  for (const name of Object.keys(data)) {
    const title = path.join(prefix, name);
    const value = safeGet(data, name);
    const item = createFile(title, value);
    files.push(item);
  }
  return files;
}

export const writeFile = function(src, value = "") {
  // 判断文件目录是否存在，不存在则创建
  shelljs.mkdir("-p", path.dirname(src));
  // 写入文件, 如果文件存在则覆盖
  return fs.writeFileSync(src, value);
}