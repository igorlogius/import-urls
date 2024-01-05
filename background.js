/* global browser */

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    url: "import.html",
    active: true,
  });
});
