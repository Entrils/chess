import React, { FC, useEffect, useRef, useState } from 'react'
import { Player } from '../models/Player'
import { Colors } from '../models/Colors';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

interface TimerProps{
    currentPlayer: Player  | null;
    restart: () => void;
}

export const Timer: FC<TimerProps> = ({currentPlayer, restart}) => {
  const [blackTime, setBlackTime] = useState(300)
  const [whiteTime, setWhiteTime] = useState(300)
  const timer = useRef<null | ReturnType<typeof setInterval>>(null)

  useEffect(()=>{
    startTimer()
  }, [currentPlayer])

  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  function startTimer(){
    if(timer.current){
      clearInterval(timer.current)
    }
    const callback = currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer;
    timer.current = setInterval(callback,1000)
  }

  function decrementBlackTimer(){
    setBlackTime(prev => prev-1)
  }

  function decrementWhiteTimer(){
    setWhiteTime(prev => prev -1)
  }

  const handleRestart = () => {
    setBlackTime(300)
    setWhiteTime(300)
    restart()
  }
  return (
    <div>
      {whiteTime && blackTime ? (
    <div className='timer'>
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      <h2>Черные - {blackTime} с.</h2>
      <h2>Белые  - {whiteTime} с.</h2>
    </div>
      ) : (
        <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Время вышло! {whiteTime ? "White" : "Black"} выиграли! Поздравляем!
          Еще одну игру?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleRestart}>
            Новая игра
          </Button>
        </Modal.Footer>
      </Modal>
    )}
    </div>
  )
}
