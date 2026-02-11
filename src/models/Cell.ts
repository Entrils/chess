import { Colors } from "./Colors";
import { Board } from "./Board";
import { Figure, FigureNames } from "./figures/Figure";
import { Pawn } from "./figures/Pawn";

export class Cell{
    readonly x: number;
    readonly y: number;
    readonly color: Colors;
    figure: Figure | null;
    board: Board;
    available: boolean;
    id: number;

    constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null){
        this.x = x;
        this.y = y;
        this.color = color;
        this.figure = figure;
        this.board = board;
        this.available = false;
        this.id = Math.random();
    }

    isEmpty(): boolean{
        return this.figure === null;
    }

    isEnemy(target: Cell): boolean{
        if(target.figure){
            return this.figure?.color !== target.figure?.color;
        }
        return false;
    }


    isEmptyVertical(target: Cell): boolean{
        if(this.x !== target.x){
            return false;
        }

        const min = Math.min(this.y, target.y);
        const max = Math.max(this.y, target.y);
        for(let i=min+1;i<max;i++){
            if (!this.board.getCell(this.x, i).isEmpty()){
                    return false
            }
        }
        return true;
    }

    isEmptyHorizontal(target: Cell): boolean{
        if(this.y !== target.y){
            return false;
        }

        const min = Math.min(this.x, target.x);
        const max = Math.max(this.x, target.x);
        for(let i=min+1;i<max;i++){
            if (!this.board.getCell(i, this.y).isEmpty()){
                    return false
            }
        }
        return true;
    }

    isEmptyDiagonal(target: Cell): boolean{
        const absX = Math.abs(target.x - this.x);
        const absY = Math.abs(target.y - this.y);
        if (absX !== absY) return false;
        
        const dy = this.y < target.y ? 1 : -1
        const dx = this.x < target.x ? 1 : -1

        for ( let i=1; i < absY;i++){
            if (!this.board.getCell(this.x+dx*i, this.y+dy*i).isEmpty()) return false;
        }

        return true;
    }

    isPawnMove(target: Cell, isFirstStep: boolean): boolean {
        const direction = this.figure?.color === Colors.BLACK ? 1 : -1;
        const firstStepDirection = this.figure?.color === Colors.BLACK ? 2 : -2;
        if (
          (target.y === this.y + direction ||
            (isFirstStep && target.y === this.y + firstStepDirection)) &&
          target.x === this.x &&
          this.board.getCell(target.x, target.y).isEmpty()
        ) {
          if (
            isFirstStep &&
            !this.board.getCell(this.x, this.y + direction).isEmpty()
          ) {
            return false;
          }
          return true;
        }
        if (
          target.y === this.y + direction &&
          (target.x === this.x + 1 || target.x === this.x - 1) &&
          this.isEnemy(target)
        ) {
          return true;
        }
        return false;
      }

    isPawnAttack(target: Cell): boolean {
        const direction = this.figure?.color === Colors.BLACK ? 1 : -1;
        if (
          target.y === this.y + direction &&
          (target.x === this.x + 1 || target.x === this.x - 1)
        ) {
          return true;
        }
        return false;
      }

      isKnightMove(target: Cell): boolean {
        const dx = Math.abs(this.x - target.x);
        const dy = Math.abs(this.y - target.y);
    
        return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
      }

    setFigure(figure: Figure){
        this.figure = figure;
        this.figure.cell = this;
    }

    addLostFigure(figure: Figure){
    figure.color === Colors.BLACK
        ?  this.board.lostBlackFigures.push(figure)
        :  this.board.lostWhiteFigures.push(figure)
    }

    moveFigure(target: Cell) {
      if (!this.figure) {
        return;
      }

      const movingFigure = this.figure;
      const startY = this.y;

      const isCastling =
        this.figure.name === FigureNames.KING &&
        this.y === target.y &&
        Math.abs(target.x - this.x) === 2;

      if (isCastling) {
        const rookFromX = target.x === 2 ? 0 : 7;
        const rookToX = target.x === 2 ? 3 : 5;
        const rookFromCell = this.board.getCell(rookFromX, this.y);
        const rookToCell = this.board.getCell(rookToX, this.y);
        const rook = rookFromCell.figure;
        const king = this.figure;

        if (!rook || rook.name !== FigureNames.ROOK) {
          return;
        }

        king.moveFigure(target);
        rook.moveFigure(rookToCell);

        target.setFigure(king);
        this.figure = null;
        rookToCell.setFigure(rook);
        rookFromCell.figure = null;
        this.board.enPassantPawn = null;
        return;
      }

      if (!this.figure.canMove(target)) {
        return;
      }

      let enPassantCapturedPawn: Figure | null = null;
      if (
        movingFigure.name === FigureNames.PAWN &&
        target.isEmpty() &&
        this.x !== target.x
      ) {
        const capturedPawnCell = this.board.getCell(target.x, this.y);
        enPassantCapturedPawn = capturedPawnCell.figure;
        capturedPawnCell.figure = null;
      }

      this.figure.moveFigure(target);
      if (target.figure) {
        this.addLostFigure(target.figure);
      }
      if (enPassantCapturedPawn) {
        this.addLostFigure(enPassantCapturedPawn);
      }
      target.setFigure(this.figure);
      this.figure = null;

      this.board.enPassantPawn = null;
      if (
        movingFigure instanceof Pawn &&
        Math.abs(target.y - startY) === 2
      ) {
        this.board.enPassantPawn = movingFigure;
      }

    }
}
