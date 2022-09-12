const VERSION = 9,
  $ = require("$"),
  { Storage } = require("Next"),
  WIDGET_FAMILY_SIZE = $widget.family;
class AppKernel {
  constructor({ appId, modDir, l10nPath }) {
    this.START_TIME = new Date().getTime();
    this.$ = $;
    this.Storage = Storage;
    this.MOD_DIR = modDir;
    this.DEBUG = $app.isDebugging;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.AppInfo.id = appId;
    this.DATA_DIR = {
      SHARED: "shared://zhihaofans/CoreJS/",
      ICLOUD: "drive://zhihaofans/CoreJS/",
      LOCAL: "/assets/.files/"
    };
    this.DEFAULE_SQLITE_FILE = this.DATA_DIR.LOCAL + "mods.db";
    $.file.mkdirs(this.DATA_DIR.SHARED);
    $.file.mkdirs(this.DATA_DIR.ICLOUD);
    $.file.mkdirs(this.DATA_DIR.LOCAL);
    this.l10n(require(l10nPath));
    if (this.DEBUG) {
      $.info(`appName:${this.AppInfo.name}`);
      $.info(`appId:${this.AppInfo.id}`);
      $.info(`debug:${this.DEBUG}`);
    }
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
    $.info(`l10n:count=${Object.keys(l10nRes).length}`);
  }
  getLocale() {
    return $app.info.locale;
  }
  getString(id, lang = this.getLocale()) {
    return $app.strings[lang][id];
  }
  setSharedDataDir(path) {
    if (path) {
      this.DATA_DIR.SHARED = path;
      if (!this.DATA_DIR.SHARED.endsWith("/")) {
        this.DATA_DIR.SHARED += "/";
      }
      $.file.mkdirs(this.DATA_DIR.SHARED);
    }
  }
  setIcloudDataDir(path) {
    if (path) {
      this.DATA_DIR.ICLOUD = path;
      if (!this.DATA_DIR.ICLOUD.endsWith("/")) {
        this.DATA_DIR.ICLOUD += "/";
      }
      $.file.mkdirs(this.DATA_DIR.ICLOUD);
    }
  }
  setLocalDataDir(path) {
    if (path) {
      this.DATA_DIR.LOCAL = path;
      if (!this.DATA_DIR.LOCAL.endsWith("/")) {
        this.DATA_DIR.LOCAL += "/";
      }
      $.file.mkdirs(this.DATA_DIR.LOCAL);
    }
  }
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
class ModCore {
  constructor({
    app,
    modId,
    modName,
    icon,
    image,
    version,
    author,
    coreVersion,
    useSqlite,
    allowApi,
    allowContext,
    allowKeyboard,
    allowWidget,
    AllowWidgetSize
  }) {
    this.App = app;
    this.MOD_INFO = {
      ID: modId,
      NAME: modName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: coreVersion,
      DATABASE_ID: modId,
      KEYCHAIN_DOMAIN: `${this.App.AppInfo.id}.mods.${author}.${modId}`,
      KEYCHAIN_DOMAIN_NEW: `${this.App.AppInfo.id}.mods.${author}.${modId}`,
      KEYCHAIN_DOMAIN_OLD: `nobundo.mods.${author}.${modId}`,
      USE_SQLITE: useSqlite == true,
      ICON: icon,
      IMAGE: image,
      NEED_UPDATE: coreVersion != VERSION,
      ALLOW_API: allowApi == true,
      ALLOW_CONTEXT: allowContext == true,
      ALLOW_KEYBOARD: allowKeyboard == true,
      ALLOW_WIDGET: allowWidget == true,
      ALLOW_WIDGET_SIZE: AllowWidgetSize || [0, 1, 2, 3, 5, 6, 7]
    };
    this.SQLITE = this.initSQLite();
    this.Keychain = new Storage.Keychain(this.MOD_INFO.KEYCHAIN_DOMAIN);
  }
  initSQLite() {
    const SQLITE_FILE = this.App.DEFAULE_SQLITE_FILE;
    if (
      this.MOD_INFO.USE_SQLITE &&
      this.MOD_INFO.DATABASE_ID.length > 0 &&
      SQLITE_FILE.length > 0
    ) {
      const SQLite = new Storage.ModSQLite(
        SQLITE_FILE,
        this.MOD_INFO.DATABASE_ID
      );
      SQLite.createTable();
      return SQLite;
    } else {
      return undefined;
    }
  }
}
class ModLoader {
  constructor({ app, modDir, gridListMode = false }) {
    this.App = app;
    this.MOD_DIR = modDir;
    this.$ = $;
    this.MOD_LIST = { id: [], mods: {} };
    this.CONFIG = {
      CONTEXT_MOD_ID: undefined,
      KEYBOARD_MOD_ID: undefined,
      WIDGET_MOD_ID: undefined,
      GRID_LIST_MODE: gridListMode == true
    };
  }
  addMod(modCore) {
    const {
      ALLOW_API,
      ALLOW_CONTEXT,
      ALLOW_KEYBOARD,
      ALLOW_WIDGET
    } = modCore.MOD_INFO;
    if (
      ALLOW_API ||
      ALLOW_CONTEXT ||
      ALLOW_KEYBOARD ||
      ALLOW_WIDGET ||
      $.isFunction(modCore.run) ||
      $.isFunction(modCore.runWidget) ||
      $.isFunction(modCore.runContext) ||
      $.isFunction(modCore.runKeyboard) ||
      $.isFunction(modCore.runApi)
    ) {
      if (
        modCore.MOD_INFO.ID.length > 0 &&
        modCore.MOD_INFO.NAME.length > 0 &&
        modCore.MOD_INFO.AUTHOR.length > 0
      ) {
        const modId = modCore.MOD_INFO.ID;
        if (
          !this.MOD_LIST.id.includes(modId) &&
          this.MOD_LIST.mods[modId] == undefined
        ) {
          this.MOD_LIST.id.push(modId);
          this.MOD_LIST.mods[modId] = modCore;
        } else {
          $console.error(`modId(${modId})已存在`);
        }
      } else {
        $console.error(3);
      }
    } else {
      $console.error(4);
    }
  }
  addModsByList(fileNameList) {
    fileNameList.map(fileName => {
      try {
        const thisMod = require(this.MOD_DIR + fileName);
        this.addMod(new thisMod(this.App));
      } catch (error) {
        $console.error({
          message: error.message,
          fileName,
          name: "ModLoader.addModsByList"
        });
      }
    });
  }
  getModList() {
    return this.MOD_LIST;
  }
  getMod(modId) {
    return this.MOD_LIST.mods[modId];
  }
  runMod(modId) {
    const thisMod = this.MOD_LIST.mods[modId];
    try {
      thisMod.run();
    } catch (error) {
      $console.error(error);
      $ui.alert({
        title: `运行错误(${modId})`,
        message: error.message,
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {}
          }
        ]
      });
    }
  }
  setWidgetMod(modId) {
    if (
      this.MOD_LIST.id.includes(modId) &&
      this.MOD_LIST.mods[modId].MOD_INFO.ALLOW_WIDGET &&
      $.isFunction(this.MOD_LIST.mods[modId].runWidget)
    ) {
      this.CONFIG.WIDGET_MOD_ID = modId;
    }
  }
  runWidgetMod() {
    const inputValue = $widget.inputValue;
    try {
      if (this.MOD_LIST.id.includes(inputValue)) {
        this.setWidgetMod(inputValue);
      }
      const thisMod = this.MOD_LIST.mods[this.CONFIG.WIDGET_MOD_ID];
      if (thisMod.MOD_INFO.ALLOW_WIDGET_SIZE.includes(WIDGET_FAMILY_SIZE)) {
        thisMod.runWidget();
      } else {
        $widget.setTimeline({
          render: ctx => {
            return {
              type: "text",
              props: {
                text: "不支持该尺寸"
              }
            };
          }
        });
      }
    } catch (error) {
      $console.error(error);
      $widget.setTimeline({
        render: ctx => {
          return {
            type: "text",
            props: {
              text: error.message
            }
          };
        }
      });
    }
  }
  setContextMod(modId) {
    if (
      this.MOD_LIST.id.includes(modId) &&
      this.MOD_LIST.mods[modId].MOD_INFO.ALLOW_CONTEXT &&
      $.isFunction(this.MOD_LIST.mods[modId].runContext)
    ) {
      this.ACTION_MOD_ID = modId;
      this.CONFIG.CONTEXT_MOD_ID = modId;
    }
  }
  runContextMod() {
    const modId = this.CONFIG.CONTEXT_MOD_ID;
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.runContext();
      } catch (error) {
        $console.error(error);
      }
    } else {
      $app.close();
    }
  }
  runModApi({ modId, apiId, data }) {
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      if (
        thisMod != undefined &&
        this.MOD_LIST.mods[modId].MOD_INFO.ALLOW_API &&
        $.isFunction(thisMod.runApi)
      ) {
        try {
          return thisMod.runApi(apiId, data);
        } catch (error) {
          $console.error(error);
          return false;
        }
      } else {
        $console.error({
          func: "runModApi",
          message: "need mod"
        });
        return false;
      }
    } else {
      $console.error({
        func: "runModApi",
        message: "need mod id"
      });
      return false;
    }
  }
  setKeyboardMod(modId) {
    if (
      this.MOD_LIST.id.includes(modId) &&
      this.MOD_LIST.mods[modId].MOD_INFO.ALLOW_KEYBOARD &&
      $.isFunction(this.MOD_LIST.mods[modId].runKeyboard)
    ) {
      this.CONFIG.KEYBOARD_MOD_ID = modId;
    }
  }
  runKeyboardMod() {
    const modId = this.CONFIG.KEYBOARD_MOD_ID;
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        $keyboard.height = 360;
        thisMod.runKeyboard();
      } catch (error) {
        $console.error(error);
        $ui.render({
          props: {
            title: "初始化错误"
          },
          views: [
            {
              type: "list",
              props: {
                data: [
                  {
                    title: "错误原因",
                    rows: [error.message]
                  }
                ]
              },
              layout: $layout.fill
            }
          ]
        });
        $ui.alert({
          title: "runKeyboardMod.error",
          message: error.message,
          actions: [
            {
              title: "OK",
              disabled: false, // Optional
              handler: () => {}
            }
          ]
        });
      }
    } else {
      $ui.render({
        props: {
          title: "初始化错误"
        },
        views: [
          {
            type: "list",
            props: {
              data: [
                {
                  title: "错误原因",
                  rows: ["未设置modId"]
                }
              ]
            },
            layout: $layout.fill
          }
        ]
      });
    }
  }
  autoRunMod() {
    switch (true) {
      case this.App.isWidgetEnv():
        this.runWidgetMod();
        break;
      case this.App.isAppEnv():
        if (this.CONFIG.GRID_LIST_MODE) {
          this.showGridModList();
        } else {
          $ui.render({
            props: {
              title: this.App.AppInfo.name
            },
            views: [
              {
                type: "list",
                props: {
                  data: this.getModList().id.map(modId => {
                    const thisMod = this.getModList().mods[modId];
                    if (thisMod.MOD_INFO.NEED_UPDATE) {
                      return thisMod.MOD_INFO.NAME + "(待更新)";
                    } else {
                      return thisMod.MOD_INFO.NAME;
                    }
                  })
                },
                layout: $layout.fill,
                events: {
                  didSelect: (sender, indexPath, data) => {
                    this.runMod(this.getModList().id[indexPath.row]);
                  }
                }
              }
            ]
          });
        }
        break;
      case this.App.isActionEnv() || this.App.isSafariEnv():
        this.runContextMod();
        break;
      case this.App.isKeyboardEnv():
        this.runKeyboardMod();
        break;
      default:
        $app.close();
    }
  }
  showGridModList() {
    const modList = this.getModList();
    $ui.render({
      props: {
        title: this.App.AppInfo.name
      },
      views: [
        {
          type: "matrix",
          props: {
            columns: 3,
            waterfall: true,
            itemHeight: 50,
            spacing: 2,
            template: {
              props: {},
              views: [
                {
                  type: "stack",
                  props: {
                    axis: $stackViewAxis.vertical,
                    spacing: 5,
                    distribution: $stackViewDistribution.fillProportionally,
                    stack: {
                      views: [
                        {
                          type: "image",
                          props: {
                            id: "image"
                          },
                          layout: (make, view) => {
                            make.center.equalTo(view.super);
                            make.size.equalTo($size(50, 50));
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "name",

                            align: $align.left,
                            font: $font(12)
                          },
                          layout: make => {
                            make.height.equalTo(20);
                            make.left.top.right.inset(0);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: modList.id.map(modId => {
              const mod = modList.mods[modId];
              return {
                image: {
                  icon: mod.MOD_INFO.ICON,
                  image: mod.MOD_INFO.IMAGE
                },
                name: {
                  text: mod.MOD_INFO.NAME
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              this.runMod(modList.id[indexPath.row]);
            }
          }
        }
      ]
    });
  }
}
class ModModule {
  constructor({ modId, coreId, moduleId, moduleName, author, version }) {
    this.CORE_ID = modId || coreId;
    this.MOD_ID = modId;
    this.MODULE_ID = moduleId;
    this.MODULE_NAME = moduleName;
    this.AUTHOR = author;
    this.VERSION = version;
  }
}
class ModModuleLoader {
  constructor(mod) {
    this.Mod = mod;
    this.App = this.Mod.App;
    this.MOD_DIR = this.App.MOD_DIR;
    this.ModuleList = {};
  }
  addModule(fileName) {
    if (fileName.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.Mod.MOD_INFO.NAME,
        message: "需要module fileName",
        fileName,
        length: fileName.length
      });
      return false;
    }
    const modulePath = this.MOD_DIR + fileName;
    if (this.Mod.MOD_INFO.ID.length <= 0) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "需要Mod.MOD_INFO.ID",
        MOD_NAME: this.Mod.MOD_INFO.NAME
      });
      return false;
    }
    if (!$file.exists(modulePath) || $file.isDirectory(modulePath)) {
      $console.error({
        name: "core.module.ModuleLoader.addModule",
        message: "module文件不存在",
        MOD_NAME: this.Mod.MOD_INFO.NAME,
        fileName
      });
      return false;
    }
    try {
      const moduleFile = require(modulePath),
        thisModule = new moduleFile(this.Mod);
      if (this.Mod.MOD_INFO.ID != thisModule.MOD_ID) {
        $console.error({
          name: "core.module.ModuleLoader.addModule",
          message: "CORE_ID错误",
          MOD_NAME: this.Mod.MOD_INFO.NAME,
          CORE_ID: thisModule.MOD_ID,
          MOD_ID: this.Mod.MOD_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      if (thisModule.AUTHOR == undefined || thisModule.AUTHOR.length <= 0) {
        thisModule.AUTHOR = this.Mod.MOD_INFO.AUTHOR;
        $console.info(
          `自动为模块${thisModule.MOD_ID}添加mod的作者(${this.Mod.MOD_INFO.AUTHOR})`
        );
      }
      this.ModuleList[thisModule.MODULE_ID] = thisModule;
      $console.info(
        `Mod[${this.Mod.MOD_INFO.NAME}]加载module[${thisModule.MODULE_NAME}]`
      );
      return true;
    } catch (error) {
      $console.error({
        id: "core.module.ModuleLoader.addModule.try",
        fileName,
        MOD_NAME: this.Mod.MOD_INFO.NAME,
        error: error.message
      });
      return false;
    }
  }
  getModule(moduleId) {
    return this.ModuleList[moduleId];
  }
}
module.exports = {
  CORE_VERSION: VERSION,
  VERSION,
  AppKernel,
  Core: ModCore,
  CoreLoader: ModLoader,
  CoreModule: ModModule,
  ModuleLoader: ModModuleLoader,
  ModCore,
  ModLoader,
  ModModule,
  ModModuleLoader
};
