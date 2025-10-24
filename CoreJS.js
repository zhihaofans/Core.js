const VERSION = 18,
  $ = require("$"),
  { Storage, UiKit } = require("Next"),
  WIDGET_FAMILY_SIZE = $widget.family;
class AppKernel {
  constructor({ appId, modDir, modList, l10nPath }) {
    this.START_TIME = new Date().getTime();
    this.MOD_DIR = modDir;
    this.DEBUG = $app.isDebugging;
    this.AppConfig = JSON.parse($file.read("/config.json"));
    this.AppInfo = this.AppConfig.info;
    this.AppInfo.id = appId;
    this.DATA_DIR = {
      SHARED: "shared://zhihaofans/CoreJS/" + appId + "/",
      ICLOUD: "drive://zhihaofans/CoreJS/" + appId + "/",
      LOCAL: "/assets/.files/"
    };
    this.DEFAULE_SQLITE_FILE = this.DATA_DIR.LOCAL + "mods.db";
    const INFO_MKDIRS_SHARED = $.file.mkdirs(this.DATA_DIR.SHARED);
    const INFO_MKDIRS_ICLOUD = $.file.mkdirs(this.DATA_DIR.ICLOUD);
    const INFO_MKDIRS_LOCAL = $.file.mkdirs(this.DATA_DIR.LOCAL);
    this.l10n(l10nPath);
    if (this.DEBUG) {
      $.info(`appName:${this.AppInfo.name}`);
      $.info(`appId:${this.AppInfo.id}`);
      $.info(`debug:${this.DEBUG}`);
      $console.info({
        INFO_MKDIRS_SHARED,
        INFO_MKDIRS_ICLOUD,
        INFO_MKDIRS_LOCAL
      });
    }
    this.ModLoader = new ModLoader({ modDir, app: this, modList });
    this.GlobalStorage = new GlobalStorage();
  }
  l10n(l10nPath) {
    if ($.file.isFileExist(l10nPath)) {
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
      $.error("CoreJS.AppKernel:l10nPath is not exist");
    }
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
  #App;
  constructor({
    app,
    modId,
    modName,
    icon,
    iconData,
    iconName,
    version,
    author,
    coreVersion,
    useSqlite,
    allowApi,
    allowContext,
    allowKeyboard,
    allowWidget,
    allowWidgetSize,
    apiList,
    contentMatchRules
  }) {
    this.App = app;
    this.#App = app;
    this.MOD_INFO = {
      ID: modId,
      NAME: modName,
      ICON: icon,
      ICON_DATA: iconData,
      ICON_NAME: iconName,
      VERSION: version,
      AUTHOR: author,
      CORE_VERSION: coreVersion,
      DATABASE_ID: modId,
      MOD_DIR: app.MOD_DIR,
      KEYCHAIN_DOMAIN: `${app.AppInfo.id}.mods.${author}.${modId}`,
      KEYCHAIN_DOMAIN_NEW: `${app.AppInfo.id}.mods.${author}.${modId}`,
      KEYCHAIN_DOMAIN_OLD: `nobundo.mods.${author}.${modId}`,
      USE_SQLITE: useSqlite === true,
      NEED_UPDATE: coreVersion !== VERSION,
      ALLOW_API: allowApi === true,
      ALLOW_CONTEXT: allowContext === true,
      ALLOW_KEYBOARD: allowKeyboard === true,
      ALLOW_WIDGET: allowWidget === true,
      ALLOW_WIDGET_SIZE:
        allowWidget === true
          ? allowWidgetSize || [0, 1, 2, 3, 5, 6, 7]
          : undefined,
      API_LIST: apiList,
      CONTENT_MATCH_MODE: contentMatchRules !== undefined,
      CONTENT_MATCH_RULES: contentMatchRules
      //      [{type:"url",mode:"regexp",rule: /ab+c/,id:"example_url"},{type:"image",mode:"regexp",rule: /ab+c/,id:"example_image"}]
    };
    this.SQLITE = this.initSQLite();
    this.Keychain = new Storage.Keychain(this.MOD_INFO.KEYCHAIN_DOMAIN);
    //    if (apiList && apiList.length > 0) {
    //      app.ApiManager.addApiList(this.MOD_INFO.ID, apiList);
    //    }
  }
  initSQLite() {
    const SQLITE_FILE = this.#App.DEFAULE_SQLITE_FILE;
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
  #App;
  constructor({ app, appMode, modDir, modList, gridListMode = false }) {
    this.App = app;
    this.#App = app;
    this.APP_MODE = appMode == true;
    this.MOD_LIST_LOAD_FINISH = false;
    this.MOD_DIR = modDir;
    this.MOD_LIST = { id: [], mods: {} };
    this.CONFIG = {
      APP_MODE_INDEX_MOD_ID: undefined,
      CONTEXT_MOD_ID: undefined,
      KEYBOARD_MOD_ID: undefined,
      WIDGET_MOD_ID: undefined,
      GRID_LIST_MODE: gridListMode == true
    };
    this.MOD_MATCH_RULES = {};
    this.WidgetLoader = new WidgetLoader(this);
    this.ApiManager = new ApiManager(this);
    if ($.isArray(modList)) {
      this.addModsByList(modList);
    }
  }
  addMod(modCore) {
    if (this.MOD_LIST_LOAD_FINISH === true) return;
    const {
      ALLOW_API,
      ALLOW_CONTEXT,
      ALLOW_KEYBOARD,
      ALLOW_WIDGET,
      API_LIST,
      ID,
      NAME,
      AUTHOR,
      CORE_VERSION
    } = modCore.MOD_INFO;
    const addModLog = {
      ALLOW_API,
      ALLOW_CONTEXT,
      ALLOW_KEYBOARD,
      ALLOW_WIDGET,
      API_LIST,
      ID,
      NAME,
      AUTHOR,
      CORE_VERSION,
      addSu: false,
      errorResult: []
    };
    if (
      $.hasString(ID) &&
      $.hasString(NAME) &&
      $.hasString(AUTHOR) &&
      CORE_VERSION > 0
    ) {
      //是否存在mod信息
      if (!this.hasMod(ID)) {
        //判断是否已加该mod
        modCore.ApiManager = this.ApiManager;
        this.MOD_LIST.id.push(ID);
        this.MOD_LIST.mods[ID] = modCore;
        if (CORE_VERSION >= 12 && ALLOW_API === true) {
          $console.info({
            addApiList: this.ApiManager.addApiList(ID, API_LIST),
            ID,
            API_LIST
          });
          addModLog.errorResult.push("success");
          addModLog.addSu = true;
        }
      } else {
        addModLog.errorResult.push("has added");
        $.error(`hasMod(${ID})`);
      }
    } else {
      addModLog.errorResult.push("ID,NAME,AUTHOR,CORE_VERSION error");
      $.error("ID,NAME,AUTHOR,CORE_VERSION error");
    }
    $console.info(addModLog);
  }
  addModsByList(fileNameList) {
    return new Promise((resolve, reject) => {
      if (this.MOD_LIST_LOAD_FINISH != true) {
        fileNameList.map(fileName => {
          if ($.hasString(fileName)) {
            try {
              const thisMod = require(this.MOD_DIR + fileName);
              this.addMod(new thisMod(this.#App));
            } catch (error) {
              $.error({
                message: error.message,
                fileName,
                name: "ModLoader.addModsByList"
              });
            }
          } else {
            $.error({
              message: "fileName is empty",
              fileName,
              name: "ModLoader.addModsByList"
            });
          }
        });
        this.MOD_LIST_LOAD_FINISH = true;
      }
      resolve(this.MOD_LIST);
    });
  }
  getModList() {
    return this.MOD_LIST;
  }
  getMod(modId) {
    return this.MOD_LIST.mods[modId];
  }
  hasMod(modId) {
    return this.MOD_LIST.id.includes(modId);
  }
  runMod(modId) {
    try {
      this.MOD_LIST.mods[modId].run();
    } catch (error) {
      $.error(error);
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
      if ($.hasString(inputValue)) {
        this.WidgetLoader.runWidget(inputValue);
      } else {
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
      }
    } catch (error) {
      $.error(error);
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
    if ($.hasString(modId)) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.runContext();
      } catch (error) {
        $.error(error);
      }
    } else {
      $app.close();
    }
  }
  runModApi({ modId, apiId, data, callback }) {
    if (modId && modId.length >= 0) {
      const thisMod = this.MOD_LIST.mods[modId];
      if (
        thisMod != undefined &&
        this.MOD_LIST.mods[modId].MOD_INFO.ALLOW_API &&
        $.isFunction(thisMod.runApi)
      ) {
        try {
          thisMod.runApi({ apiId, data, callback });
          return true;
        } catch (error) {
          $.error(error);
          return false;
        }
      } else {
        $.error({
          func: "runModApi",
          message: "need mod"
        });
        return false;
      }
    } else {
      $.error({
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
    if ($.hasString(modId)) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        $keyboard.height = 360;
        thisMod.runKeyboard();
      } catch (error) {
        $.error(error);
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
  setAppModeIndexMod(modId) {
    if (
      this.MOD_LIST.id.includes(modId) &&
      $.isFunction(this.MOD_LIST.mods[modId].run)
    ) {
      this.CONFIG.APP_MODE_INDEX_MOD_ID = modId;
    } else {
      $.error({ _: "setAppModeIndexMod", msg: "not modId" });
    }
  }
  runAppModeIndexMod() {
    const modId = this.CONFIG.APP_MODE_INDEX_MOD_ID;
    if ($.hasString(modId)) {
      const thisMod = this.MOD_LIST.mods[modId];
      try {
        thisMod.run();
      } catch (error) {
        $.error(error);
      }
    } else {
      $.error({ _: "setAppModeIndexMod", msg: "not modId" });
      $app.close();
    }
  }
  autoRunMod() {
    switch (true) {
      case this.#App.isWidgetEnv():
        this.runWidgetMod();
        break;
      case this.#App.isAppEnv():
        if (this.CONFIG.GRID_LIST_MODE) {
          this.showGridModList();
        } else if (this.CONFIG.APP_MODE_INDEX_MOD_ID) {
          this.runAppModeIndexMod();
          $console.info({
            runAppModeIndexMod: this.CONFIG.APP_MODE_INDEX_MOD_ID
          });
        } else {
          $ui.render({
            props: {
              title: this.#App.AppInfo.name
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
      case this.#App.isActionEnv() || this.#App.isSafariEnv():
        this.runContextMod();
        break;
      case this.#App.isKeyboardEnv():
        this.runKeyboardMod();
        break;
      default:
        $app.close();
    }
  }
  showGridModList() {
    const modList = this.getModList();
    const itemList = modList.id.map(modId => {
      const modInfo = modList.mods[modId].MOD_INFO;
      const modData = {
        title: modInfo.NEED_UPDATE ? `${modInfo.NAME}(New)` : modInfo.NAME
      };
      if (modInfo.ICON_DATA) {
        modData.data = modInfo.ICON_DATA;
      } else if (modInfo.ICON_NAME) {
        modData.icon = modInfo.ICON_NAME;
      } else if (modInfo.ICON) {
        modData.src = modInfo.ICON;
      } else {
        modData.src =
          `http://api.setbug.com/tools/text2image/?font_name=wryh&text=${$text
            .convertToPinYin(modInfo.NAME)
            .toUpperCase()
            .substring(0, 1)}&t=` + $.getUnixTime();
      }
      return modData;
    });
    $console.info(itemList);
    new UiKit().showGridList({
      title: this.#App.AppInfo.name,
      itemList,
      callback: (idx, data) => {
        this.runMod(modList.id[idx]);
      }
    });
  }
  loadRules() {}
}
class ModModule {
  constructor({ author, id, mod, name, version }) {
    this.Mod = mod;
    this.MOD_ID = mod.MOD_INFO.ID;
    this.MODULE_ID = id;
    this.MODULE_NAME = name;
    this.AUTHOR = author || mod.MOD_INFO.AUTHOR;
    this.VERSION = version;
  }
}
class ModModuleLoader {
  #Mod;
  constructor(mod) {
    this.Mod = mod;
    this.#Mod = mod;
    this.MOD_DIR = mod.MOD_INFO.MOD_DIR;
    this.ModuleList = {};
  }
  addModulesByList(fileNameList) {
    let MODULE_LIST_LOAD_FINISH = false;
    let ERROR_MODULES_ID = [];
    return new Promise((resolve, reject) => {
      if (this.MODULE_LIST_LOAD_FINISH != true) {
        fileNameList.map(fileName => {
          if ($.hasString(fileName)) {
            try {
              const addRe = this.addModule(fileName);
            } catch (error) {
              $.error({
                message: error.message,
                fileName,
                name: "ModLoader.addModsByList"
              });
              ERROR_MODULES_ID.push(fileName);
            }
          } else {
            $.error({
              message: "fileName is empty",
              fileName,
              name: "ModLoader.addModsByList"
            });
          }
        });
        this.MOD_LIST_LOAD_FINISH = true;
      }
      if (ERROR_MODULES_ID.length > 0) {
        $.error({
          name: "core.module.ModuleLoader.addModulesByList",
          MOD_NAME: this.#Mod.MOD_INFO.NAME,
          message: "批量加载出现错误",
          ERROR_MODULES_ID,
          count: ERROR_MODULES_ID.length
        });
      } else {
        $.info({
          name: "core.module.ModuleLoader.addModulesByList",
          MOD_NAME: this.#Mod.MOD_INFO.NAME,
          message: "批量加载成功",
          ERROR_MODULES_ID,
          count: ERROR_MODULES_ID.length
        });
      }
      resolve(ERROR_NUMBER);
    });
  }
  addModule(fileName) {
    if (this.MOD_DIR == undefined || this.MOD_DIR.length <= 0) {
      $.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.#Mod.MOD_INFO.NAME,
        message: "MOD_DIR错误",
        MOD_DIR: this.MOD_DIR,
        fileName,
        length: fileName.length
      });
      return false;
    }
    if (fileName.length <= 0) {
      $.error({
        name: "core.module.ModuleLoader.addModule",
        MOD_NAME: this.#Mod.MOD_INFO.NAME,
        message: "需要module fileName",
        fileName,
        length: fileName.length
      });
      return false;
    }
    const modulePath = this.MOD_DIR + fileName;
    $console.info({
      debug: "addModule",
      fileName,
      modulePath
    });
    if (this.#Mod.MOD_INFO.ID.length <= 0) {
      $.error({
        name: "core.module.ModuleLoader.addModule",
        message: "需要Mod.MOD_INFO.ID",
        MOD_NAME: this.#Mod.MOD_INFO.NAME
      });
      return false;
    }

    if (!$file.exists(modulePath) || $file.isDirectory(modulePath)) {
      $.error({
        name: "core.module.ModuleLoader.addModule",
        message: "module文件不存在",
        MOD_NAME: this.#Mod.MOD_INFO.NAME,
        fileName
      });
      return false;
    }
    try {
      const moduleFile = require(modulePath),
        thisModule = new moduleFile(this.#Mod);
      if (this.ModuleList[thisModule.MODULE_ID] !== undefined) {
        $.error({
          name: "core.module.ModuleLoader.addModule",
          message: "重复添加Module",
          MOD_NAME: this.#Mod.MOD_INFO.NAME,
          CORE_ID: thisModule.MOD_ID,
          MOD_ID: this.#Mod.MOD_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      if (this.#Mod.MOD_INFO.ID != thisModule.MOD_ID) {
        $.error({
          name: "core.module.ModuleLoader.addModule",
          message: "CORE_ID错误",
          MOD_NAME: this.#Mod.MOD_INFO.NAME,
          CORE_ID: thisModule.MOD_ID,
          MOD_ID: this.#Mod.MOD_INFO.ID,
          MODULE_ID: thisModule.MODULE_ID,
          MODULE_NAME: thisModule.MODULE_NAME
        });
        return false;
      }
      if (thisModule.AUTHOR == undefined || thisModule.AUTHOR.length <= 0) {
        thisModule.AUTHOR = this.#Mod.MOD_INFO.AUTHOR;
        $.info(
          `自动为模块${thisModule.MODULE_ID}添加mod的作者(${
            this.#Mod.MOD_INFO.AUTHOR
          })`
        );
      }
      this.ModuleList[thisModule.MODULE_ID] = thisModule;
      $.info(
        `Mod[${this.#Mod.MOD_INFO.NAME}]加载module[${thisModule.MODULE_NAME}]`
      );
      return true;
    } catch (error) {
      $.error(error);
      $.error({
        line: 678,
        id: "core.module.ModuleLoader.addModule.try",
        fileName,
        MOD_NAME: this.#Mod.MOD_INFO.NAME,
        error: error.message
      });
      return false;
    }
  }
  getModule(moduleId) {
    return this.ModuleList[moduleId];
  }
}
class WidgetLoader {
  constructor(modLoader) {
    this.ModLoader = modLoader;
    this.WIDGET_REGISTER_LIST = {};
    this.MOD_REGISTER_LIST = {};
  }
  canRunWidget(modId) {
    const thisMod = this.ModLoader.getMod(modId);
    return (
      this.hasMod(modId) &&
      thisMod.MOD_INFO.ALLOW_WIDGET &&
      !thisMod.MOD_INFO.NEED_UPDATE &&
      $.isFunction(thisMod.runWidget)
    );
  }
  hasMod(modId) {
    return this.ModLoader.hasMod(modId);
  }
  isRegistered(id) {
    return Object.keys(this.WIDGET_REGISTER_LIST).includes(id);
  }
  registerWidget({ modId, id, size, title }) {
    const allowSize = [
      $widgetFamily.accessoryCircular,
      $widgetFamily.accessoryInline,
      $widgetFamily.accessoryRectangular,
      $widgetFamily.large,
      $widgetFamily.medium,
      $widgetFamily.small,
      $widgetFamily.xLarge
    ];
    if (
      this.isRegistered(id) ||
      !this.canRunWidget(modId) ||
      !allowSize.includes(size)
    ) {
      return false;
    }
    this.WIDGET_REGISTER_LIST[id] = {
      id,
      modId,
      size,
      title
    };
    if (!Object.keys(this.MOD_REGISTER_LIST).includes(modId)) {
      this.MOD_REGISTER_LIST[modId] = [];
    }
    this.MOD_REGISTER_LIST[modId].push(id);
    return this.isRegistered(id);
  }
  runWidget(id) {
    if (!this.isRegistered(id)) {
      throw {
        message: `not register(${id})`
      };
    }
    const thisWidget = this.WIDGET_REGISTER_LIST[id],
      thisMod = this.ModLoader.getMod(thisWidget.modId);
    if (WIDGET_FAMILY_SIZE != thisWidget.size) {
      throw {
        message: `not allow size(${id})`
      };
    }
    thisMod.runWidget(id);
  }
}
class GlobalStorage {
  #App;
  constructor(app) {
    this.#App = app;
    this._DATA_ = {};
  }
  get(key) {
    return this._DATA_[key];
  }
  set(key, value) {
    this._DATA_[key] = value;
  }
  remove(key) {
    this._DATA_[key] = undefined;
  }
}
class ApiManager {
  constructor(modLoader) {
    this.ModLoader = modLoader;
    this.API_LIST = {};
  }
  addApi({ apiId, modId, func }) {
    $console.info({
      _: "addApi",
      apiId,
      modId,
      func
    });
    if (apiId === undefined || modId === undefined) {
      $.error({
        apiId,
        func,
        modId,
        msg: "apiId或modId不存在"
      });
      return false;
    } else if (Object.keys(this.API_LIST).includes(apiId)) {
      $.error({
        apiId,
        func,
        modId,
        msg: "重复api"
      });
      return false;
    } else if (!this.ModLoader.hasMod(modId)) {
      $.error({
        apiId,
        func,
        modId,
        msg: "未注册mod"
      });
      return false;
    } else if (this.ModLoader.getMod(modId)?.MOD_INFO.ALLOW_API !== true) {
      $.error({
        apiId,
        func,
        modId,
        msg: "不允许api"
      });
      return false;
    } else {
      this.API_LIST[apiId] = {
        modId,
        func
      };
      return true;
    }
  }
  addApiList(modId, apiList) {
    if (modId === undefined || apiList === undefined || apiList.length === 0) {
      return false;
    } else {
      let success = true;
      apiList.map(apiItem => {
        try {
          const { apiId, func } = apiItem,
            addResult = this.addApi({
              apiId,
              func,
              modId
            });
          if (addResult !== true) {
            success = false;
          }
        } catch (error) {
          $.error(error);
        }
      });
      return success;
    }
  }
  runApi({ apiId, data, callback }) {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.API_LIST).includes(apiId)) {
        try {
          this.API_LIST[apiId].func({
            data,
            callback: callback ? callback : resolve
          });
        } catch (error) {
          $.error({
            _: "runApi",
            apiId,
            data,
            callback,
            error
          });
          reject({ apiId, data, message: error.message });
        }
      } else {
        $.error({
          _: "runApi",
          apiId,
          data,
          callback,
          message: "未注册该apiid"
        });
        reject({
          apiId,
          data,
          message: "未注册该apiid"
        });
      }
    });
  }
}
class Logger {
  constructor(logDir) {
    this.LOG_DIR = logDir;
    this.TAG = "CoreJS.Logger";
  }
  initTag(tag) {
    this.TAG = tag;
  }
  saveFile(fileName, data) {
    if (!$file.isDirectory(this.LOG_DIR)) {
      return false;
    }
  }
  logE(message) {
    $console.error({
      tag: this.TAG,
      message
    });
  }
}
class ModConfig {
  constructor(mod) {
    this.ID = mod.MOD_INFO.ID;
  }
}

module.exports = {
  CORE_VERSION: VERSION,
  VERSION,
  ApiManager,
  AppKernel,
  Core: ModCore,
  CoreLoader: ModLoader,
  CoreModule: ModModule,
  ModuleLoader: ModModuleLoader,
  ModCore,
  ModLoader,
  ModModule,
  ModModuleLoader,
  WidgetLoader
};
