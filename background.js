/* global browser */

browser.browserAction.onClicked.addListener(() => {
  browser.windows.create({
    url: ["dialog.html"],
    type: "popup",
    width: 300,
    height: 250,
  });
});
