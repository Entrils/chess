import React, { FC, useState } from 'react'
import { Board } from '../models/Board'
import { CellComponent } from './CellComponent';
import { Cell } from '../models/Cell';
import { FigureNames } from '../models/figures/Figure';
import { Player } from '../models/Player';

interface BoardProps {
    board: Board;
    setBoard: (board: Board) => void;
    currentPlayer: Player | null;
    switchPlayer: () => void;
    isGameOver: boolean;
    onPromotionRequired: (cell: Cell) => void;
    promotionPending: boolean;
    isPaused: boolean;
}

const BoardComponent: FC<BoardProps> = ({
  board,
  setBoard,
  currentPlayer,
  switchPlayer,
  isGameOver,
  onPromotionRequired,
  promotionPending,
  isPaused
}) => {

    const [selectedCell, setSelectedCell]= useState<Cell | null>(null);

    function highlightCells(cell: Cell | null) {
        board.highlightCells(cell, currentPlayer?.color);
        const newBoard = board.getCopyBoard();
        setBoard(newBoard);
    }

    function click(cell: Cell){
        if (isGameOver || promotionPending || isPaused) {
          return;
        }

        if(selectedCell && selectedCell !== cell && cell.available){
            selectedCell?.moveFigure(cell);
            board.pawnReady();
            if (board.promotePawnCell?.figure?.name === FigureNames.PAWN) {
              setSelectedCell(null);
              board.highlightCells(null, currentPlayer?.color);
              setBoard(board.getCopyBoard());
              onPromotionRequired(board.promotePawnCell);
              return;
            }
            board.isCheckmate(currentPlayer?.color);
            switchPlayer()
            setSelectedCell(null);
            board.highlightCells(null, currentPlayer?.color);
            setBoard(board.getCopyBoard());
        } else{
            if(cell.figure?.color === currentPlayer?.color){
              setSelectedCell(cell);
              highlightCells(cell);
            } else {
              setSelectedCell(null);
              highlightCells(null);
            }
        }
    }

  return (
    <div>
    <h3 style={{'color':'white'}}>
      Текущий игрок {currentPlayer?.color === 'white' ? 'Белые' : 'Черные'}
    </h3>
      <div className='board-wrap'>
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
        {isPaused && <div className='board-pause-overlay'>ПАУЗА</div>}
      </div>
    </div>
  )
}

export default BoardComponent;
