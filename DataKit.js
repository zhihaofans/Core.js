const VERSION = 1;

function showView(viewData) {
  $ui.window === undefined ? $ui.render(viewData) : $ui.push(viewData);
}
class KeychainKit {
  constructor(domain) {
    this.DOMAIN = domain;
  }
  set(key, value) {
    const succeeded = $keychain.set(key, value, this.DOMAIN);
    return succeeded;
  }
  get(key) {
    const item = $keychain.get(key, this.DOMAIN);
    return item;
  }
  remove(key) {
    const succeeded = $keychain.set(key, this.DOMAIN);
    return succeeded;
  }
  clear() {
    const succeeded = $keychain.clear(this.DOMAIN);
    return succeeded;
  }
  getKeyList() {
    const keys = $keychain.keys(this.DOMAIN);
    return keys;
  }
  getItemList() {
    return this.getKeyList().map(k => this.get(k));
  }
}
class FileView {
  constructor() {
    this.DIR = "";
    this.FILE_LIST = [];
  }
  init() {}
  showFileList() {
    showView({
      props: {
        title: "文件管理器"
      },
      views: [
        {
          type: "list",
          props: {
            id: "DataKit_fileList",
            data: []
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
            }
          }
        }
      ]
    });
  }
}
class DataView {
  constructor() {}
  init() {
    showView({
      props: {
        title: "DataKit管理器"
      },
      views: [
        {
          type: "list",
          props: {
            data: ["文件"]
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const { section, row } = indexPath;
              switch (row) {
                case 0:
                  const filev = new FileView();
                  filev.init();
                  break;
                default:
              }
            }
          }
        }
      ]
    });
  }
}
module.exports = {
  VERSION,
  DataView,
  KeychainKit
};
