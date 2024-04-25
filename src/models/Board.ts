import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Bishop } from "./figures/Bishop";
import { Figure, FigureNames } from "./figures/Figure";
import { King } from "./figures/King";
import { Knight } from "./figures/Knight";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Rook } from "./figures/Rook";

export class Board{
    cells: Cell[][] =[]
    lostBlackFigures: Figure[] = []
    lostWhiteFigures: Figure[] = []

    public initCells(){
        for (let i=0;i<8;i++){
            const row: Cell[] = []
            for (let j=0;j<8;j++){
                if((i+j)%2!==0){
                    row.push(new Cell(this,j ,i, Colors.BLACK, null)) // black
                }
                else{
                    row.push(new Cell(this,j ,i, Colors.WHITE, null)) // white
                }
            }
            this.cells.push(row);
        }
    }

    public getCell(x: number, y:number){
        return this.cells[y][x]
    }

    public highlightCells(selectedCell: Cell | null){
        for (let i=0;i<this.cells.length;i++){
            const row = this.cells[i];
            for (let j=0;j<row.length;j++){
                const target = row[j];
                target.available = !!selectedCell?.figure?.canMove(target)
            }
        }
    }

    public getCopyBoard(): Board{
        const newBoard = new Board();
        newBoard.cells = this.cells;
        newBoard.lostWhiteFigures = this.lostWhiteFigures
        newBoard.lostBlackFigures = this.lostBlackFigures
        return newBoard;
    }

    public isCellUnderAttack(target: Cell, color: Colors | undefined): boolean {
        let targetUnderAttack: boolean = false;
        this.cells.forEach((element) => {
          element.forEach((cell) => {
            if (cell.figure?.color !== color) {
              if (
                cell.figure?.name === FigureNames.PAWN &&
                cell.isPawnAttack(target)
              ) {
                targetUnderAttack = true;
              }
    
              if (
                cell.figure?.canMove(target) &&
                cell.figure?.name !== FigureNames.PAWN
              ) {
                targetUnderAttack = true;
              }
            }
          });
        });
        if (targetUnderAttack) {
          return false;
        }
        return true;
      }

    private addPawns(){
        for (let i=0;i<8;i++){
            new Pawn(Colors.WHITE, this.getCell(i,6))
            new Pawn(Colors.BLACK, this.getCell(i,1))
        }
    }

    private addKings(){
        new King(Colors.WHITE, this.getCell(4,7)) 
        new King(Colors.BLACK, this.getCell(4,0)) 
    }
    
    private addQueens(){
        new Queen(Colors.WHITE, this.getCell(3,7))
        new Queen(Colors.BLACK, this.getCell(3,0))
    }
    private addKnights(){
        for(let i=0;i<2;i++){
        new Knight(Colors.WHITE, this.getCell(1+i*5,7))
        new Knight(Colors.BLACK, this.getCell(1+i*5,0))
    }
    }
    private addBishops(){
        for(let i=0;i<2;i++){
            new Bishop(Colors.WHITE, this.getCell(2+i*3,7))
            new Bishop(Colors.BLACK, this.getCell(2+i*3,0))
        }
    }
    private addRooks(){
        for(let i=0;i<2;i++){
            new Rook(Colors.WHITE, this.getCell(0+i*7,7))
            new Rook(Colors.BLACK, this.getCell(0+i*7,0))
        }
    }

    public addFigures(){
        this.addPawns();
        this.addKings();
        this.addQueens();
        this.addRooks();
        this.addKnights();
        this.addBishops();  
    }
}