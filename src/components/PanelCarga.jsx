import "../styles/PanelCarga.scss";
import "../styles/PanelContainer.scss";

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import React, { Component, createRef } from "react";
import { hotkeys } from "react-keyboard-shortcuts";
import { toast } from "react-toastify";

import { EditingContext } from "../App";
import BotonDeCarga from "./BotonDeCarga";
import CecoSelect from "./CecoSelect";
import CheckBox from "./CheckBox";
import DatePicker from "./DatePicker";
import TipoDeHora from "./TipoDeHora";

const TemplateNamerForm = (props) => {
  const onEnterKey = (e) => {
    e.preventDefault();
    props.handleGuardarComoTemplate();
  };

  return (
    <div className="templateNamer">
      <input
        placeholder="Nombre"
        name="nombre"
        value={props.nombreDeTemplate}
        onChange={props.handleNameTemplateChange}
        className={classNames({ error: props.error })}
        onKeyDown={(e) => e.key === "Enter" && onEnterKey(e)}
        ref={props.templateNameInput}
      />
      <FontAwesomeIcon
        icon={faCheck}
        className="nameTemplateButton nameTemplateButtonCheck"
        onClick={props.handleGuardarComoTemplate}
      />
      <FontAwesomeIcon
        icon={faTimes}
        className="nameTemplateButton"
        onClick={props.resetTemplateNamingForm}
      />
    </div>
  );
};

const SaveAsTemplateButton = (props) => {
  return (
    <span
      onClick={props.nombrarTemplate}
      onKeyDown={props.nombrarTemplate}
      className="guardarComoTemplateButton"
      role="button"
      tabIndex="-1"
    >
      <span>+</span>Guardar como template
    </span>
  );
};

const TemplateNamer = (props) => {
  return props.seEstaNombrando ? (
    <TemplateNamerForm {...props} />
  ) : (
    <SaveAsTemplateButton {...props} />
  );
};

const BotoneraEdicion = ({
  borrarHora,
  editar,
  setEditando,
  resetearHoraACargar,
  callToActionRef,
}) => {
  const onGuardarHora = (e) => {
    e.preventDefault();
    editar();
    setEditando(false);
  };

  return (
    <>
      <button
        className="boton-eliminar"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          borrarHora();
          setEditando(false);
        }}
      >
        Eliminar
      </button>
      <button
        type="button"
        className="boton-cancelar"
        onClick={() => {
          setEditando(false);
          resetearHoraACargar();
        }}
      >
        Cancelar
      </button>
      <button
        className="boton-guardar"
        onClick={onGuardarHora}
        ref={callToActionRef}
      >
        Guardar
      </button>
    </>
  );
};

class PanelCarga extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.templateNameInput = React.createRef();
    this.state = {
      seEstaNombrandoTemplate: false,
      nombreDeTemplate: "",
      errorAlNombrarTemplate: false,
      mostrarControlesPorTeclado: false,
    };
    this.fieldsPropsRefs = {
      cantidad: createRef(),
      nota: createRef(),
      centroDeCosto: createRef(),
      fecha: createRef(),
    };
    this.callToActionRef = createRef();

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const showControlKey = (event) =>
      (event.key === "Control" && !isMac) || (event.metaKey && isMac);

    window.addEventListener("keydown", (event) => {
      if (showControlKey(event)) {
        this.setState({ mostrarControlesPorTeclado: true });
      }
    });

    window.addEventListener("keyup", (event) => {
      if (showControlKey(event)) {
        this.setState({ mostrarControlesPorTeclado: false });
      }
    });
  }

  componentDidUpdate = () => {
    const textarea = document.getElementById("descripcion-hora");
    textarea?.style?.setProperty("height", "auto");
    textarea?.style?.setProperty("height", textarea?.scrollHeight + "px");
  };

  puedeEnviar = () => {
    return (
      this.props.horaACargar.cantidad !== "" &&
      this.props.horaACargar.nota !== "" &&
      this.props.horaACargar.centroDeCosto
    );
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.name === "facturable" ? target.checked : target.value;
    const name = target.name;
    this.props.actualizarHoraVistaPrevia({
      [name]: value,
    });
  };

  obtenerProximoCampoVacio = () => {
    const valorConCampo = Object.entries(this.fieldsPropsRefs)
      .map(([propName, ref]) => [this.props.horaACargar[propName], ref.current])
      .find(([propValue]) => !propValue);
    if (valorConCampo) return valorConCampo[1];
  };

  enfocarProximoCampoVacio = () => {
    const proximoCampoVacio =
      this.obtenerProximoCampoVacio() || this.callToActionRef.current;
    proximoCampoVacio?.focus();
  };

  enfocarDatePicker = () => {
    this.fieldsPropsRefs.fecha.current.focus();
  };

  handleFechaChange = (fechaNueva) => {
    this.props.actualizarHoraVistaPrevia({ fecha: fechaNueva });
  };

  handleCecoSelect = (centroDeCosto) => {
    this.props.actualizarHoraVistaPrevia({ centroDeCosto });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.cargarNuevaHora(this.enfocarDatePicker);
  };

  nombrarTemplate = () => {
    this.setState({ seEstaNombrandoTemplate: true }, () =>
      this.templateNameInput.current.focus(),
    );
  };

  resetTemplateNamingForm = () => {
    this.setState({
      seEstaNombrandoTemplate: false,
      nombreDeTemplate: "",
      errorAlNombrarTemplate: false,
    });
  };

  mostrarErrorDeNombreDeTemplateVacio = () => {
    this.setState({ errorAlNombrarTemplate: true });
    this.templateNameInput.current.focus();
    toast.error("El nombre del template no puede estar vacio");
  };

  handleGuardarComoTemplate = () => {
    if (!this.state.nombreDeTemplate)
      return this.mostrarErrorDeNombreDeTemplateVacio();

    this.props.guardarComoTemplate(this.state.nombreDeTemplate);
    this.resetTemplateNamingForm();
  };

  handleNameTemplateChange = (e) => {
    this.setState({
      nombreDeTemplate: e.target.value,
      errorAlNombrarTemplate: false,
    });
  };

  seEstaGuardandoCantidadDeHorasParaTemplate = () =>
    this.state.seEstaNombrandoTemplate && this.props.horaACargar.cantidad;

  seEstaGuardandoNotaParaTemplate = () =>
    this.state.seEstaNombrandoTemplate && this.props.horaACargar.nota;

  seEstaGuardandoCecoParaTemplate = () =>
    this.state.seEstaNombrandoTemplate && this.props.horaACargar.centroDeCosto;

  render() {
    return (
      <EditingContext.Consumer>
        {({ estaEditando, setEditando, horaAEditar, editar }) => (
          <div className="PanelCarga">
            <div className="title">
              {estaEditando ? <h1>Editar hora</h1> : <h1>Cargar hora</h1>}
            </div>
            <form onSubmit={this.handleSubmit} data-testid="formulario-carga">
              <div className="fila">
                <DatePicker
                  onChange={this.handleFechaChange}
                  fecha={this.props.horaACargar.fecha}
                  fieldRef={this.fieldsPropsRefs.fecha}
                  showControls={this.state.mostrarControlesPorTeclado}
                />

                <TipoDeHora
                  tiposDeHora={this.props.tiposDeHora}
                  onChange={this.handleInputChange}
                  tipoDeHoraSeleccionada={this.props.horaACargar.tipoDeHora}
                  className={classNames({
                    seEstaGuardandoComoTemplate:
                      this.state.seEstaNombrandoTemplate,
                  })}
                />
              </div>
              <div className="fila">
                <label className="inputConLabel">
                  Cantidad
                  <input
                    className={classNames("cantidad-horas", {
                      seEstaGuardandoComoTemplate:
                        this.seEstaGuardandoCantidadDeHorasParaTemplate(),
                    })}
                    placeholder="Cantidad"
                    type="number"
                    name="cantidad"
                    data-testid="input-cantidad-horas"
                    onChange={this.handleInputChange}
                    value={this.props.horaACargar.cantidad}
                    ref={this.fieldsPropsRefs.cantidad}
                  />
                </label>
                <div className="inputConLabel nota">
                  <label>
                    Descripción
                    <textarea
                      id="descripcion-hora"
                      placeholder="Descripción"
                      rows="1"
                      name="nota"
                      data-testid="input-nota"
                      onChange={this.handleInputChange}
                      value={this.props.horaACargar.nota}
                      autoComplete="off"
                      ref={this.fieldsPropsRefs.nota}
                      className={classNames({
                        seEstaGuardandoComoTemplate:
                          this.seEstaGuardandoNotaParaTemplate(),
                      })}
                    />
                  </label>
                </div>
              </div>
              <div className="fila">
                <CecoSelect
                  cecos={this.props.centrosDeCosto}
                  onChange={this.handleCecoSelect}
                  value={this.props.horaACargar.centroDeCosto}
                  selectRef={this.fieldsPropsRefs.centroDeCosto}
                  seEstaGuardandoParaTemplate={this.seEstaGuardandoCecoParaTemplate()}
                />
                <CheckBox
                  checked={this.props.horaACargar.facturable}
                  onChange={this.handleInputChange}
                  className={classNames({
                    seEstaGuardandoComoTemplate:
                      this.state.seEstaNombrandoTemplate,
                  })}
                />
              </div>
              <div className="botonera">
                {!estaEditando ? (
                  <>
                    <TemplateNamer
                      nombreDeTemplate={this.state.nombreDeTemplate}
                      handleNameTemplateChange={this.handleNameTemplateChange}
                      handleGuardarComoTemplate={this.handleGuardarComoTemplate}
                      templateNameInput={this.templateNameInput}
                      resetTemplateNamingForm={this.resetTemplateNamingForm}
                      seEstaNombrando={this.state.seEstaNombrandoTemplate}
                      error={this.state.errorAlNombrarTemplate}
                      nombrarTemplate={this.nombrarTemplate}
                    />
                    <BotonDeCarga
                      puedeEnviar={this.puedeEnviar()}
                      enfocarProximoCampo={this.enfocarProximoCampoVacio}
                      buttonRef={this.callToActionRef}
                    />
                  </>
                ) : (
                  <BotoneraEdicion
                    borrarHora={() => this.props.borrarHora(horaAEditar)}
                    editar={editar}
                    setEditando={setEditando}
                    resetearHoraACargar={this.props.resetearHoraACargar}
                    callToActionRef={this.callToActionRef}
                  />
                )}
              </div>
            </form>
          </div>
        )}
      </EditingContext.Consumer>
    );
  }
}

export default hotkeys(PanelCarga);
