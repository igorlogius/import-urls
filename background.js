/* global browser */

function openImportTab() {
  browser.tabs.create({
    url: "import.html",
    active: true,
  });
}

browser.browserAction.onClicked.addListener(openImportTab);
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    openImportTab();
  }
});
