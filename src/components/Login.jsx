import "../styles/Login.scss";

import { Component, createRef } from "react";
import LoadingBar from "react-top-loading-bar";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { enviado: false };
    this.myRef = createRef();
  }

  onLoginClick = () => {
    this.setState({ enviado: true }, () => {
      this.myRef.current.continuousStart();
      this.props.onLoginClick();
    });
  };

  render() {
    return (
      <div className="contenedor-login">
        <LoadingBar color="#6D6058" height={5} ref={this.myRef} />
        <div className="login">
          <div className="titulo">
            <h1>Inicia sesión con tus credenciales del Backoffice</h1>
          </div>
          <button
            type="button"
            className="boton habilitado"
            onClick={this.onLoginClick}
          >
            {this.state.enviado ? "Iniciando sesión..." : "Login"}
          </button>
        </div>
      </div>
    );
  }
}
