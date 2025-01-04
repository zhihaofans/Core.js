class SQLite {
  constructor(dataBaseFile) {
    this.DATABASEFILE = dataBaseFile;
  }
  createKeyValueTable(table_id) {
    return new Promise((resolve, reject) => {
      if (table_id != undefined && table_id.length > 0) {
        try {
          const db = this.init(),
            sql = `CREATE TABLE IF NOT EXISTS ${table_id}(id TEXT PRIMARY KEY NOT NULL, value TEXT)`,
            result = db.update({ sql: sql, args: undefined });
          db.close();
          resolve(result);
        } catch (error) {
          $console.error(error);
          reject(error);
        }
      } else {
        $console.error("createSimpleTable:table_id = undefined");
        reject({
          message: "createSimpleTable:table_id = undefined"
        });
      }
    });
  }
  hasTable(tableId) {
    return new Promise((resolve, reject) => {
      this.queryAll(tableId)
        .then(result => {
          if (result.error) {
            $console.error(result.error);
          }
          resolve(result.error === undefined);
        })
        .catch(error => {
          $console.error(error);
          resolve(false);
        });
    });
  }
  init() {
    return $sqlite.open(this.DATABASEFILE);
  }
  query(sql, args = undefined) {
    return new Promise((resolve, reject) => {
      const db = this.init();
      db.query(
        {
          sql,
          args
        },
        (rs, err) => {
          if (err === undefined) {
            const queryResultList = [];
            while (rs.next()) {
              queryResultList.push(rs.values);
            }
            resolve(queryResultList);
          } else {
            $console.error(err);
            reject(err);
          }
          rs.close();
        }
      );
    });
  }
  queryAll(tableId) {
    const sql = `SELECT * FROM ${tableId}`;
    return this.query(sql);
  }
  update(sql, args = undefined) {
    return new Promise((resolve, reject) => {
      try {
        const db = this.init(),
          result = db.update({
            sql: sql,
            args: args
          });
        db.close();
        resolve(result);
      } catch (error) {
        $console.error(error);
        reject(error);
      }
    });
  }
}
module.exports = SQLite;
