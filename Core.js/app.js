const START_TIME = new Date().getTime();
class UserUUID {
  constructor() {
    this.USER_DATA_DIR = "shared://zhihaofans/Core.js/";
    this.KEYCHAIN_DOMAIN = "zhihaofans.corejs";
    this.init();
  }
  init() {
    $file.mkdir("shared://zhihaofans/");
    $console.error(this.USER_DATA_DIR);
    $file.mkdir(this.USER_DATA_DIR);
    this.UUID = this.getDeviceUUID();
    this.saveUserData();
  }
  saveUserData() {
    $keychain.set(this.KEYCHAIN_DOMAIN, "uuid", this.UUID);
    $file.write({
      data: $data({ string: this.UUID }),
      path: this.USER_DATA_DIR + "uuid"
    });
  }
  getDeviceUUID() {
    const UUID =
      $keychain.get(this.KEYCHAIN_DOMAIN, "uuid") ||
      $file.read(this.USER_DATA_DIR + "uuid") ||
      $text.uuid;

    return UUID;
  }
}

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
