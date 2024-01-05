/* global browser */

const regex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*/,
  "gm"
);

var requiredPermissionB = {
  permissions: ["bookmarks"],
};

const requiredPermissionA = { permissions: ["clipboardRead"] };
const result = document.getElementById("status");
const result2 = document.getElementById("status2");
const urlspreview = document.getElementById("urlspreview");
const folders = document.getElementById("folders");
const bookmarkbtn = document.getElementById("bookmarkbtn");

async function initSelect() {
  folders.disabled = false;
  const nodes = await browser.bookmarks.getTree();
  let out = new Map();
  let depth = 1;
  for (const node of nodes) {
    out = new Map([...out, ...recGetFolders(node, depth)]);
  }
  for (const [k, v] of out) {
    //console.debug(k, v.title);
    folders.add(new Option("-".repeat(v.depth) + " " + v.title, k));
  }
}

function recGetFolders(node, depth = 0) {
  let out = new Map();
  if (typeof node.url !== "string") {
    if (node.id !== "root________") {
      out.set(node.id, { depth: depth, title: node.title });
    }
    if (node.children) {
      for (let child of node.children) {
        out = new Map([...out, ...recGetFolders(child, depth + 1)]);
      }
    }
  }
  return out;
}

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
  if (await browser.permissions.contains(requiredPermissionB)) {
    await initSelect();

    folders.addEventListener("input", function (/*evt*/) {
      if (folders.value !== "") {
        bookmarkbtn.disabled = false;
      } else {
        bookmarkbtn.disabled = true;
      }
    });
  }

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
    if (!(await browser.permissions.request(requiredPermissionA))) {
      result.innerText = "Clipboard Read Permission not available";
      return;
    }
    const str = await navigator.clipboard.readText();
    importData(str);
  });
}

document.addEventListener("DOMContentLoaded", onLoad);

bookmarkbtn.addEventListener("click", async () => {

  urlspreview.value.split("\n").forEach((line) => {
    if (line.startsWith("http")) {
      browser.bookmarks.create({
        parentId: folders.value,
        url: line,
      });
    }
  });
  result2.innerText = "URLs bookmarked";
});

urlsopen.addEventListener("click", async () => {
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
  result2.innerText = "URLs Opened";
});
