import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_queen.png'
import whiteLogo from '../../assets/white_queen.png'

export class Queen extends Figure{
    constructor(color: Colors, cell: Cell){
        super(color,cell);
        this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
        this.name =FigureNames.BISHOP;
    }
}