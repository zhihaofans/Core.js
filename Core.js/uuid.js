class UserUUID {
  constructor() {
    this.DEVELOPER_DIR = "shared://zhihaofans/";
    this.DATA_DIR = this.DEVELOPER_DIR + "Core.js/";
    this.KEYCHAIN_DOMAIN = "zhihaofans.corejs";
    this.init();
  }
  init() {
    $file.mkdir(this.DEVELOPER_DIR);
    $file.mkdir(this.DATA_DIR);
    this.UUID = this.getDeviceUUID();
    this.saveUserData();
  }
  saveUserData() {
    $keychain.set(this.KEYCHAIN_DOMAIN, "uuid", this.UUID);
    $file.write({
      data: $data({ string: this.UUID }),
      path: this.DATA_DIR + "uuid"
    });
  }
  getDeviceUUID() {
    const UUID =
      $keychain.get(this.KEYCHAIN_DOMAIN, "uuid") ||
      $file.read(this.DATA_DIR + "uuid") ||
      $text.uuid;

    return UUID;
  }
}
module.exports = {
  UserUUID
};
