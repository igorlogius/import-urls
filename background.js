/* global browser */

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

function openImportTab() {
  browser.tabs.create({
    url: "import.html",
    active: true,
  });
}

browser.browserAction.onClicked.addListener(openImportTab);
browser.runtime.onInstalled.addListener(async (details) => {
  const extractregex =
    "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z][a-zA-Z0-9]{0,5}\\b[-a-zA-Z0-9@:%_+\\.~#?&//=]*";
  if (details.reason === "install") {
    await setToStorage("extractregex", extractregex);
    openImportTab();
  } else if (details.reason === "update") {
    await setToStorage("extractregex", extractregex);
  }
});
