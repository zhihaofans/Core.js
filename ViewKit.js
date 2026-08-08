class ColorData {
  constructor() {
    this.COLOR = {
      BLACK_WHITE: this.getColor("black", "white"),
      GRAY: this.getColor("gray")
    };
    this.titleTextColor = this.getColor("white", "black");
    this.videoItemBgcolor = this.COLOR.GRAY;
    this.navSelectedTextColor = this.COLOR.BLACK_WHITE;
    this.navTextColor = this.COLOR.GRAY;
    this.navSelectedIconColor = this.COLOR.BLACK_WHITE;
    this.navIconColor = this.COLOR.GRAY;
  }
  getColor(light, dark) {
    return dark
      ? $color({
          light,
          dark
        })
      : $color(light);
  }
}
class ViewUtil {
  constructor() {}
  showView(viewData) {
    $ui.window === undefined ? $ui.render(viewData) : $ui.push(viewData);
  }
}
class ListView {
  constructor() {
    this.viewUtil = new ViewUtil();
  }
  showTextList(title, itemList, onClick = idx => {}) {
    this.viewUtil.showView({
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
              onClick(indexPath.row);
            }
          }
        }
      ]
    });
  }
}
class NavView {
  constructor() {
    this.ViewUtil = new ViewUtil();
  }
  showNavView({ title, navList, mainViewData }) {
    const COLOR = new ColorData();

    return new Promise((resolve, reject) => {
      const navData = navList.map(item => {
          return {
            menu_image: {
              symbol: item.icon,
              tintColor: item.selected
                ? COLOR.navSelectedIconColor
                : COLOR.navIconColor
            },
            menu_label: {
              text: item.title,
              textColor: item.selected
                ? COLOR.navSelectedTextColor
                : COLOR.navTextColor
            }
          };
        }),
        ViewData = [
          {
            type: "view",
            props: {},
            layout: $layout.fill,
            events: {
              //tapped: function (sender) {}//会与子视图的点击事件冲突
            },
            views: [mainViewData]
          },
          {
            type: "matrix",
            props: {
              id: "tab",
              columns: 3,
              itemHeight: 50,
              spacing: 0,
              scrollEnabled: false,
              //bgcolor: $color("clear"),
              template: [
                {
                  type: "view",
                  props: {
                    id: "view_item"
                  },
                  layout: (make, view) => {
                    make.size.equalTo(view.super);
                    make.center.equalTo(view.super);
                  },
                  views: [
                    {
                      type: "image",
                      props: {
                        id: "menu_image",
                        resizable: true,
                        clipsToBounds: false
                      },
                      layout: (make, view) => {
                        make.centerX.equalTo(view.super);
                        make.size.equalTo($size(25, 25));
                        make.top.inset(6);
                      }
                    },
                    {
                      type: "label",
                      props: {
                        id: "menu_label",
                        font: $font(10)
                      },
                      layout: (make, view) => {
                        var preView = view.prev;
                        make.centerX.equalTo(preView);
                        make.bottom.inset(5);
                      }
                    }
                  ]
                }
              ],
              data: navData
            },
            layout: (make, view) => {
              make.bottom.inset(0);
              if ($device.info.screen.width > 500) {
                make.width.equalTo(500);
              } else {
                make.left.right.equalTo(0);
              }
              make.centerX.equalTo(view.super);
              make.height.equalTo(50);
            },
            events: {
              didSelect(sender, indexPath, data) {
                const navItem = navList[indexPath.row];
                if (
                  navItem.func !== undefined &&
                  typeof navItem.func === "function"
                ) {
                  try {
                    navItem.func();
                  } catch (error) {
                    $console.error(error);
                    $ui.error(error.message);
                  }
                } else {
                  $console.info(indexPath.row);
                }
              }
            }
          }
        ];
      this.ViewUtil.showView({
        props: {
          title
        },
        views: [
          {
            type: "view",
            layout: $layout.fillSafeArea,
            views: ViewData,
            events: {
              ready: sender => {
                resolve(sender);
              }
            }
          }
        ]
      });
    });
  }
}

module.exports = { ListView, NavView };
