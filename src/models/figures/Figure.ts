import logo from '../../assets/black_king.png'
import { Cell } from '../Cell';
import { Colors } from '../Colors';

export enum FigureNames {
    FIGURE = 'Фигура',
    KING = 'Король',
    KNIGHT = 'Конь',
    PAWN = 'Пешка',
    QUEEN = 'Ферзь',
    ROOK = 'Ладья',
    BISHOP = 'Слон',
}


export class Figure{
    color: Colors;
    logo: typeof logo | null;
    cell: Cell;
    name: FigureNames;
    id: number;
    isFirstStep: boolean;

    constructor(color: Colors, cell: Cell){
        this.color = color;
        this.cell = cell;
        this.cell.figure = this;
        this.logo = null;
        this.name = FigureNames.FIGURE;
        this.id = Math.random();
        this.isFirstStep = true;
    }

    canMove(target: Cell): boolean {
        if (target.figure?.color === this.color) {
          return false;
        }
        if (
          (target.board.whiteCheck || target.board.blackCheck) &&
          target.available === false
        ) {
          return false;
        }
        return true;
      }

      
    moveFigure(_target: Cell) {
        this.isFirstStep = false;
      }
}