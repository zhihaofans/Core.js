const VERSION = 2;

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

function getArrayLastItem(array) {
  if (this.hasArray(array)) {
    return array[array.length - 1];
  } else {
    return undefined;
  }
}

function hasArray(data) {
  return Array.isArray(data) && data.length > 0;
}

function isArray(data) {
  return Array.isArray(data);
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
  autoAddZero(number) {
    const str = new String(number),
      num = new Number(number);
    return num >= 10 ? str : `0${str}`;
  }
  timestampToTimeStr(timestamp) {
    const time = new Date(timestamp),
      month = this.autoAddZero(time.getMonth() + 1),
      day = this.autoAddZero(time.getDate()),
      hours = this.autoAddZero(time.getHours()),
      minutes = this.autoAddZero(time.getMinutes()),
      seconds = this.autoAddZero(time.getSeconds());
    return `${time.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

function isFile(filePath) {
  return !$file.isDirectory(filePath);
}

function isFileExist(filePath) {
  return $file.exists(filePath) && !$file.isDirectory(filePath);
}

function getPathLevelsList(path) {
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
function getUrlParameters(URL) {
  try {
    return JSON.parse(
      '{"' +
        decodeURI(URL.split("?")[1])
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}'
    );
  } catch (error) {
    $console.error(error);
    return undefined;
  }
}
function mkdirs(dir) {
  const pathLevelsList = getPathLevelsList(dir);
  if (pathLevelsList == undefined || pathLevelsList.length == 0) {
    return false;
  }
  var nextPath = "";
  pathLevelsList.map(path => {
    nextPath += path + "/";
    $console.info(nextPath, $file.mkdir(nextPath));
  });
  return $file.exists(dir) && $file.isDirectory(dir);
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
    } else if (this.isSafari()) {
      return $context.safari ? $context.safari.items.location.href : undefined;
    } else {
      return undefined;
    }
  }
  getText() {
    return $context.text;
  }
}

function hasString(string) {
  return isString(string) && string.length > 0;
}

function isString(string) {
  return typeof string === "string";
}
function startsWith(string, keyword) {
  if (!hasString(string) || !hasString(keyword)) {
    return false;
  }
  return string.startsWith(keyword);
}
function startsWithList(string, list) {
  if (!hasString(string) || !isArray(list)) {
    return false;
  }
  list.map(item => {
    if (string.startsWith(item)) {
      return true;
    }
  });
  return false;
}

function toast(success, successText, errorText) {
  success === true ? $ui.success(successText) : $ui.error(errorText);
}

function startLoading() {
  $ui.loading(true);
}

function stopLoading() {
  $ui.loading(false);
}

function quicklookUrl(url) {
  return new Promise((resolve, reject) => {
    $quicklook.open({
      url,
      handler: resolve
    });
  });
}

function copy(text) {
  return new Promise((resolve, reject) => {
    $clipboard.text = text;
    resolve(text);
  });
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paste() {
  return $clipboard.text;
}

function showView(viewData) {
  $ui.window === undefined ? $ui.render(viewData) : $ui.push(viewData);
}

function getLinks(text) {
  return $detector.link(text) || [];
}

function isLink(text) {
  const links = getLinks(text);
  return links.length == 1 && text === links[0];
}

function isEmpty(content) {
  $console.info({
    content,
    type: typeof content
  });
  if (content === undefined || content === null) {
    return true;
  } else if ((isString(content) || isArray(content)) && content.length === 0) {
    return true;
  } else {
    return false;
  }
}

function inputText(text, placeholder) {
  return new Promise((resolve, reject) => {
    $input.text({
      type: $kbType.text,
      placeholder,
      text,
      handler: text => {
        resolve(text);
      }
    });
  });
}

function booleanToText(_boolean, trueText, falseText) {
  return _boolean === true ? trueText : falseText;
}

function toInt(data) {
  return Number.parseInt(data);
}

function isNumber(data) {
  return typeof data === "number";
}
const dateTime = new Datetime();
const share = new Share();

function isActionEnv() {
  return $app.env == $env.action;
}

function isAppEnv() {
  return $app.env == $env.app;
}

function isKeyboardEnv() {
  return $app.env == $env.keyboard;
}

function isContextEnv() {
  return $app.env == $env.action;
}

function isSafariEnv() {
  return $app.env == $env.safari;
}

function isWidgetEnv() {
  return $app.env == $env.widget;
}

function getMatrixItem(id, idx) {
  return $ui.get(id).cell(idx);
}

//datetime
function getUnixTime() {
  return new Date().getTime();
}

function getSecondUnixTime() {
  return Math.round(new Date().getTime() / 1000);
}

function getTodayWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
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

function getTomorrowWhatTimeDate({ hours, minutes, seconds, milliseconds }) {
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

function autoAddZero(number) {
  const str = new String(number),
    num = new Number(number);
  return num >= 10 ? str : `0${str}`;
}
function textToBase64Image(text, opts) {
  opts = Object.assign(
    {
      size: 128,
      bgColor: "#2196f3",
      textColor: "#fff",
      fontFamily: "sans-serif",
      fontWeight: "bold"
    },
    opts
  );

  const fontSize = Math.floor(opts.size / (text.length > 1 ? 2 : 1.5));
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${opts.size}" height="${
    opts.size
  }">
    <rect width="100%" height="100%" fill="${opts.bgColor}" rx="${
    opts.size * 0.12
  }" ry="${opts.size * 0.12}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="${opts.fontFamily}" font-weight="${
    opts.fontWeight
  }" font-size="${fontSize}" fill="${opts.textColor}">
      ${escapeXml(text)}
    </text>
  </svg>`.trim();

  const base64 = `data:image/svg+xml;base64` + $text.base64Encode(svg);
  return base64;
}
function timestampToTimeStr(timestamp) {
  const time = new Date(timestamp),
    month = autoAddZero(time.getMonth() + 1),
    day = autoAddZero(time.getDate()),
    hours = autoAddZero(time.getHours()),
    minutes = autoAddZero(time.getMinutes()),
    seconds = autoAddZero(time.getSeconds());
  return `${time.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async function pickDate() {
  return await $picker.date({ props: { mode: 1 } });
}
async function pickTime() {
  return await $picker.date({ props: { mode: 0 } });
}
async function pickDateAndTime() {
  return await $picker.date({ props: { mode: 2 } });
}

function requireNew(fileName, checkFile = false) {
  if (checkFile === true) {
    if (!$file.exists(fileName)) {
      throw "file is not exist";
    }
  }
  const file = require(fileName);
  return new file();
}
module.exports = {
  VERSION,
  $: $ui.get,
  alert: new Alert(),
  base64Encode: $text.base64Encode,
  base64Decode: $text.base64Decode,
  booleanToText,
  copy,
  dateTime,
  debug,
  error,
  file: {
    isFile,
    isFileExist,
    mkdirs
  },
  getAppName: () => $addin.current.displayName,
  getArrayLastItem,
  getLinks,
  getMatrixItem,
  getPathLevelsList,
  getUUID,
  getUnixTime,
  getUrlParameters,
  getSecondUnixTime,
  getShareLink: share.getLink,
  getShareText: share.getText,
  getTimestamp: getUnixTime,
  getTodayWhatTimeDate,
  getTomorrowWhatTimeDate,
  hasString,
  hasArray,
  http: new Http(),
  icon: new Icon(),
  info,
  inputText,
  isActionEnv,
  isAppEnv,
  isArray,
  isContextEnv,
  isDebug: $app.isDebugging == true,
  isEmpty,
  isFile,
  isFileExist,
  isFunction,
  isKeyboardEnv,
  isLink,
  isNumber,
  isSafariEnv,
  isString,
  isWidgetEnv,
  jsboxKit: {
    isActionEnv,
    isAppEnv,
    isContextEnv,
    isKeyboardEnv,
    isSafariEnv,
    isWidgetEnv
  },
  logD: debug,
  logE: error,
  logI: info,
  logW: warn,
  mkdirs,
  paste,
  pickDate,
  pickDateAndTime,
  pickTime,
  quicklookUrl,
  requireNew,
  share,
  showView,
  startLoading,
  startsWith,
  startsWithList,
  stopLoading,
  textToBase64Image,
  timestampToTimeStr,
  toast,
  toInt,
  urlEncode: $text.URLEncode,
  urlDecode: $text.URLDecode,
  warn
};
