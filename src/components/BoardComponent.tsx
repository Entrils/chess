import React, { FC, useEffect, useState } from 'react'
import { Board } from '../models/Board'
import { CellComponent } from './CellComponent';
import { Cell } from '../models/Cell';
import { Player } from '../models/Player';

interface BoardProps {
    restart: () => void;
    board: Board;
    setBoard: (board: Board) => void;
    currentPlayer: Player | null;
    switchPlayer: () => void;
}

const BoardComponent: FC<BoardProps> = ({board, setBoard, currentPlayer, switchPlayer, restart}) => {

    const [selectedCell, setSelectedCell]= useState<Cell | null>(null);


    function click(cell: Cell){
        if(selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)){
            selectedCell?.moveFigure(cell);
            switchPlayer()
            setSelectedCell(null);
        } else{
            if(cell.figure?.color === currentPlayer?.color){
            setSelectedCell(cell);
            }
        }
    }

    useEffect(()=>{
        highlightCells()
    },[selectedCell])

    function highlightCells() {
        board.highlightCells(selectedCell, currentPlayer?.color);
        updateBoard()
    }

    function updateBoard(){
        const newBoard =  board.getCopyBoard()
        setBoard(newBoard)
    }

  return (
    <div>
    <h3 style={{'color':'white'}}>Текущий игрок {currentPlayer?.color}</h3>
      <div className='board'>
        {board.cells.map((row,index)=>
            <React.Fragment key={index}>
                {row.map(cell =>
                    <CellComponent 
                    click = {click} 
                    cell={cell} 
                    key={cell.id} 
                    selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}/>
                )}
            </React.Fragment>
        )}
    </div>
    </div>
  )
}

export default BoardComponent;