function cookieToObject(cookie) {
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
function paramsToUrl(params) {
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
class HttpRespResult {
  constructor(resp) {
    this.resp = resp;
    this.resp_is_undefined = resp === undefined;
    if (!this.resp_is_undefined) {
      this.cookie = cookieToObject(resp.response.headers["Set-Cookie"]);
      this.data = resp.data;
      this.errorMessage = resp.error?.localizedDescription || undefined;
      this.headers = resp.response.headers;
      this.httpCode = resp.response.statusCode;
      this.isError = resp.error != undefined;
      this.raw = resp.rawData;
    }
  }
}
class Http {
  constructor(url) {
    this.HEADER = {};
    this.TIMEOUT = 5;
    this.URL = url;
  }
  cookie(cookieStr) {
    this.HEADER["Cookie"] = cookieStr;
    return this;
  }
  params(params) {
    let newUrl = this.URL;
    if (params != undefined && Object.keys(params).length > 0) {
      if (this.URL.includes("?")) {
        newUrl = this.URL.substring(0, this.URL.indexOf("?"));
      }
      newUrl += paramsToUrl(params);
    }
    this.URL = newUrl;
    return this;
  }
  get() {
    return new Promise((resolve, reject) => {
      $http
        .get({
          url: this.URL,
          header: this.HEADER,
          timeout: this.TIMEOUT
        })
        .then(resp => resolve(new HttpRespResult(resp)));
    });
  }
  header(newHeader) {
    this.HEADER = newHeader;
    return this;
  }
  post(body) {
    return new Promise((resolve, reject) => {
      $http
        .post({
          url: this.URL,
          body,
          header: this.HEADER,
          timeout: this.TIMEOUT
        })
        .then(resp =>
          resp === undefined ? reject() : resolve(new HttpRespResult(resp))
        );
    });
  }
  timeout(newTimeout) {
    if (newTimeout > 0) {
      this.TIMEOUT = newTimeout;
    }
    return this;
  }
  ua(ua) {
    this.HEADER["User-Agent"] = ua;
    return this;
  }
  url(url) {
    this.URL = url;
    return this;
  }
}
module.exports = Http;
