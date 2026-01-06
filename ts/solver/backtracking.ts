import { pointToIndex, TypedUintArray } from "../common/common";
import { isLegalSpace, nextEmptySpace } from "./legality";
import { Rule } from "./rules";

export function backtracking(boardRef: TypedUintArray, i: number, j: number, edgeSize: number, rules: Rule[]): boolean {
    const index = pointToIndex(i, j, edgeSize);
    for (let guess = 1; guess < (edgeSize + 1); ++guess) {
        boardRef[index] = guess;
        if (isLegalSpace(boardRef, i, j, edgeSize, rules)) {
            const sq = nextEmptySpace(boardRef, edgeSize);
            if (sq) {
                const solved = backtracking(boardRef, sq[0], sq[1], edgeSize, rules);
                if (solved) {
                    return true;
                }
            } else {
                return true;
            }
        }
    }
    boardRef[index] = -1;
    return false;
}