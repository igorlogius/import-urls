/* global browser */

sleep = (ms) => new Promise((r) => setTimeout(r, ms));

var requiredPermissionB = {
  permissions: ["bookmarks"],
};

const requiredPermissionA = { permissions: ["clipboardRead"] };
const result = document.getElementById("status");
const result2 = document.getElementById("status2");
const urlspreview = document.getElementById("urlspreview");
const folders = document.getElementById("folders");
const reqBMPer = document.getElementById("reqBookmarkPermission");
const extREinput = document.getElementById("extractregex");

reqBMPer.addEventListener("click", async () => {
  if (!(await browser.permissions.request(requiredPermissionB))) {
    result.innerText = "Bookmark Permission not granted";
    return;
  }
  location.reload();
});

async function initSelect() {
  folders.disabled = false;
  const nodes = await browser.bookmarks.getTree();
  let out = new Map();
  let depth = 1;
  for (const node of nodes) {
    out = new Map([...out, ...recGetFolders(node, depth)]);
  }
  for (const [k, v] of out) {
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

  const regex = new RegExp(extREinput.value, "gm");

  console.debug(regex);

  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
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
  result.innerText = count + " URLs found";
  result2.innerText = "";
}

function onChange(evt) {
  const id = evt.target.id;
  let el = document.getElementById(id);

  let value = el.type === "checkbox" ? el.checked : el.value;
  let obj = {};
  if (typeof value === "string") {
    value = value.trim(); // strip whitespace
  }
  obj[id] = value;

  browser.storage.local.set(obj);
}

async function onLoad() {
  if (await browser.permissions.contains(requiredPermissionB)) {
    await initSelect();
  }

  ["extractregex"].map((id) => {
    browser.storage.local
      .get(id)
      .then((obj) => {
        let el = document.getElementById(id);
        let val = obj[id];

        console.debug(id, val);

        if (typeof val !== "undefined") {
          if (el.type === "checkbox") {
            el.checked = val;
          } else {
            el.value = val;
          }
        }
      })
      .catch(console.error);

    let el = document.getElementById(id);
    el.addEventListener("input", onChange);
  });

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

folders.addEventListener("change", async () => {
  if (folders.value !== "") {
    urlspreview.value.split("\n").forEach((line) => {
      if (line.startsWith("http")) {
        browser.bookmarks.create({
          parentId: folders.value,
          url: line,
        });
      }
    });
    result2.innerText = "Done";
    folders.value = "";
  }
});

urlsopen.addEventListener("click", async () => {
  const index_offset = (await browser.tabs.query({ currentWindow: true }))
    .length;

  let count = 0;

  const discarded = !document.getElementById("openLoad").checked;
  const delay = document.getElementById("openDelay").value;

  for (const line of urlspreview.value.split("\n")) {
    if (line.startsWith("http")) {
      await browser.tabs.create({
        active: false,
        discarded,
        url: line,
        index: index_offset + count,
      });
      count++;
      if (!discarded) {
        await sleep(delay * 1000);
      }
    }
  }
  result2.innerText = "Done";
});
