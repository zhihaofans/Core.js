const __VERSION__ = 4;
class Console {
  auto(success = true, message) {
    success ? $console.info(message) : $console.error(message);
  }
}
class File {
  ifFile(path) {
    if (path && $file.exists(path)) {
      if ($file.isDirectory(path)) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
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
}
class Http {
  constructor(timeout = 5) {
    this.TIMEOUT = timeout;
  }
  async get(url, header) {
    const result = await $http.get({
      url: url,
      timeout: this.TIMEOUT,
      header: header
    });
    return url ? result : undefined;
  }
  async post(url, postBody, header = undefined) {
    const result = await $http.post({
      url: url,
      header: header,
      timeout: this.TIMEOUT,
      body: postBody
    });
    return url ? result : undefined;
  }
}
class Push {
  default(title = "标题", body = "内容", mute = true) {
    $push.schedule({
      title: title,
      body: body,
      mute: mute
    });
  }
}
class Share {
  isAction() {
    return $app.env == $env.action;
  }
  isSafari() {
    return $app.env == $env.safari;
  }
  isActionOrSafari() {
    return Share.isAction() || Share.isSafari();
  }
  getImage() {
    if (Share.isAction()) {
      return $context.image || undefined;
    }
    return undefined;
  }
  getText() {
    if (Share.isAction()) {
      return $context.text || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari.title || undefined;
    }
    return undefined;
  }
  getLink() {
    if (Share.isAction()) {
      return $context.link || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari ? $context.safari.items.location.href : undefined;
    }
    return undefined;
  }
  getLinks() {
    if (Share.isAction()) {
      return $context.linkItems || undefined;
    }
    if (Share.isSafari()) {
      return $context.safari
        ? [$context.safari.items.location.href]
        : undefined;
    }
    return undefined;
  }
}
class String {
  copy(str) {
    $clipboard.copy({
      text: str,
      ttl: 30,
      locally: true
    });
  }
  paste() {
    return $clipboard.text || "";
  }
  toQrcode(str) {
    return $qrcode.encode(str);
  }
  fromQrcode(qrcode) {
    return $qrcode.decode(qrcode);
  }
  toJson(str) {
    return JSON.parse(str);
  }
  fromJson(json) {
    return JSON.stringify(json);
  }
  getListFromL10n(sourceList) {
    return sourceList ? sourceList.map(x => $l10n(x)) : [];
  }
}
class Time {
  getUnixTime() {
    return new Date().getTime();
  }
  getSecondUnixTime() {
    return Math.round(new Date().getTime() / 1000);
  }
  toLocaltime(ISO8601, timezone = "Asia/Shanghai") {
    const moment = require("moment");
    return moment(ISO8601).tz(timezone).format("YYYY-MM-DD hh:mm:ss");
  }
}
class View {
  constructor() {
    this.List = {
      push: (title, listData, didSelect) => {
        $ui.push({
          props: {
            title: title
          },
          views: [
            {
              type: "list",
              props: {
                autoRowHeight: true,
                estimatedRowHeight: 10,
                data: listData
              },
              layout: $layout.fill,
              events: {
                didSelect: didSelect
              }
            }
          ]
        });
      }
    };
    this.Image = {
      showSingleMenu: imageUrl => {
        if (imageUrl) {
          const links = $detector.link(imageUrl);
          let imageLink = imageUrl;
          if (links.length > 1) {
            imageLink = imageUrl[0];
          }
          $ui.menu({
            items: ["用Safari打开", "分享", "快速预览", "网页预览"],
            handler: function (title, idx) {
              switch (idx) {
                case 0:
                  $app.openURL(imageLink);
                  break;
                case 1:
                  $share.sheet([imageLink]);
                  break;
                case 2:
                  $quicklook.open({
                    url: imageLink,
                    handler: function () {
                      $console.info(imageLink);
                    }
                  });
                  break;
                case 3:
                  $ui.preview({
                    title: title,
                    url: imageLink
                  });
                  break;
                default:
                  return;
              }
            }
          });
        } else {
          return;
        }
      },
      ShowMultGallery: urlList => {
        $ui.push({
          props: {
            title: ""
          },
          views: [
            {
              type: "gallery",
              props: {
                items: urlList.map(u => ({
                  type: "image",
                  props: {
                    src: u
                  }
                })),
                interval: 3,
                radius: 5.0
              },
              layout: function (make, view) {
                make.left.right.inset(10);
                make.centerY.equalTo(view.super);
                make.height.equalTo(320);
              }
            }
          ]
        });
      }
    };
  }
}
module.exports = {
  __VERSION__,
  Console,
  File,
  Http,
  Push,
  Share,
  String,
  Time,
  View
};
