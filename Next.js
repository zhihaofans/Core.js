const VERSION = 1;
class DateTime {
  constructor(mode) {
    this.DATE_TIME = new Date(); //pickDateTime后可修改
    this.MODE = mode || 2; //0:时间,1:日期,2:日期时间
  }
  setDateTime(newDateTime) {
    this.DATE_TIME = new Date(newDateTime);
  }
  setMode(newMode) {
    switch (newMode) {
      case 0:
      case 1:
      case 2:
        this.MODE = newMode;
        break;
    }
  }
  async pickDateTime(mode) {
    this.DATE_TIME = await $picker.date({ props: { mode: mode || this.MODE } });
  }
  getFullDateStr() {
    //返回2022-01-01格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      result = `${year}-${month >= 10 ? month : "0" + month}-${
        date >= 10 ? date : "0" + date
      }`;
    return result;
  }
  getFullDateNumber() {
    //返回20220101格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      result = `${year}${month >= 10 ? month : "0" + month}${
        date >= 10 ? date : "0" + date
      }`;
    return result;
  }
  getFullDateTimeStr() {
    //返回2022-01-01 00:11:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      hours = dateTime.getHours(),
      minutes = dateTime.getMinutes(),
      seconds = dateTime.getSeconds(),
      result = `${year}-${month >= 10 ? month : "0" + month}-${
        date >= 10 ? date : "0" + date
      } ${hours >= 10 ? hours : "0" + hours}:${
        minutes >= 10 ? minutes : "0" + minutes
      }:${seconds >= 10 ? seconds : "0" + seconds}`;
    return result;
  }
  getShortDateStr() {
    //返回2022-1-1 0:1:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      result = `${year}-${month}-${date}`;
    return result;
  }
  getShortDateTimeStr() {
    //返回2022-1-1 0:1:22格式的日期
    const dateTime = this.DATE_TIME,
      year = dateTime.getFullYear(),
      month = dateTime.getMonth() + 1,
      date = dateTime.getDate(),
      hours = dateTime.getHours(),
      minutes = dateTime.getMinutes(),
      seconds = dateTime.getSeconds(),
      result = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    return result;
  }
  getUnixTime() {
    return this.DATE_TIME.getTime();
  }
}
class Http {
  constructor(timeout) {
    this.TIMEOUT = timeout || 5;
  }
  concatUrlParams(url, params) {
    let newUrl = url;
    if (params != undefined && Object.keys(params).length > 0) {
      if (url.includes("?")) {
        newUrl = url.substring(0, url.indexOf("?"));
      }
      newUrl += this.paramsToUrl(params);
    }
    return newUrl;
  }
  cookieToObject(cookie) {
    if (cookie) {
      const cookieResult = {};
      cookie.split(";").map(cookieItem => {
        const itemSplit = cookieItem.trim().split("="),
          itemKey = itemSplit[0],
          itemValve = itemSplit[1];
        cookieResult[itemKey] = itemValve;
      });
      return cookieResult;
    } else {
      return undefined;
    }
  }
  async get({ url, header, params }) {
    const newUrl = this.concatUrlParams(url, params);
    return await $http.get({
      url: newUrl,
      timeout: this.TIMEOUT,
      header: header
    });
  }
  getAsnyc({ url, params, header, handler }) {
    $http.get({
      url: this.concatUrlParams(url, params),
      params,
      header,
      timeout: this.TIMEOUT,
      handler
    });
  }
  async head({ url, header, params }) {
    return await $http.request({
      method: "HEAD",
      url: this.concatUrlParams(url, params),
      timeout: this.TIMEOUT,
      header
    });
  }
  paramsToUrl(params) {
    //const params = {aaa: "aaa"};
    const keys = Object.keys(params);
    if (keys.length == 0) {
      return "";
    }
    let paramsStr = "?";
    keys.map(key => {
      if (paramsStr != "?") {
        paramsStr += "&";
      }
      paramsStr += key + "=" + $text.URLEncode(params[key]);
    });
    return paramsStr;
  }
  async post({ url, header, timeout, body, params }) {
    return await $http.post({
      url: this.concatUrlParams(url, params),
      header,
      timeout: this.TIMEOUT,
      body
    });
  }
  postAsnyc({ url, params, body, header, handler }) {
    $http.post({
      url: this.concatUrlParams(url, params),
      header,
      timeout: this.TIMEOUT,
      handler
    });
  }
}

class Keychain {
  constructor(domain) {
    this.DOMAIN = domain.toLowerCase();
  }
  get(key) {
    return $keychain.get(key, this.DOMAIN);
  }
  set(key, value) {
    return $keychain.set(key, value, this.DOMAIN);
  }
  getValue(key) {
    return $keychain.get(key, this.DOMAIN);
  }
  setValue(key, value) {
    return $keychain.set(key, value, this.DOMAIN);
  }
  getAll() {
    const keys = this.getKeyList(),
      result = {};
    keys.map(key => {
      result[key] = $keychain.get(key, this.DOMAIN);
    });
    return result;
  }
  getKeyList() {
    return $keychain.keys(this.DOMAIN);
  }
  remove(key) {
    return $keychain.remove(key, this.DOMAIN);
  }
  moveItem(oldKey, newKey) {
    const oldValue = this.getValue(oldKey);
    this.setValue(newKey, oldValue);
    this.remove(oldKey);
  }
  moveToNewDomain(newDomain) {
    const oldList = this.getAll();
    Object.keys().map(key => {
      $keychain.set(key, oldList[key], newDomain);
      this.remove(key);
    });
  }
}
class ListView {
  constructor() {
    this.AUTO_ROW_HEIGHT = false;
    this.ESTIMATED_ROW_HEIGHT = undefined;
  }
  pushSimpleText(title, textList, didSelect = index => {}) {
    $ui.push({
      props: {
        title
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            data: textList
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              didSelect(indexPath.row);
            }
          }
        }
      ]
    });
  }
  pushSimpleList(title, listData, defaultFunc) {
    //    const listData = [
    //      {
    //        title: "标题",
    //        rows: [
    //          {
    //            title: "列表项",
    //            func: data => {
    //              // 会自动带入所选项的文本到data
    //            }
    //          }
    //        ]
    //      }
    //    ];
    $ui.push({
      props: {
        title
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            data: listData.map(group => {
              return {
                title: group.title,
                rows: group.rows.map(row => row.title.toString())
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row,
                clickItem = listData[section].rows[row];
              if (
                clickItem.func != undefined &&
                typeof clickItem.func == "function"
              ) {
                try {
                  clickItem.func(data);
                } catch (error) {
                  $console.error(error);
                }
              } else if (
                defaultFunc != undefined &&
                typeof defaultFunc == "function"
              ) {
                try {
                  defaultFunc(data);
                } catch (error) {
                  $console.error(error);
                }
              }
            }
          }
        }
      ]
    });
  }
  renderSimpleList(title, listData, defaultFunc) {
    $ui.render({
      props: {
        title
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            data: listData.map(group => {
              return {
                title: group.title,
                rows: group.rows.map(row => row.title.toString())
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              const section = indexPath.section,
                row = indexPath.row,
                clickItem = listData[section].rows[row];
              if (
                clickItem.func != undefined &&
                typeof clickItem.func == "function"
              ) {
                try {
                  clickItem.func(data);
                } catch (error) {
                  $console.error(error);
                }
              } else if (
                defaultFunc != undefined &&
                typeof defaultFunc == "function"
              ) {
                try {
                  defaultFunc(data);
                } catch (error) {
                  $console.error(error);
                }
              }
            }
          }
        }
      ]
    });
  }
  setAutoRowHeight(autoRowHeight) {
    this.AUTO_ROW_HEIGHT = autoRowHeight == true;
  }
  setEstimatedRowHeight(estimatedRowHeight) {
    this.ESTIMATED_ROW_HEIGHT = estimatedRowHeight || 10;
  }
  pushTwoLineList({
    id,
    title,
    navButtons,
    items = [
      {
        title: "title",
        subTitle: "subTitle"
      }
    ],
    handler = (section, row, data) => {
      $console.info({
        section,
        row,
        data
      });
    }
  }) {
    $ui.push({
      props: {
        id,
        title,
        navButtons
      },
      views: [
        {
          type: "list",
          props: {
            autoRowHeight: this.AUTO_ROW_HEIGHT,
            estimatedRowHeight: this.ESTIMATED_ROW_HEIGHT,
            template: {
              props: {
                bgcolor: $color("clear")
              },
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
                          type: "label",
                          props: {
                            id: "title",

                            align: $align.left,
                            font: $font(24)
                          },
                          layout: make => {
                            make.height.equalTo(24);
                            make.left.top.right.inset(5);
                          }
                        },
                        {
                          type: "label",
                          props: {
                            id: "subTitle",

                            align: $align.left,
                            font: $font(12),
                            textColor: $color("gray")
                          },
                          layout: make => {
                            make.height.equalTo(40);
                            make.top.left.right.bottom.inset(2);
                            //                            make.top.equalTo($("labelTitle").bottom);
                          }
                        }
                      ]
                    }
                  },
                  layout: $layout.fill
                }
              ]
            },
            data: items.map(item => {
              return {
                title: {
                  text: item.title
                },
                subTitle: {
                  text: item.subTitle
                }
              };
            })
          },
          layout: $layout.fill,
          events: {
            didSelect: (sender, indexPath, data) => {
              handler(indexPath.section, indexPath.row, data);
            }
          }
        }
      ]
    });
  }
}
class ModSQLite {
  constructor(dataBaseFile, tableId) {
    this.TABLE_ID = tableId;
    this.SQLITE = new SQLite(dataBaseFile);
  }
  hasTable() {
    return this.SQLITE.hasTable(this.TABLE_ID);
  }
  createTable() {
    this.SQLITE.createSimpleTable(this.TABLE_ID);
  }
  getItem(key) {
    return this.SQLITE.getSimpleData(this.TABLE_ID, key);
  }
  setItem(key, value) {
    return this.SQLITE.setSimpleData(this.TABLE_ID, key, value);
  }
  deleteItem(key) {
    const sql = `DELETE FROM ${this.TABLE_ID} WHERE id=?`,
      result = this.SQLITE.update(sql, [key]);
    if (result.error) {
      $console.error(result.error);
    }
    return result.result;
  }
  getError(sqlResult) {
    return this.SQLITE.getError(sqlResult);
  }
}
class ObjectKit {
  constructor(object) {
    this.OBJECT = object;
  }
  isFunction() {
    return this.isNotNull() && typeof this.OBJECT == "function";
  }
  isNotNull() {
    return this.OBJECT != undefined && this.OBJECT != null;
  }
  isNumber() {
    return this.isNotNull() && typeof this.OBJECT == "number";
  }
  isString() {
    return this.isNotNull() && typeof this.OBJECT == "string";
  }
}
class SQLite {
  constructor(dataBaseFile) {
    this.DATABASEFILE = dataBaseFile;
  }
  hasTable(tableId) {
    const result = this.query(`SELECT * FROM ${tableId}`);
    $console.info(this.getError(result));
    if (result.error) {
      $console.error(result.error);
    }
    return result.error == undefined;
  }
  init() {
    return $sqlite.open(this.DATABASEFILE);
  }
  update(sql, args = undefined) {
    const db = this.init(),
      result = db.update({
        sql: sql,
        args: args
      });
    db.close();
    return result;
  }
  query(sql, args = undefined) {
    const db = this.init(),
      queryResult = db.query({
        sql,
        args
      });
    db.close();
    return queryResult;
  }
  queryAll(tableId) {
    const result = {
        result: undefined,
        error: undefined
      },
      sql = `SELECT * FROM ${tableId}`,
      handler = (rs, err) => {
        if (err == undefined) {
          const queryResultList = [];
          while (rs.next()) {
            queryResultList.push(rs.values);
          }
          result.result = queryResultList;
        } else {
          result.error = err;
          $console.error(err);
        }
        rs.close();
      };
    this.queryHandler(sql, handler);
    return result;
  }
  queryHandler(sql, handler = undefined) {
    this.init().query(sql, handler);
  }
  createSimpleTable(table_id) {
    if (table_id != undefined && table_id.length > 0) {
      try {
        const db = this.init(),
          sql = `CREATE TABLE IF NOT EXISTS ${table_id}(id TEXT PRIMARY KEY NOT NULL, value TEXT)`;
        db.update({ sql: sql, args: undefined });
        db.close();
      } catch (error) {
        $console.error(error);
      }
    } else {
      $console.error("createSimpleTable:table_id = undefined");
    }
  }
  parseSimpleQuery(result) {
    try {
      if (result) {
        if (result.error !== null) {
          $console.error(result.error);
          return undefined;
        }
        const sqlResult = result.result,
          data = [];
        while (sqlResult.next()) {
          data.push({
            id: sqlResult.get("id"),
            value: sqlResult.get("value")
          });
        }
        sqlResult.close();
        return data;
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`parseSimpleQuery:${error.message}`);
      return undefined;
    }
  }
  parseQueryResult(result) {
    try {
      if (result) {
        if (result.error !== null) {
          $console.error(result.error);
          return undefined;
        }
        const sqlResult = result.result,
          data = [];
        while (sqlResult.next()) {
          data.push(sqlResult.values);
        }
        sqlResult.close();
        return data;
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`parseQueryResult:${error.message}`);
      return undefined;
    }
  }
  getSimpleData(table, key) {
    try {
      if (table && key) {
        this.createSimpleTable(table);
        const db = this.init(),
          sql = `SELECT * FROM ${table} WHERE id = ?`,
          args = [key],
          result = db.query({
            sql: sql,
            args: args
          }),
          sql_data = this.parseSimpleQuery(result);
        if (sql_data && sql_data.length === 1) {
          return sql_data[0].value;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } catch (error) {
      $console.error(`getSimpleData:${error.message}`);
      return undefined;
    }
  }
  setSimpleData(table, key, value) {
    try {
      if (table && key) {
        this.createSimpleTable(table);
        const db = this.init(),
          sql = this.getSimpleData(table, key)
            ? `UPDATE ${table} SET value=? WHERE id=?`
            : `INSERT INTO ${table} (value,id) VALUES (?, ?)`,
          args = [value, key],
          update_result = db.update({
            sql: sql,
            args: args
          });
        db.close();
        return update_result.result || false;
      } else {
        return false;
      }
    } catch (error) {
      $console.error(`setSimpleData:${error.message}`);
      return false;
    }
  }
  auto(table, sql_key, value = undefined) {
    this.createSimpleTable(table);
    if (!sql_key || !table) {
      return undefined;
    }
    try {
      if (value) {
        this.setSimpleData(table, sql_key, value.toString());
      }
      return this.getSimpleData(table, sql_key);
    } catch (error) {
      $console.error(`SQLite.auto:${error.message}`);
      return undefined;
    }
  }
  getError(sqlResult) {
    const isError =
      sqlResult.result == undefined || sqlResult.error != undefined;
    return {
      error: isError,
      code: isError ? sqlResult.error.code : undefined,
      message: isError ? sqlResult.error.localizedDescription : "success"
    };
  }
}
class UiKit {
  constructor() {}
  showMenu(menuList, handler = idx => {}) {
    $ui.menu({
      items: menuList,
      handler: (title, idx) => {
        handler(idx);
      }
    });
  }
  showMenuList({ title = "MENU", itemList, handler = idx => {}, type }) {
    //type: menu,push_list,popover
    switch (type) {
      case "menu":
        $ui.menu({
          items: itemList,
          handler: (title, idx) => {
            handler(idx);
          }
        });
        break;
      case "push_list":
        $ui.push({
          props: {
            title
          },
          views: [
            {
              type: "list",
              props: {
                data: itemList
              },
              layout: $layout.fill,
              events: {
                didSelect: (sender, indexPath, data) => {
                  handler(indexPath.row);
                }
              }
            }
          ]
        });
        break;
    }
  }
}
class UrlKit {
  constructor(url) {
    this.URL = new URL(url);
    if (url == undefined || this.URL == undefined) {
      throw { message: "url undefined" };
    }
  }
  getHost() {
    //return "www.example.com"
    return this.URL.host;
  }
  getPathname() {
    //return "/path"
    return this.URL.pathname;
  }
  getProtocol() {
    //return "https:"
    return this.URL.protocol;
  }
  getSearch() {
    //return "?a=1&b=2"
    return this.URL.search;
  }
  getSearchParams() {
    //return "URLSearchParams({a:1,b:2})"
    //URLSearchParams.get(a)=1
    return this.URL.searchParams;
  }
}
module.exports = {
  VERSION,
  DateTime,
  Http,
  ListView,
  Object: ObjectKit,
  Storage: {
    Keychain,
    ModSQLite,
    SQLite
  },
  UiKit,
  UrlKit
};
