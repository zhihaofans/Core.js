const APP_KERNEL_VERSION = 2;
class AppKernel {
  constructor({ appId, debug, l10nPath }) {
    this.START_TIME = new Date().getTime();
    this.DEBUG = debug === true; //$app.isDebugging;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.AppInfo.id = appId;
    if (this.DEBUG) {
      $console.info("AppKernel.init", this.AppInfo);
    }
    this.l10n(l10nPath);
    if (this.DEBUG) {
      $console.info(`appName:${this.AppInfo.name}`);
      $console.info(`appId:${this.AppInfo.id}`);
      $console.info(`debug:${this.DEBUG}`);
    }
  }
  l10n(l10nPath) {
    if ($file.exists(l10nPath) && !$file.isDirectory(l10nPath)) {
      const l10nRes = require(l10nPath),
        result = {};
      Object.keys(l10nRes).map(key => {
        const thisItem = l10nRes[key];
        Object.keys(thisItem).map(lang => {
          if (!result[lang]) {
            result[lang] = {};
          }
          result[lang][key] = thisItem[lang];
        });
      });
      $app.strings = result;
    } else {
      $console.error("AppKernel:l10nPath is not exist");
    }
  }
}
class AppUtil {
  constructor() {}
  isAppEnv() {
    return $app.env == $env.app;
  }
  isActionEnv() {
    return $app.env == $env.action;
  }
  isContextEnv() {
    return $app.env == $env.action;
  }
  isSafariEnv() {
    return $app.env == $env.safari;
  }
  isKeyboardEnv() {
    return $app.env == $env.keyboard;
  }
  isWidgetEnv() {
    return $app.env == $env.widget;
  }
}
class GlobalStorage {
  constructor(globalId) {
    this.GLOBAL_ID = globalId;
  }
  getKeychain(key) {
    return $keychain.get(key, this.GLOBAL_ID);
  }
  removeKeychain(key) {
    return $keychain.remove(key, this.GLOBAL_ID);
  }
  setKeychain(key, value) {
    return $keychain.set(key, value, this.GLOBAL_ID);
  }
  getCache(key) {
    return $cache.get(`${this.GLOBAL_ID}.${key}`);
  }
  removeCache(key) {
    return $cache.remove(`${this.GLOBAL_ID}.${key}`);
  }
  setCache(key, value) {
    return $cache.set(`${this.GLOBAL_ID}.${key}`, value);
  }
}
module.exports = {
  APP_KERNEL_VERSION,
  AppKernel,
  AppUtil,
  GlobalStorage
};
