const __VERSION__ = 2,
  { Storage } = require("Next");
class Cache {
  constructor(key) {
    this.KEY = key;
  }
  get() {
    return $cache.get(this.KEY);
  }
  set(value) {
    return $cache.set(this.KEY, value);
  }
}
class File {
  constructor(icloud) {
    this.IS_ICLOUD = icloud ?? false;
  }
  setIsIcloud(is_icloud) {
    this.IS_ICLOUD = is_icloud === true;
  }
  open(handler, types) {
    $drive.open({
      handler: handler,
      types: types
    });
  }
  save(name, data, handler) {
    $drive.save({
      data: data,
      name: name,
      handler: handler
    });
  }
  isDirectory(path) {
    if (!this.isExists(path)) {
      return false;
    }
    return this.IS_ICLOUD ? $drive.isDirectory(path) : $file.isDirectory(path);
  }
  isExists(path) {
    return path && this.IS_ICLOUD ? $drive.exists(path) : $file.exists(path);
  }
  ifFile(path) {
    return !$file.isDirectory(path);
  }
  getFileList(dir, ext = undefined) {
    if ($file.exists(dir) && $file.isDirectory(dir)) {
      let files = [];
      const fileList = $file.list(dir);
      fileList.map(f => {
        if (!$file.isDirectory(f)) {
          if (ext) {
            if (f.endsWith(`.${ext}`)) {
              files.push(f);
            }
          } else {
            files.push(f);
          }
        }
      });
      return files;
    } else {
      $console.error(`不存在该目录或不是目录:${dir}`);
      return undefined;
    }
  }
  readLocal(path) {
    return this.isFile(path) ? $file.read(path) : undefined;
  }
  readIcloud(path) {
    return this.isFile(path) ? $drive.read(path) : undefined;
  }
  read(path) {
    return this.IS_ICLOUD ? this.readIcloud(path) : this.readLocal;
  }
  write(path, data) {
    return this.IS_ICLOUD
      ? $drive.write({
          data: data,
          path: path
        })
      : $file.write({
          data: data,
          path: path
        });
  }
  absolutePath(path) {
    return this.IS_ICLOUD
      ? $drive.absolutePath(path)
      : $file.absolutePath(path);
  }
  getDirByFile(path) {
    if (this.isDirectory(path)) {
      return path;
    }
    if (this.isFile(path)) {
      const dir_path_end = path.lastIndexOf("/");
      if (dir_path_end >= 0) {
        return path.slice(0, dir_path_end + 1);
      }
    }
    return undefined;
  }
}
class Icloud {
  constructor() {}
  pickFile(handler, types) {
    $drive.open({
      types,
      handler: data => handler(data)
    });
  }
  pickFiles(handler, types) {
    $drive.open({
      multi: true,
      types,
      handler: data => handler(data)
    });
  }
  saveFile(fileName, data, handler) {
    $drive.save({
      name: fileName,
      data,
      handler
    });
  }
  readFile(filePath) {
    return $drive.read(filePath);
  }
  isDirectoryExist(filePath) {
    return $drive.exists(filePath) && $drive.isDirectory(filePath);
  }
  isFileExist(filePath) {
    return $drive.exists(filePath) && !$drive.isDirectory(filePath);
  }
}
class Prefs {
  constructor() {}
  getData(key) {
    return $prefs.get(key);
  }
  setData(key, value) {
    return $prefs.set(key, value);
  }
  exportData() {
    return $prefs.all();
  }
}
module.exports = {
  __VERSION__,
  Cache,
  File,
  Icloud,
  Keychain: Storage.Keychain,
  ModSQLite: Storage.ModSQLite,
  Prefs,
  SQLite: Storage.SQLite
};
