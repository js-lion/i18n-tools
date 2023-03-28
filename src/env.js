/**
 * @file 环境信息
 * @author svon.me@gmail.com
 */

import path from "path";
import process from "process";
import load from "./load.js";
import safeGet from "@fengqiaogang/safe-get";

const getConfig = function(packagePath) {
  const key = "i18n";
  const data = load(packagePath);
  if (safeGet(data, key)) {
    return safeGet(data, key);
  }
  const src = path.join(path.dirname(packagePath), `${key}.config.json`);
  return load(src);
}

export const getEnv = function() {
  const packagePath = safeGet(process, "env.npm_package_json");
  const root = path.dirname(packagePath);
  const config = getConfig(packagePath) || {};
  const option = {
    root: root,
    package: packagePath,
    langs: path.resolve(root, "src/langs"),
    history: path.resolve(root, "src/history"),
    language: {
      auto: "en",
      cn: "cn",
      en: "en"
    },
  };
  if (config.langs) {
    if (path.isAbsolute(config.langs)) {
      option.langs = config.langs;
    } else {
      option.langs = path.resolve(root, config.langs);
    }
  }
  if (config.history) {
    if (path.isAbsolute(config.history)) {
      option.history = config.history;
    } else {
      option.history = path.resolve(root, config.history);
    }
  }
  if (safeGet(config, "language")) {
    option.language = config.language;
  }
  return option;
}