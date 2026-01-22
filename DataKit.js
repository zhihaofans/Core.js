const VERSION = 1;
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
  setValue(key, value) {
    return this.set(key, value);
  }
  getValue(key) {
    return this.get(key);
  }
  remove(key) {
    const succeeded = $keychain.remove(key, this.DOMAIN);
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
  getAll() {
    return this.getItemList();
  }
}

class SQLite {
  constructor(dataBaseFile) {
    this.DATABASEFILE = dataBaseFile;
  }
  hasTable(tableId) {
    const result = this.query(`SELECT * FROM ${tableId}`);
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
    $console.info({
      getError: sqlResult
    });
    const isError =
      sqlResult === undefined ||
      sqlResult === null ||
      sqlResult.result !== true ||
      sqlResult.error !== undefined;
    return {
      success: !isError,
      error: isError,
      code: isError ? sqlResult.error.code : undefined,
      message: isError ? sqlResult.error.localizedDescription : "success"
    };
  }
}
// 函数
function showView(viewData) {
  $ui.window === undefined ? $ui.render(viewData) : $ui.push(viewData);
}
module.exports = {
  VERSION,
  DataView,
  KeychainKit,
  SQLite,
  SQL: SQLite
};
