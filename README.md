# Sudoku
Sudoku solver implemented in Javascript

UI designed in HTML & CSS

Has no external dependencies

## Additional Sudoku rules:

* Knightsmove: squares within a chess knight's move of each other cannot be the same number
* Kingsmove: squares within a chess king's move of each other cannot be the same number
* Orthoplus: squares cannot be +1 or -1 from any orthogonally adjacent square

## Solving methods:

* Backtracking (Recommended)
* Local Search (Does not yet work with the optional rules)

## Themes:

* "Auto" detects which theme the device is set to and uses that
* The user can also select from three other themes: Light or Dark (independent of device theme) or Pumpkin (orange and green)
