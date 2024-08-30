import "../styles/BotonDeCarga.scss";

import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import React from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

export default class BotonDeCarga extends React.Component {
  constructor() {
    super();
    this.state = {
      isAnimating: false,
    };
  }

  obtenerRefDeConfetti = (confetiRef) => {
    this.conffeti = confetiRef;
  };

  confettiConfig = () => {
    return {
      particleCount: 10,
      angle: 90,
      spread: 90,
      startVelocity: 18,
      origin: { x: 0.5, y: 0.75 },
      colors: ["#98DB00", "#DCF4D4", "#62B246"],
    };
  };

  confetierla = () => {
    clearTimeout(this.timerDeAnimacion);
    this.setState({ isAnimating: true });
    this.conffeti(this.confettiConfig());
    this.timerDeAnimacion = setTimeout(() => {
      this.setState({ isAnimating: false });
    }, 1500);
  };

  onClickBotonDeshabilitado = (e) => {
    e.preventDefault();
    this.props.enfocarProximoCampo();
  };

  render() {
    return (
      <div className="botonCarga">
        <button
          data-testid="boton-cargar-horas"
          onClick={
            this.props.puedeEnviar
              ? this.confetierla
              : this.onClickBotonDeshabilitado
          }
          className={classNames("boton", {
            ready: this.props.puedeEnviar,
            disabled: !this.props.puedeEnviar,
            clickedAnimation: this.state.isAnimating,
          })}
          onKeyDown={this.summit}
          ref={this.props.buttonRef}
        >
          <span>Enviar al backoffice</span>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="flecha-boton-de-carga"
          />
          <FontAwesomeIcon icon={faCheck} className="ok-boton-de-carga" />
        </button>
        <div className="confettiContainer">
          <ReactCanvasConfetti
            height={250}
            width={400}
            refConfetti={this.obtenerRefDeConfetti}
            className="confetti"
          />
        </div>
      </div>
    );
  }
}
