let _size = 3;
const inpStringC1 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col1'>";
const inpStringC2 = "<input inputmode='numeric' size='1' maxlength='2' autocomplete='off' class='col2'>";
const table = document.getElementById("board") as HTMLTableElement;
const defaultMap = new Map();
//const t = document.getElementById("Theme");
//let theme = t.options[t.selectedIndex].value;
function getInputElement(oddInputStyle: boolean) {
  if (oddInputStyle) {
    return inpStringC1;
  } else {
    return inpStringC2;
  }
}

function createBoard() {
  let oddInputStyle = false;
  for (let i = 0; i < _size**2; i++) {
    let row = table.insertRow(i);
    if (i%_size == 0) {
      oddInputStyle = !oddInputStyle;
    }
    for (let j = 0; j < _size**2; j++) {
      if ((j > 0 || _size%2 == 0) && j%_size == 0) {
        oddInputStyle = !oddInputStyle;
      }
      let cell = row.insertCell(j);
      cell.innerHTML = getInputElement(oddInputStyle);
      defaultMap.set(100 * i + j, setify(i, j)); //TODO: new single # indexing method for squares
    }
  }
}

function boardClear() {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    createBoard();
  }
}

/*
function reTheme(theme) {
  theme = t.options[t.selectedIndex].value;
  document.getElementById("themesheet").href = theme;
}*/

function reSize(selector: HTMLSelectElement, val: string) {
  if (confirm("Are you sure? This will erase any data you have currently entered.")) {
    _size = parseInt(val, 10);
    table.removeChild(document.getElementsByTagName('tbody')[0]);
    createBoard();
  } else {
    selector.value = _size.toString(10);
  }
}

// function generateBoard() {
//   const starterboard = [];
//   const row = [];
//   for (let j = 0; j < _size**2; j++) {
//     row.push(-1);
//   }
//   for (let i = 0; i < _size**2; i++) {
//     starterboard.push(row);
//   }
//   let rand = Math.floor(Math.random() * 9);
// }

// function shuffleRowBlocks(params) {
  
// }

// setup board + onclick/onchange functions
document.body.onload = () => {
  createBoard();
  (document.getElementById('cboard') as HTMLButtonElement).onclick = () => boardClear();
  (document.getElementById('sboard') as HTMLButtonElement).onclick = () => sudokize();
  const sz = document.getElementById('Size') as HTMLSelectElement;
  sz.onchange = () => reSize(sz, sz.value);
  const solver = document.getElementById('Solver') as HTMLSelectElement;
  solver.onchange = () => useSolver(solver.value);
  for (const toggleable of (document.getElementsByClassName('lb1') as any)) {
    (toggleable as HTMLLabelElement).onchange = () => toggleRule(toggleable, toggleable.children[0]);
  }
}
