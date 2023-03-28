const isKey = function(value) {
  if (/^-+/i.test(value)) {
    return true;
  }
  return false;
}

const normalize = function(name) {
  name = name.replace(/^-+/i, "").trim();
  let [key, value = ""] = name.split("=").map(item => item.trim());
  if (/^['"]/.test(value)) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

const transform = function(value) {
  if (value && /^true$/.test(value)) {
    return true;
  }
  if (value && /^false$/.test(value)) {
    return false;
  }
  if (value && /^\d+$/.test(value)) {
    return Number(value);
  }
  if (value && /^\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  return value;
}

const argv = function(list) {
  const array = list ? list.slice(2) : process.argv.slice(2);
  let index = 0;
  const data = {};
  do {
    let name = String(array[index] || "").trim();
    if (isKey(name)) {
      let { key, value } = normalize(name);
      data[key] = true;
      if (value) {
        data[key] = transform(value);
        index++;
        continue;
      }
      value = String(array[index + 1] || "").trim();
      if (value && isKey(value)) {
        index++;
        continue;
      }
      if (value) {
        data[key] = transform(value);
        index += 2;
        continue;
      }
    }
    index++;
  } while (index < array.length);
  return data;
};

export default argv;