let _size = 3;
const inpStringOrange = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='o'>";
const inpStringGreen = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='g'>";
const inpStringLightGrey = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='lg'>";
const inpStringDarkGrey = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='dg'>";
let inpPicker = false;
const table = document.getElementById("board");
let t = document.getElementById("Theme");
let theme = t.options[t.selectedIndex].value;
//console.log(t.options[t.selectedIndex].value);

function inpPick() {
  if (theme == 1) {
    if (inpPicker) {
      return inpStringLightGrey;
    } else {
      return inpStringDarkGrey;
    }
  } else if (theme == 2) {
    if (inpPicker) {
      return inpStringOrange;
    } else {
      return inpStringGreen;
    }
  }
}

function boardgen() {
  for (i = 0; i < _size; i++) {
    inpPicker = !inpPicker;
    for (j = 0; j < _size; j++) {
      let row = table.insertRow(j);
      inpPicker = !inpPicker;
      for (m = 0; m < _size; m++) {
        inpPicker = !inpPicker;
        for (n = 0; n < _size; n++) {
          let cell = row.insertCell(n);
          cell.innerHTML = inpPick();
        }
      }
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

function reTheme() {
  t = document.getElementById("Theme");
  theme = t.options[t.selectedIndex].value;
  boardclear();
}

function reSize() {
  s = document.getElementById("Size");
  _size = s.options[s.selectedIndex].value;
  boardclear();
}
