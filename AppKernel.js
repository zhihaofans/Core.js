const APP_KERNEL_VERSION = 1;
class AppKernel {
  constructor({ appId, appName, author }) {
    this.DEBUG = $app.isDebugging;
    this.AppInfo = {
      id: appId,
      name: appName,
      author
    };
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
