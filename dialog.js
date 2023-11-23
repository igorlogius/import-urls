/* global browser */

const regex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*/,
  "gm"
);

const requiredPermission = { permissions: ["clipboardRead"] };
const result = document.getElementById("status");
const urlspreview = document.getElementById("urlspreview");

async function importData(str) {
  //const index_offset = (await browser.tabs.query({ currentWindow: true })).length;

  let m;
  let count = 0;
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      //console.log(`Found match, group ${groupIndex}: ${match}`);

      if (groupIndex === 0) {
        // group 0 is the full match

        /*
        browser.tabs.create({
          active: false,
          discarded: true,
          url: match,
          index: index_offset + count,
        });
        */
        urlspreview.value += match + "\n";

        count++;
      }
    });
  }
  result.innerText = "Found " + count + " URLs";
}

async function onLoad() {
  let impbtn = document.getElementById("impbtn");

  // read data from file into current table
  impbtn.addEventListener("input", function (/*evt*/) {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = async function (/*e*/) {
      try {
        const data = reader.result;
        importData(data);
      } catch (e) {
        console.error(e);
        result.innerText = "Import failed!" + e;
      }
    };
    reader.readAsText(file);
  });

  let impcbbtn = document.getElementById("impcbbtn");

  impcbbtn.addEventListener("click", async () => {
    if (!(await browser.permissions.request(requiredPermission))) {
      result.innerText = "Clipboard Read Permission not available";
      return;
    }
    const str = await navigator.clipboard.readText();
    importData(str);
  });
}

document.addEventListener("DOMContentLoaded", onLoad);

urlsopen.addEventListener("click", async () => {
  console.debug("blub");

  const index_offset = (await browser.tabs.query({ currentWindow: true }))
    .length;

  let count = 0;

  urlspreview.value.split("\n").forEach((line) => {
    if (line.startsWith("http")) {
      browser.tabs.create({
        active: false,
        discarded: true,
        url: line,
        index: index_offset + count,
      });
      count++;
    }
  });
});
