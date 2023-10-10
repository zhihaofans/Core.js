const DB_DOMAIN = "zhihaofans.clipboardlib",
  DB_KEY = {
    data: "clip_data"
  };
const $ = require("$"),
  { Storage } = require("Next"),
  Keychain = new Storage.Keychain(DB_DOMAIN);
function logE(message) {
  $console.error("ClipboardLib", message);
}
class ClipboardLib {
  constructor() {}
  getList() {
    const dataStr = Keychain.getValue(DB_KEY.data) || "[]";
    try {
      return JSON.parse(dataStr);
    } catch (error) {
      $console.error(error);
      return [];
    }
  }
  setList(list) {
    if ($.isArray(list)) {
      try {
        return Keychain.setValue(DB_KEY.data, JSON.parse(list));
      } catch (error) {
        $console.error(error);
        logE(error.message);
        return false;
      }
    } else {
      logE("setList:is not array");
      return false;
    }
  }
  addItem(text) {
    const oldList = this.getList();
    oldList.push(text);
    this.setList(oldList);
  }
  removeData() {
    return Keychain.remove(DB_KEY.data);
  }
}
module.exports = ClipboardLib;
