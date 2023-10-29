/* global browser */

const regex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*/,
  "gm"
);
const result = document.getElementById("status");

async function importData(data) {
  let count = 0;
  const str = data;

  const lines = data.split(/\r?\n|\r|\n/g);

  for (const line of lines) {
    //console.debug(line);

    /*
  	const parts = line.split(/https?:\/\//);
	for(const part of parts){
		console.log(line);
		const possible_url = part.split(' ')[0];
	}
		*/

    let offset = 0;

    for (const proto of ["https://", "http://"]) {
      const proto_pos = line.indexOf(proto, offset);

      if (proto_pos === -1) {
        break;
      }

      let blank_pos = line.indexOf(" ", proto_pos + 1);

      console.debug(blank_pos);

      if (blank_pos === -1) {
        blank_pos = line.indexOf("'", proto_pos + 1);
        console.debug(blank_pos);

        if (blank_pos === -1) {
          blank_pos = line.indexOf('"', proto_pos + 1);
          console.debug(blank_pos);

          if (blank_pos === -1) {
            blank_pos = line.length;
          }
        }
      }

      //const possible_url = line.substr(proto_pos, blank_pos);
      const possible_url = line.substr(blank_pos);

      console.debug(possible_url);
      offset = proto_pos + 1;
    }
  }
  return;

  let m;
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
    //console.log('impbtn');
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
