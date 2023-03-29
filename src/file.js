import fs from "fs";
import path from "path";
import shelljs from "shelljs";

export const isExists = function(src) {
  if (fs.existsSync(src)) {
    return true;
  }
  return false;
}

export const isFile = function(src) {
  try {
    if (isExists(src)) {
      const stat = fs.statSync(src);
      if (stat.isFile()) {
        return true;
      }
    }
  } catch (error) {
    // todo
  }
  return false;
}

export const isDirectory = function(src) {
  try {
    if (isExists(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        return true;
      }
    }
  } catch (error) {
    // todo
  }
  return false;
}

export const list = function (src) {
  if (isDirectory(src)) {
    const ls = shelljs.cd(src).exec(`ls`, { silent: true }).toString();
    return ls.trim().split("\n").map(value => value.trim());
  }
  return [];
}