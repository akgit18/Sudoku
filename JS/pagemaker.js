let _size = 3;
const inpStringC1 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col1'>";
const inpStringC2 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col2'>";
let inpPicker = false;
const table = document.getElementById("board");
const defaultMap = new Map();
//const t = document.getElementById("Theme");
//let theme = t.options[t.selectedIndex].value;
function inpPick() {
  if (inpPicker) {
    return inpStringC1;
  } else {
    return inpStringC2;
  }
}

// old function; did not color even-sized boards well
// function boardgen() {
//   for (i = 0; i < _size; i++) {
//     inpPicker = !inpPicker;
//     for (j = 0; j < _size; j++) {
//       let row = table.insertRow(j);
//       inpPicker = !inpPicker;
//       for (m = 0; m < _size; m++) {
//         inpPicker = !inpPicker;
//         for (n = 0; n < _size; n++) {
//           let cell = row.insertCell(n);
//           cell.innerHTML = inpPick();
//         }
//       }
//     }
//   }
//   inpPicker = false;
// }

function boardgen() {
  for (let i = 0; i < _size**2; i++) {
    let row = table.insertRow(i);
    if (i%_size == 0) {
      inpPicker = !inpPicker;
    }
    for (let j = 0; j < _size**2; j++) {
      if ((j > 0 || _size%2 == 0) && j%_size == 0) {
        inpPicker = !inpPicker;
      }
      let cell = row.insertCell(j);
      cell.innerHTML = inpPick();
      defaultMap.set(100 * i + j, setify(i, j)); //TODO: new single # indexing method for squares
    }
  }
  inpPicker = false;
}

function boardclear() {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    boardgen();
  }
}

/*
function reTheme(theme) {
  theme = t.options[t.selectedIndex].value;
  document.getElementById("themesheet").href = theme;
}*/

function reSize(selector, val) {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    _size = val;
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    boardgen();
  } else {
    selector.value = _size;
  }
}
