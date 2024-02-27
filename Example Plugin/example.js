const { PluginCore } = require("PluginLoader"),
  $ = require("$"),
  { Http, Storage } = require("Next"),
  HttpLib = require("HttpLib");

class Example extends PluginCore {
  constructor(appKernel) {
    super({
      appKernel,
      id: "example",
      name: "Example",
      //version: "1",
      //author: "zhihaofans",
      future_tag: ["icon_name"],
      icon: "command"
    });
  }
  run(data) {
    return new Promise((resolve, reject) => {
      $ui.alert({
        title: "Hello",
        message: "World",
        actions: [
          {
            title: "OK",
            disabled: false, // Optional
            handler: () => {
              resolve();
            }
          },
          {
            title: "Cancel",
            handler: () => {
              reject({
                message: "Cancel"
              });
            }
          }
        ]
      });
    });
  }
}
module.exports = Example;
