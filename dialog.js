/* global browser */

const regex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*/,
  "gm"
);
const result = document.getElementById("status");

async function importData(str) {
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

        browser.tabs.create({
          active: false,
          discarded: true,
          url: match,
          index: 0,
        });

        count++;
      }
    });
  }
  result.innerText = "Done. Created " + count + " Tabs";
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
}

document.addEventListener("DOMContentLoaded", onLoad);
