import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Player } from '../models/Player'
import { Colors } from '../models/Colors';

interface TimerProps{
  currentPlayer: Player  | null;
  onRequestNewGame: () => void;
  isGameOver: boolean;
  onTimeout: (winner: Colors) => void;
  restartSignal: number;
  initialTimeSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onResignWhite: () => void;
  onResignBlack: () => void;
  canResignWhite: boolean;
  canResignBlack: boolean;
}

export const Timer: FC<TimerProps> = ({
  currentPlayer,
  onRequestNewGame,
  isGameOver,
  onTimeout,
  restartSignal,
  initialTimeSeconds,
  isPaused,
  onTogglePause,
  onResignWhite,
  onResignBlack,
  canResignWhite,
  canResignBlack
}) => {
  const [blackTime, setBlackTime] = useState(initialTimeSeconds)
  const [whiteTime, setWhiteTime] = useState(initialTimeSeconds)
  const timer = useRef<null | ReturnType<typeof setInterval>>(null)

  const formatTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const decrementBlackTimer = useCallback(() => {
    setBlackTime(prev => prev - 1)
  }, [])

  const decrementWhiteTimer = useCallback(() => {
    setWhiteTime(prev => prev - 1)
  }, [])

  const startTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current)
    }

    if (isGameOver) {
      return
    }

    const callback = currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer;
    timer.current = setInterval(callback, 1000)
  }, [currentPlayer, decrementBlackTimer, decrementWhiteTimer, isGameOver])

  useEffect(() => {
    startTimer()
    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [startTimer])

  useEffect(() => {
    if (isGameOver) {
      return
    }

    if (whiteTime <= 0) {
      onTimeout(Colors.BLACK)
      return
    }

    if (blackTime <= 0) {
      onTimeout(Colors.WHITE)
    }
  }, [blackTime, whiteTime, isGameOver, onTimeout])

  useEffect(() => {
    setBlackTime(initialTimeSeconds)
    setWhiteTime(initialTimeSeconds)
  }, [restartSignal, initialTimeSeconds])

  return (
    <div className='timer'>
      <div className='timer-controls'>
        <button onClick={onRequestNewGame}>Перезапустить игру</button>
        <button
          type="button"
          className="pause-button"
          onClick={onTogglePause}
          aria-label={isPaused ? 'Продолжить игру' : 'Пауза'}
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M8 6v12l10-6-10-6z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          )}
        </button>
      </div>
      <button
        type='button'
        className='resign-button'
        onClick={onResignBlack}
        disabled={!canResignBlack}
      >
        Сдаться
      </button>
      <h2>Черные - {formatTime(blackTime)}</h2>
      <h2>Белые - {formatTime(whiteTime)}</h2>
      <button
        type='button'
        className='resign-button'
        onClick={onResignWhite}
        disabled={!canResignWhite}
      >
        Сдаться
      </button>
    </div>
  )
}
