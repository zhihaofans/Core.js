const __VERSION__ = 3,
  object = require("./object");
class Kernel {
  constructor({ appName, useSqlite = false, debug = false }) {
    this.APP_NAME = appName;
    this.DEBUG = debug;
    this.USE_SQLITR = useSqlite;
    this.REG_CORE_MOD_LIST = [];
    if (useSqlite === true) {
      $file.mkdir("/assets/.files/");
      this.DEFAULE_SQLITE_FILE = "/assets/.files/mods.db";
    }
    if (this.isDebug()) {
      this.kernelDebug(`appname:${this.APP_NAME}`);
      this.kernelDebug(`sqlite:${this.USE_SQLITR === true}`);
      this.kernelDebug(`debug:${this.DEBUG === true}`);
    }
  }
  isDebug() {
    this.DEBUG = this.DEBUG === true;
    return this.DEBUG === true;
  }
  kernelDebug(message) {
    if (this.isDebug()) {
      this.info("Kernel", message);
    } else {
      throw new object.UserException({
        name: "Forbidden",
        message: "need enable debug mode",
        source: "developer"
      });
    }
  }
  // console
  info(id, msg) {
    const newMsg = msg ?? id,
      result = msg ? `${id}:${newMsg}` : newMsg;
    $console.info(result);
  }
  warn(id, msg) {
    const newMsg = msg ?? id,
      result = msg ? `${id}:${newMsg}` : newMsg;
    $console.warn(result);
  }
  error(id, msg) {
    const newMsg = msg ?? id,
      result = msg ? `${id}:${newMsg}` : newMsg;
    $console.error(result);
  }
  l10n(l10nRes) {
    const result = {};
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
  }
  registerCoreMod(modCore) {
    if (typeof modCore.run === "function") {
      const needUpdateCore = modCore.checkCoreVersion();
      if (needUpdateCore == 0) {
        this.REG_CORE_MOD_LIST.push(modCore);
      } else {
        this.error("registerCoreMod", "need update mod");
        $ui.alert({
          title: "registerCoreMod",
          message: `need update mod(${needUpdateCore},${modCore.MOD_NAME})`,
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {}
            }
          ]
        });
        throw new object.UserException({
          name: "Mod version",
          message: "register mod failed, need update mod or core.js",
          source: "mod"
        });
      }
    } else {
      this.error("registerCoreMod", "ModCore.run ≠ function");
      throw new object.UserException({
        name: "Bug",
        message: "register mod failed, ModCore.run  is not the function",
        source: "mod"
      });
    }
  }
}
module.exports = {
  __VERSION__,
  Kernel
};
