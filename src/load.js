import fs from "fs";
import { VM } from "vm2";
import shell from "shelljs";

const cat = function(src) {
  return shell.cat(src).toString().trim();
}

const run = function(code) {
  const text = String(code).trim().replace(/;$/, "").trim();
  const vm = new VM();
  const value = `(function(){ return (${text}); })()`;
  return vm.run(value);
}

const json = function(src) {
  return run(cat(src));
}

const code = function(src) {
  const text = cat(src).trim().replace("export default", "");
  return run(text);
}

const load = function(src) {
  if (fs.existsSync(src)) {
    if (/\.json$/i.test(src)) {
      return json(src);
    }
    if (/\.(j|t)s$/i.test(src)) {
      return code(src);
    }
  }
}

export default load;