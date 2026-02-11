import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_pawn.png'
import whiteLogo from '../../assets/white_pawn.png'

export class Pawn extends Figure{


    isFirstStep: boolean = true;

    constructor(color: Colors, cell: Cell){
        super(color,cell);
        this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
        this.name = FigureNames.PAWN;
    }

    canMove(target: Cell): boolean {
        if(!super.canMove(target)){
            return false;
        }

        if (this.cell.isPawnMove(target, this.isFirstStep)) {
            return true;
        }

        const direction = this.color === Colors.BLACK ? 1 : -1;
        const enPassantPawn = this.cell.board.enPassantPawn;
        if (
          enPassantPawn &&
          enPassantPawn !== this &&
          enPassantPawn.color !== this.color &&
          enPassantPawn.cell.y === this.cell.y &&
          Math.abs(enPassantPawn.cell.x - this.cell.x) === 1 &&
          target.x === enPassantPawn.cell.x &&
          target.y === this.cell.y + direction &&
          target.isEmpty()
        ) {
          return true;
        }

        return false;
}
}
