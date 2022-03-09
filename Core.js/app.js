const START_TIME = new Date().getTime(),
  { UserUUID } = require("./uuid");

class AppKernel {
  constructor({ modDir, l10nPath }) {
    this.userUUID = new UserUUID();
    this.START_TIME = START_TIME;
    this.MOD_DIR = modDir;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.l10n(require(l10nPath));
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
  getLocale() {
    return $app.info.locale;
  }
  getString(id, lang = this.getLocale()) {}
}

module.exports = { AppKernel, version: 1 };
