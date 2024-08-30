import "./styles/App.scss";
import "react-toastify/dist/ReactToastify.min.css";
import "./styles/Tostadas.scss";

import React, { Component, createRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import Header from "./components/Header";
import Login from "./components/Login";
import PanelCarga from "./components/PanelCarga";
import PanelInfoUtil from "./components/PanelInfoUtil";
import PanelTemplate from "./components/PanelTemplate";
import RegistrosDeHora from "./components/RegistrosDeHora";
import {
  exportarABackofficeTipoHora,
  formatearFechaAString,
  humanizarTipoDeHora,
  mostrarMensajeError,
  nombreCeco,
  parsearFecha,
  TIPO_DE_HORA_DEFAULT,
  tiposDeHora,
} from "./utils";
import { DateTime } from "luxon";

export const crearTemplateConNombre = (
  nombre,
  { fecha: _fecha, ...horaACargar },
) => {
  const template = { nombre, facturable: false };
  Object.keys(horaACargar)
    .filter((key) => horaACargar[key])
    .forEach((key) => {
      template[key] = horaACargar[key];
    });
  return template;
};

export const EditingContext = React.createContext({
  editing: false,
  setEditing: () => {},
  finishEdition: () => {},
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      centrosDeCosto: [],
      tiposDeHora: [],
      registrosDeHora: [],
      horaACargar: {
        fecha: DateTime.now(),
        cantidad: "",
        nota: "",
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
        centroDeCosto: undefined,
        facturable: false,
      },
      infoLicencias: {
        cantidadVacacionesDisponibles: 0,
        cantidadDiasTiloDisponibles: 0,
        cantidadHorasTiloDisponibles: 0,
        cantidadDiasVacacionesAcumuladas: 0,
      },
      templates: [],
      contextoEdicion: {
        estaEditando: false,
        setEditando: this.setEditando,
        horaAEditar: null,
        editar: this.editarHoraSeleccionada,
        copiarHora: this.copiarHora,
      },
      fechaAVisualizar: DateTime.now(),
      cargando: false,
    };
    this.panelCargaWrapper = createRef();
  }

  setEditando = (seEstaEditando, horaAEditar) => {
    this.setState({
      contextoEdicion: {
        ...this.state.contextoEdicion,
        estaEditando: seEstaEditando,
        horaAEditar,
      },
    });
    if (seEstaEditando) {
      const horaDeBackofficeConvertida =
        convertirHoraDeBackofficeAHoraParaCargar(
          horaAEditar,
          this.state.centrosDeCosto,
        );
      this.setState({ horaACargar: horaDeBackofficeConvertida });
    }
    this.panelCargaWrapper.current.getWrappedComponent().enfocarDatePicker();
  };
  copiarHora = (horaACopiar) => {
    const horaDeBackofficeConvertida = convertirHoraDeBackofficeAHoraParaCopiar(
      horaACopiar,
      this.state.centrosDeCosto,
    );
    this.setState({ horaACargar: horaDeBackofficeConvertida });
    this.panelCargaWrapper.current.getWrappedComponent().enfocarDatePicker();
  };

  editarHoraSeleccionada = () => {
    this.setCargando(true);
    const horaEditada = this.state.horaACargar;
    const horaAEditar = this.state.contextoEdicion.horaAEditar;
    const listaDeHorasCargadas = this.state.registrosDeHora;
    const indexDeHoraAEditar = listaDeHorasCargadas.findIndex(
      (hora) => hora.registro_de_hora.id === horaAEditar.id,
    );

    const nuevaListaDeHorasCargadas = [...listaDeHorasCargadas];
    nuevaListaDeHorasCargadas[indexDeHoraAEditar] = {
      registro_de_hora: {
        fecha: formatearFechaAString(horaEditada.fecha),
        cantidad_horas: horaEditada.cantidad,
        centro_de_costo_id: horaEditada.centroDeCosto.id,
        notas: horaEditada.nota,
        tipo_de_hora: exportarABackofficeTipoHora(horaEditada.tipoDeHora),
        noPersistido: true,
        id: horaAEditar.id,
      },
    };
    this.backofficeApi()
      .editarHora(horaAEditar.id, horaEditada)
      .then(() => {
        this.setState({ registrosDeHora: nuevaListaDeHorasCargadas });
      })
      .then(() => this.obtenerHorasDelMes())
      .catch(mostrarMensajeError(toast))
      .finally(() => this.setCargando(false));

    this.resetearHoraACargar();
  };

  borrarHoraSeleccionada = () => {
    this.setCargando(true);
    const horaABorrar = this.state.contextoEdicion.horaAEditar;
    const listaDeHorasCargadas = this.state.registrosDeHora;
    const listaSinItem = [
      ...listaDeHorasCargadas.filter(
        (hora) => hora.registro_de_hora.id !== horaABorrar.id,
      ),
    ];
    this.backofficeApi()
      .borrarHora(horaABorrar.id)
      .then(() => {
        this.setState({ registrosDeHora: listaSinItem });
      })
      .catch(mostrarMensajeError(toast))
      .finally(() => this.setCargando(false));
    this.resetearHoraACargar();
  };

  componentDidMount() {
    if (this.estaAutenticado()) {
      this.cargarDatosIniciales();
    }
  }

  setCargando(cargando) {
    this.setState({ cargando: cargando });
  }

  cargarDatosIniciales = () => {
    this.setCargando(true);
    return Promise.all([
      this.obtenerHorasDelMes(this.state.fechaAVisualizar),
      this.obtenerCentrosDeCosto(),
      this.obtenerTiposDeHora(),
      this.obtenerTemplates(),
      this.obtenerDiasDeBienestarDisponibles(),
      this.obtenerDiasDeVacacionesAcumuladas(),
      this.obtenerDiasDeVacacionesDisponibles(),
    ]).then(() => {
      this.setCargando(false);
    });
  };

  backofficeApi = () => this.props.backofficeApi;

  cargarNuevaHora = (enfocarDatePicker) => {
    this.setCargando(true);
    this.backofficeApi()
      .cargarHora(this.state.horaACargar)
      .then(this.alCargarHoraNueva)
      .then(() => {
        this.resetearHoraACargar();
        enfocarDatePicker();
      })
      .catch(mostrarMensajeError(toast))
      .finally(() => this.setCargando(false));
  };

  alCargarHoraNueva = () => {
    return Promise.all([
      this.obtenerHorasDelMes(),
      this.obtenerDiasDeBienestarDisponibles(),
      this.obtenerDiasDeVacacionesAcumuladas(),
      this.obtenerDiasDeVacacionesDisponibles(),
    ]);
  };

  obtenerHorasDelMes = () =>
    this.backofficeApi()
      .horasDelMes(this.state.fechaAVisualizar)
      .then((data) => {
        this.setState({ registrosDeHora: data });
      })
      .catch(mostrarMensajeError(toast));

  agregarHoraALasHorasCargadas = (hora) => {
    const registro_de_hora = {
      ...hora,
      fecha: formatearFechaAString(hora.fecha),
      cantidad_horas: hora.cantidad,
      notas: hora.nota,
      centro_de_costo_id: hora.centroDeCosto.id,
      id: uuidv4(),
      noPersistido: true,
    };

    const horasCargadas = [
      ...this.state.registrosDeHora,
      { registro_de_hora: registro_de_hora },
    ];

    this.setState({ registrosDeHora: horasCargadas });
  };

  obtenerDiasDeBienestarDisponibles = () => {
    return this.backofficeApi()
      .tiloDisponible()
      .then((tiloDisponibles) =>
        this.setState((state) => {
          const newInfoLicencias = {
            ...state.infoLicencias,
            cantidadDiasTiloDisponibles: parseFloat(
              tiloDisponibles.dias_tilo_restantes,
            ),
            cantidadHorasTiloDisponibles: parseFloat(
              tiloDisponibles.horas_tilo_restantes,
            ),
          };
          return { ...state, infoLicencias: newInfoLicencias };
        }),
      )
      .catch(mostrarMensajeError(toast));
  };

  obtenerDiasDeVacacionesAcumuladas = () => {
    return this.backofficeApi()
      .diasDeVacacionesAcumuladas()
      .then((cantidadDiasVacacionesAcumuladas) =>
        this.setState((state) => {
          const newInfoLicencias = {
            ...state.infoLicencias,
            cantidadDiasVacacionesAcumuladas,
          };
          return { ...state, infoLicencias: newInfoLicencias };
        }),
      )
      .catch(mostrarMensajeError(toast));
  };

  obtenerDiasDeVacacionesDisponibles = () => {
    return this.backofficeApi()
      .diasDeVacacionesDisponibles()
      .then((cantidadVacacionesDisponibles) =>
        this.setState((state) => {
          const newInfoLicencias = {
            ...state.infoLicencias,
            cantidadVacacionesDisponibles,
          };
          return { ...state, infoLicencias: newInfoLicencias };
        }),
      )
      .catch(mostrarMensajeError(toast));
  };

  obtenerCentrosDeCosto = () =>
    this.backofficeApi()
      .centrosDeCosto()
      .then((centrosDeCosto) => this.setState({ centrosDeCosto }))
      .catch(mostrarMensajeError(toast));

  obtenerTiposDeHora = () =>
    tiposDeHora().then((tiposDeHora) =>
      this.setState({
        tiposDeHora,
        hora_de_vista_previa: {
          tipoDeHora: tiposDeHora[0],
        },
      }),
    );

  guardarTemplates = (templates) => {
    const parsedTemplatesObject = JSON.stringify(templates);
    localStorage.setItem("templates", parsedTemplatesObject);
  };

  obtenerTemplates = () => {
    const storedTemplatesJson = localStorage.getItem("templates");
    const storedTemplates = JSON.parse(storedTemplatesJson);
    if (storedTemplates)
      this.setState({
        templates: storedTemplates,
      });
  };

  estaAutenticado = () => this.backofficeApi().estaAutenticado();

  actualizarHoraVistaPrevia = (cambiosEnLaHora) => {
    this.setState({
      horaACargar: { ...this.state.horaACargar, ...cambiosEnLaHora },
    });
  };

  resetearHoraACargar = () => {
    this.actualizarHoraVistaPrevia({
      id: null,
      cantidad: "",
      nota: "",
      tipoDeHora: TIPO_DE_HORA_DEFAULT,
      facturable: false,
      centroDeCosto: null,
    });
  };

  guardarTemplate = (nombreTemplate) => {
    const nuevoTemplate = crearTemplateConNombre(
      nombreTemplate,
      this.state.horaACargar,
    );
    const templatesActuales = [...this.state.templates, nuevoTemplate];
    this.setState({ templates: templatesActuales });
    this.guardarTemplates(templatesActuales);
    this.resetearHoraACargar();
  };

  importarTemplates = (templatesJson) => {
    const templatesAImportar = JSON.parse(templatesJson);
    if (templatesAImportar) {
      const templatesActuales = this.state.templates.concat(templatesAImportar);
      this.setState({ templates: templatesActuales });
      this.guardarTemplates(templatesActuales);
    }
  };

  horaACargarDeTemplate(template) {
    const { nombre: _nombre, ...horaACargarDeTemplate } = template;
    return horaACargarDeTemplate;
  }

  selectTemplate = ({ fecha: _fecha, ...template }) => {
    const horaACargarColocada = this.state.horaACargar;
    this.setState(
      {
        horaACargar: {
          ...horaACargarColocada,
          ...this.horaACargarDeTemplate(template),
        },
      },
      this.panelCargaWrapper.current.getWrappedComponent()
        .enfocarProximoCampoVacio,
    );
  };

  borrarTemplate = (template) => {
    const templates = this.state.templates;
    const indexDeTemplateABorrar = templates.indexOf(template);
    templates.splice(indexDeTemplateABorrar, 1);
    this.setState({ templates: templates }, () => {
      this.guardarTemplates(templates);
    });
  };

  cambiarFechaAVisualizar(haciaAdelante) {
    const cambioDeMes = { months: 1 };
    const fechaAVisualizar = haciaAdelante
      ? this.state.fechaAVisualizar.plus(cambioDeMes)
      : this.state.fechaAVisualizar.minus(cambioDeMes);
    this.setState({ fechaAVisualizar }, async () => {
      this.setCargando(true);
      await this.obtenerHorasDelMes();
      this.setCargando(false);
    });
  }

  pantallaDeCarga = () => (
    <>
      <Header />
      <div className="App">
        <EditingContext.Provider value={this.state.contextoEdicion}>
          <div className="flex-sized">
            <PanelCarga
              backofficeApi={this.backofficeApi()}
              centrosDeCosto={this.state.centrosDeCosto}
              tiposDeHora={this.state.tiposDeHora}
              alCargarHoraNueva={this.alCargarHoraNueva}
              registrosDeHora={this.state.registrosDeHora}
              horaACargar={this.state.horaACargar}
              actualizarHoraVistaPrevia={this.actualizarHoraVistaPrevia}
              cargarNuevaHora={this.cargarNuevaHora}
              resetearHoraACargar={this.resetearHoraACargar}
              guardarComoTemplate={this.guardarTemplate}
              actualizarHorasCargadas={this.agregarHoraALasHorasCargadas}
              borrarHora={this.borrarHoraSeleccionada}
              ref={this.panelCargaWrapper}
            />
            <PanelTemplate
              templates={this.state.templates}
              onTemplateSelected={this.selectTemplate}
              borrarTemplate={this.borrarTemplate}
              importarTemplates={this.importarTemplates}
            />
            <PanelInfoUtil infoLicencias={this.state.infoLicencias} />
          </div>

          <RegistrosDeHora
            centrosDeCosto={this.state.centrosDeCosto}
            registrosDeHora={this.state.registrosDeHora}
            fechaAVisualizar={this.state.fechaAVisualizar} // FIXME esto se calcula todo el tiempo
            horaACargar={this.state.horaACargar}
            cargando={this.state.cargando}
            onClickAtras={() => this.cambiarFechaAVisualizar(false)}
            onClickAdelante={() => this.cambiarFechaAVisualizar(true)}
          />
          <ToastContainer />
        </EditingContext.Provider>
      </div>
    </>
  );

  autenticarse = async () => {
    await this.backofficeApi().autenticarse();
  };

  render() {
    return (
      <main>
        {this.estaAutenticado() ? (
          this.pantallaDeCarga()
        ) : (
          <Login onLoginClick={this.autenticarse} />
        )}
      </main>
    );
  }
}

export const convertirHoraDeBackofficeAHoraParaCargar = (
  horaDeBackoffice,
  centrosDeCosto,
) => {
  const cantidadHoras = horaDeBackoffice.cantidad_horas;

  return {
    id: horaDeBackoffice.id,
    fecha: parsearFecha(horaDeBackoffice.fecha),
    cantidad: isNaN(cantidadHoras) ? 0 : +cantidadHoras,
    nota: horaDeBackoffice.notas,
    tipoDeHora: humanizarTipoDeHora(horaDeBackoffice.tipo_de_hora),
    centroDeCosto: {
      id: horaDeBackoffice.centro_de_costo_id,
      nombre: nombreCeco(centrosDeCosto, horaDeBackoffice.centro_de_costo_id),
    },
    facturable: horaDeBackoffice.facturable,
  };
};

export const convertirHoraDeBackofficeAHoraParaCopiar = (
  horaDeBackoffice,
  centrosDeCosto,
) => {
  return {
    ...convertirHoraDeBackofficeAHoraParaCargar(
      horaDeBackoffice,
      centrosDeCosto,
    ),
    id: undefined,
    fecha: DateTime.now(),
  };
};

export default App;
