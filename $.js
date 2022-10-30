const VERSION = 1;
function debug(message) {
  if ($app.isDebugging == true) {
    info(message);
  }
}
function error(message) {
  $console.error(message);
}
function getUUID() {
  return $text.uuid;
}
function info(message) {
  $console.info(message);
}
function isFunction(func) {
  return func != undefined && typeof func == "function";
}
function warn(message) {
  $console.warn(message);
}

class Alert {
  constructor() {}
  show(title, message) {
    $ui.alert({
      title,
      message
    });
  }
}
class ArrayKit {
  constructor() {}
  getLastItem(array) {
    if (this.hasArray(array)) {
      return array[array.length - 1];
    } else {
      return undefined;
    }
  }
  hasArray(data) {
    return Array.isArray(data) && data.length > 0;
  }
  isArray(data) {
    return Array.isArray(data);
  }
}

class Datetime {
  constructor() {}
  getUnixTime() {
    return new Date().getTime();
  }
  getSecondUnixTime() {
    return Math.round(new Date().getTime() / 1000);
  }
  getTodayWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
    const nowDate = new Date(),
      todayYear = nowDate.getFullYear(),
      todayMonth = nowDate.getMonth() + 1,
      todayDate = nowDate.getDate();
    return new Date(
      todayYear,
      todayMonth - 1,
      todayDate,
      hours || 0,
      minutes || 0,
      seconds || 0,
      milliseconds || 0
    );
  }
  getTomorrowWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
    const nowDate = new Date(),
      todayYear = nowDate.getFullYear(),
      todayMonth = nowDate.getMonth() + 1,
      todayDate = nowDate.getDate();
    return new Date(
      todayYear,
      todayMonth - 1,
      todayDate + 1,
      hours || 0,
      minutes || 0,
      seconds || 0,
      milliseconds || 0
    );
  }
  async pickDate() {
    return await $picker.date({ props: { mode: 1 } });
  }
  async pickTime() {
    return await $picker.date({ props: { mode: 0 } });
  }
  async pickDateAndTime() {
    return await $picker.date({ props: { mode: 2 } });
  }
}
class File {
  constructor() {}
  isFile(filePath) {
    return !$file.isDirectory(filePath);
  }
  isFileExist(filePath) {
    return $file.exists(filePath) && !$file.isDirectory(filePath);
  }
  getPathLevelsList(path) {
    var newPath = path;
    if (path.endsWith("/")) {
      newPath = path.substring(0, path.length - 1);
    }
    if (newPath.startsWith("shared://")) {
      const pathStr = newPath.substring(9, path.length - 1);
      if (pathStr.indexOf("/") < 0) {
        return pathStr;
      }
      const levelsList = pathStr.split("/");
      levelsList[0] = "shared://" + levelsList[0];
      return levelsList;
    } else if (newPath.startsWith("drive://")) {
      const pathStr = newPath.substring(8, newPath.length);
      if (pathStr.indexOf("/") < 0) {
        return pathStr;
      }
      const levelsList = pathStr.split("/");
      levelsList[0] = "drive://" + levelsList[0];
      return levelsList;
    } else if (newPath.startsWith("/")) {
      const pathStr = newPath.substring(1, newPath.length),
        levelsList = pathStr.split("/");
      levelsList[0] = "/" + levelsList[0];
      return levelsList;
    }
    return undefined;
  }
  mkdirs(dir) {
    const pathLevelsList = this.getPathLevelsList(dir);
    if (pathLevelsList == undefined || pathLevelsList.length == 0) {
      return false;
    }
    var nextPath = "";
    pathLevelsList.map(path => {
      nextPath += path + "/";
      $file.mkdir(nextPath);
    });
  }
}
class Http {
  constructor() {}
  async get({ url, header, timeout }) {
    return await $http.get({
      url: url,
      timeout: timeout,
      header: header
    });
  }
  getObjFromCookies(cookies) {
    if (cookies) {
      const cookieResult = {};
      cookies.split(";").map(cookieItem => {
        const itemSplit = cookieItem.trim().split("="),
          itemKey = itemSplit[0],
          itemValve = itemSplit[1];

        cookieResult[itemKey] = itemValve;
      });
      return cookieResult;
    } else {
      return undefined;
    }
  }
  getCookiesStrFromObj(cookiesObj) {
    let cookiesStr = "";
    Object.keys(cookiesObj).map(key => {
      cookiesStr += key + "=" + cookiesObj[key] + ";";
    });
    return cookiesStr;
  }
  async head({ url, header, timeout }) {
    return await $http.request({
      method: "HEAD",
      url: url,
      timeout: timeout,
      header: header
    });
  }
  async post({ url, header, timeout, body }) {
    return await $http.post({
      url: url,
      header: header,
      timeout: timeout,
      body: body
    });
  }
}
class Icon {
  constructor() {
    this.JSBOX_ICON_LIST = {
      SHARE: "023"
    };
  }
  getJsboxIcon(iconId, size, color) {
    return $icon(
      iconId,
      $color(color || "white"),
      $size(size || 20, size || 20)
    );
  }
}
class JSBoxKit {
  constructor() {}
  isActionEnv() {
    return $app.env == $env.action;
  }
  isAppEnv() {
    return $app.env == $env.app;
  }
  isKeyboardEnv() {
    return $app.env == $env.keyboard;
  }
  isContextEnv() {
    return $app.env == $env.action;
  }
  isSafariEnv() {
    return $app.env == $env.safari;
  }

  isWidgetEnv() {
    return $app.env == $env.widget;
  }
}

class NumberKit {
  constructor() {}
  toInt(data) {
    return Number.parseInt(data);
  }
  isNumber(data) {
    return typeof data === "number";
  }
}

class Share {
  constructor() {}
  isAction() {
    return $app.env == $env.action;
  }
  isSafari() {
    return $app.env == $env.safari;
  }
  getLink() {
    if (this.isAction()) {
      return $context.link || undefined;
    }
    if (this.isSafari()) {
      return $context.safari ? $context.safari.items.location.href : undefined;
    }
    return undefined;
  }
  getText() {
    return $context.text;
  }
}

class StringKit {
  constructor() {}
  hasString(string) {
    return this.isString(string) && string.length > 0;
  }
  isString(string) {
    return typeof string === "string";
  }
  startsWithList(string, list) {
    if (this.hasString(string) || !new ArrayKit().isArray(list)) {
      return false;
    }
    list.map(item => {
      if (string.startsWith(item)) {
        return true;
      }
    });
    return false;
  }
}
module.exports = {
  VERSION,
  alert: new Alert(),
  array: new ArrayKit(),
  base64Encode: $text.base64Encode,
  base64Decode: $text.base64Decode,
  dateTime: new Datetime(),
  debug,
  error,
  file: new File(),
  getUUID,
  hasString: new StringKit().hasString,
  http: new Http(),
  icon: new Icon(),
  info,
  isActionEnv: new JSBoxKit().isActionEnv,
  isAppEnv: new JSBoxKit().isAppEnv,
  isArray: new ArrayKit().isArray,
  isContext: new JSBoxKit().isContextEnv,
  isDebug: $app.isDebugging == true,
  isFunction,
  isKeyboardEnv: new JSBoxKit().isKeyboardEnv,
  isNumber: new NumberKit().isNumber,
  isSafariEnv: new JSBoxKit().isSafariEnv,
  isString: new StringKit().isString,
  isWidgetEnv: new JSBoxKit().isWidgetEnv,
  jsboxKit: new JSBoxKit(),
  share: new Share(),
  string: new StringKit(),
  toInt: new NumberKit().toInt,
  urlEncode: $text.URLEncode,
  urlDecode: $text.URLDecode,
  warn
};
