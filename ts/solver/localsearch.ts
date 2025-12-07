import { Point, pointToIndex, TypedUintArray } from "../common/common";
import { isLegalAll, minViolatingOption, nextEmptySpace, numViolationsSpace } from "./legality";

// solves a 2-d Sudoku array (local search method)
// not guaranteed to work
export function localSearch(board: TypedUintArray, i: number, j: number, edgeSize: number) {
    //let oBoard = getBoard();
    //let numVboard = [];
    // setTimeout(function(){
    //   if (confirm("It has been 10 seconds since starting. Local search may be unable to solve this. Would you like to abort?")) {
    //     throw new Error("Solve aborted.");
    //   } else {
    //     alert("There is no guarantee that this method will solve. It may run forever.")
    //   }
    // }, 10000);
    //randomly fill board
    let sq: Point | undefined;
    let newSqList: Point[] = [];
    while (sq = nextEmptySpace(board, edgeSize)) {
        const index = pointToIndex(sq[0], sq[1], edgeSize);
        board[index] = minViolatingOption(board, edgeSize, sq[0], sq[1]);
        newSqList.push(sq);
    }
    //find random violating square
    let numViols;
    const maxNumIts = 1000 * edgeSize;
    for (let numIts = 0; numIts < maxNumIts; numIts++) {
        numViols = 0;
        //
        //   sendBoard(board);
        let rsq = newSqList[Math.floor(Math.random() * newSqList.length)];
        const index = pointToIndex(rsq[0], rsq[1], edgeSize);
        const pointVal = board[index];
        if (numViols = numViolationsSpace(board, edgeSize, rsq[0], rsq[1], pointVal)){
            board[index] = minViolatingOption(board, edgeSize, rsq[0], rsq[1]);
        }
        if(isLegalAll(board, edgeSize, newSqList)) {
            return true;
        }
    }
    throw new Error(`${maxNumIts} iterations exceeded without finding a solution.`);
  }