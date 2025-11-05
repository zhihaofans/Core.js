function cookieToObject(cookieStr) {
  const cookieParts = cookieStr.split(/,(?=\s*[a-zA-Z0-9_-]+=)/);

  const cookies = {};
  for (const part of cookieParts) {
    const match = part.match(/^\s*([^=]+)=([^;]+)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      cookies[key] = value;
    }
  }
  return cookies;
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
      try {
        this.cookieString = resp.response.headers["Set-Cookie"];
        if (this.cookieString != undefined && this.cookieString.length > 0) {
          this.cookie = cookieToObject(resp.response.headers["Set-Cookie"]);
        }
        this.data = resp.data;
        this.errorMessage = resp.error?.localizedDescription || undefined;
        this.headers = resp.response.headers;
        this.httpCode = resp.response.statusCode;
        this.isError = resp.error != undefined;
        this.raw = resp.rawData;
      } catch (error) {
        $console.error(error);
        this.isError = true;
        this.errorMessage = error.message;
      } finally {
      }
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
