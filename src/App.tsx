import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './App.css';
import whiteBishop from './assets/white_bishop.png';
import whiteKnight from './assets/white_knight.png';
import whiteQueen from './assets/white_queen.png';
import whiteRook from './assets/white_rook.png';
import blackBishop from './assets/black_bishop.png';
import blackKnight from './assets/black_knight.png';
import blackQueen from './assets/black_queen.png';
import blackRook from './assets/black_rook.png';
import BoardComponent from './components/BoardComponent';
import { LostFigures } from './components/LostFigures';
import { Timer } from './components/Timer';
import { Board } from './models/Board';
import { Cell } from './models/Cell';
import { Colors } from './models/Colors';
import { FigureNames } from './models/figures/Figure';
import { Player } from './models/Player';

type GameResultReason = 'checkmate' | 'stalemate' | 'timeout' | 'resign';

interface GameResult {
  reason: GameResultReason;
  winner?: Colors;
}

const TIME_OPTIONS = [
  { seconds: 60, label: '1 мин' },
  { seconds: 180, label: '3 мин' },
  { seconds: 300, label: '5 мин' },
  { seconds: 600, label: '10 мин' },
  { seconds: 900, label: '15 мин' },
  { seconds: 1800, label: '30 мин' }
];

function createInitialBoard() {
  const newBoard = new Board();
  newBoard.initCells();
  newBoard.addFigures();
  return newBoard;
}

function App() {
  const [whitePlayer] = useState(() => new Player(Colors.WHITE));
  const [blackPlayer] = useState(() => new Player(Colors.BLACK));
  const [board, setBoard] = useState(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(whitePlayer);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [restartSignal, setRestartSignal] = useState(0);
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeControlSeconds, setTimeControlSeconds] = useState(300);
  const [showTimeControlModal, setShowTimeControlModal] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = useCallback((selectedSeconds: number) => {
    setBoard(createInitialBoard());
    setCurrentPlayer(whitePlayer);
    setGameResult(null);
    setPromotionCell(null);
    setIsPaused(false);
    setTimeControlSeconds(selectedSeconds);
    setShowTimeControlModal(false);
    setGameStarted(true);
    setRestartSignal((prev) => prev + 1);
  }, [whitePlayer]);

  const requestNewGame = useCallback(() => {
    setGameResult(null);
    setPromotionCell(null);
    setIsPaused(false);
    setShowTimeControlModal(true);
    setGameStarted(false);
  }, []);

  const switchPlayer = useCallback(() => {
    setCurrentPlayer((prevPlayer) =>
      prevPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer
    );
  }, [blackPlayer, whitePlayer]);

  const handleTimeout = useCallback((winner: Colors) => {
    setGameResult((prevResult) => prevResult ?? { reason: 'timeout', winner });
  }, []);

  const handlePromotionRequired = useCallback((cell: Cell) => {
    setPromotionCell(cell);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (!gameStarted || !!gameResult || !!promotionCell) {
      return;
    }
    setIsPaused((prev) => !prev);
  }, [gameStarted, gameResult, promotionCell]);

  const handleResign = useCallback((side: Colors) => {
    if (!gameStarted || !!gameResult || !!promotionCell || isPaused) {
      return;
    }
    setGameResult({
      reason: 'resign',
      winner: side === Colors.WHITE ? Colors.BLACK : Colors.WHITE
    });
  }, [gameStarted, gameResult, promotionCell, isPaused]);

  const handlePromotePawn = useCallback((type: FigureNames) => {
    if (!promotionCell?.figure?.color) {
      return;
    }

    board.promotePawn(promotionCell.figure.color, promotionCell, type);
    board.promotePawnCell = null;
    board.isCheckmate(currentPlayer?.color);
    switchPlayer();
    board.highlightCells(null, currentPlayer?.color);
    setBoard(board.getCopyBoard());
    setPromotionCell(null);
  }, [board, currentPlayer?.color, promotionCell, switchPlayer]);

  const handleStartWithTime = useCallback(() => {
    startGame(timeControlSeconds);
  }, [startGame, timeControlSeconds]);

  useEffect(() => {
    if (!gameStarted || gameResult || promotionCell) {
      return;
    }

    if (board.checkmate) {
      const winner =
        currentPlayer?.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
      setGameResult({ reason: 'checkmate', winner });
      return;
    }

    if (board.stalemate) {
      setGameResult({ reason: 'stalemate' });
    }
  }, [board.checkmate, board.stalemate, currentPlayer, gameResult, gameStarted, promotionCell]);

  const modalTitle =
    gameResult?.reason === 'checkmate'
      ? 'Мат'
      : gameResult?.reason === 'stalemate'
      ? 'Пат'
      : gameResult?.reason === 'timeout'
      ? 'Время вышло'
      : gameResult?.reason === 'resign'
      ? 'Противник сдался'
      : '';

  const modalBody =
    gameResult?.reason === 'stalemate'
      ? 'Игра завершилась вничью: пат.'
      : `Победитель: ${gameResult?.winner === Colors.WHITE ? 'Белые' : 'Черные'}.`;

  const isGameBlocked = !gameStarted || !!gameResult || !!promotionCell || isPaused;
  const isWhitePromotion = promotionCell?.figure?.color === Colors.WHITE;
  const promotionOptions = [
    {
      type: FigureNames.QUEEN,
      logo: isWhitePromotion ? whiteQueen : blackQueen,
      alt: 'Ферзь'
    },
    {
      type: FigureNames.ROOK,
      logo: isWhitePromotion ? whiteRook : blackRook,
      alt: 'Ладья'
    },
    {
      type: FigureNames.BISHOP,
      logo: isWhitePromotion ? whiteBishop : blackBishop,
      alt: 'Слон'
    },
    {
      type: FigureNames.KNIGHT,
      logo: isWhitePromotion ? whiteKnight : blackKnight,
      alt: 'Конь'
    }
  ];

  return (
    <div className="App">
      <Timer
        onRequestNewGame={requestNewGame}
        currentPlayer={currentPlayer}
        isGameOver={isGameBlocked}
        onTimeout={handleTimeout}
        restartSignal={restartSignal}
        initialTimeSeconds={timeControlSeconds}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onResignWhite={() => handleResign(Colors.WHITE)}
        onResignBlack={() => handleResign(Colors.BLACK)}
        canResignWhite={
          gameStarted &&
          !isGameBlocked &&
          currentPlayer?.color === Colors.WHITE
        }
        canResignBlack={
          gameStarted &&
          !isGameBlocked &&
          currentPlayer?.color === Colors.BLACK
        }
      />
      <BoardComponent
        board={board}
        setBoard={setBoard}
        currentPlayer={currentPlayer}
        switchPlayer={switchPlayer}
        isGameOver={!gameStarted || !!gameResult}
        onPromotionRequired={handlePromotionRequired}
        promotionPending={!!promotionCell}
        isPaused={isPaused}
      />
      <div>
        <LostFigures title="Побитые черные фигуры:" figures={board.lostBlackFigures} />
        <LostFigures title="Побитые белые фигуры:" figures={board.lostWhiteFigures} />
      </div>

      <Modal
        show={showTimeControlModal}
        backdrop="static"
        backdropClassName="game-over-backdrop"
        keyboard={false}
        centered
        className="game-over-modal"
        contentClassName="game-over-modal-content"
      >
        <Modal.Header className="game-over-modal-header">
          <Modal.Title className="game-over-modal-title">Контроль времени</Modal.Title>
        </Modal.Header>
        <Modal.Body className="time-control-body">
          <div className="time-control-options">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.seconds}
                type="button"
                className={[
                  'time-option-button',
                  timeControlSeconds === option.seconds ? 'time-option-button-active' : ''
                ].join(' ')}
                onClick={() => setTimeControlSeconds(option.seconds)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="game-over-modal-footer">
          <Button className="game-over-modal-button" onClick={handleStartWithTime}>
            Начать игру
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!promotionCell}
        backdrop="static"
        backdropClassName="game-over-backdrop"
        keyboard={false}
        centered
        className="game-over-modal"
        contentClassName="game-over-modal-content"
      >
        <Modal.Body className="promotion-gallery">
          {promotionOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              className="promotion-image-button"
              onClick={() => handlePromotePawn(option.type)}
            >
              <img src={option.logo} alt={option.alt} />
            </button>
          ))}
        </Modal.Body>
      </Modal>

      <Modal
        show={!!gameResult}
        backdrop="static"
        backdropClassName="game-over-backdrop"
        keyboard={false}
        centered
        className="game-over-modal"
        contentClassName="game-over-modal-content"
      >
        <Modal.Header className="game-over-modal-header">
          <Modal.Title className="game-over-modal-title">{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="game-over-modal-body">{modalBody}</Modal.Body>
        <Modal.Footer className="game-over-modal-footer">
          <Button className="game-over-modal-button" onClick={requestNewGame}>
            Новая игра
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
