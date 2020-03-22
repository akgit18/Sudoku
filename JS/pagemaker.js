let _size = 3;
const inpStringC1 = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='col1'>";
const inpStringC2 = "<input inputmode='numeric' size='1' maxlength='1' autocomplete='off' class='col2'>";
let inpPicker = false;
const table = document.getElementById("board");
const t = document.getElementById("Theme");
let theme = t.options[t.selectedIndex].value;
function inpPick() {
  if (inpPicker) {
    return inpStringC1;
  } else {
    return inpStringC2;
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
  theme = t.options[t.selectedIndex].value;
  document.getElementById("themesheet").href = theme;
  //boardclear();
}

function reSize() {
  s = document.getElementById("Size");
  _size = s.options[s.selectedIndex].value;
  boardclear();
}
