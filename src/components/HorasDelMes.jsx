import "../styles/HorasDelMes.scss";
import "simplebar/dist/simplebar.min.css";

import classNames from "classnames";
import { max, range, sum } from "lodash";
import { Component, createRef } from "react";
import SimpleBar from "simplebar-react";

import { EditingContext } from "../App";
import {
  esDiaDeHoy,
  esFinde,
  esMesActual,
  finDeMesDe,
  formatearFechaAString,
  nombreCeco,
  parsearFecha,
  estaDentroDelRango,
  sonMismoAñoMesYDia,
} from "../utils";
import RegistroDeHora from "./RegistroDeHora";
import { DateTime } from "luxon";

function HorasTotalesDelDia({ registrosDeHora }) {
  const horasDeLosRegistros = registrosDeHora.map(({ registro_de_hora }) =>
    parseFloat(registro_de_hora.cantidad_horas),
  );
  const sumaDeHoras = sum(horasDeLosRegistros);

  return sumaDeHoras === 0 ? null : (
    <div className="total-del-dia">Total {sumaDeHoras}hs</div>
  );
}

export const RegistrosDeHoraPara = ({
  centrosDeCosto,
  registrosDelDia,
  editable,
  dia,
  fechaSeleccionada,
}) => {
  const elRegistroPerteneceAlDiaSeleccionado = () => {
    return dia.hasSame(fechaSeleccionada, "days");
  };

  const elRegistroNoContieneLaFechaQueEstaSiendoEditada = (horaAEditar) => {
    return !dia.hasSame(parsearFecha(horaAEditar.fecha), "days");
  };
  return (
    <EditingContext.Consumer>
      {({ estaEditando, horaAEditar }) => (
        <div className="registros">
          {estaEditando &&
            elRegistroPerteneceAlDiaSeleccionado() &&
            elRegistroNoContieneLaFechaQueEstaSiendoEditada(horaAEditar) && (
              <RegistroDeHora
                data-testid="registro-hora"
                key={horaAEditar.id}
                registroDeHora={horaAEditar}
                centroDeCosto={nombreCeco(
                  centrosDeCosto,
                  horaAEditar.centro_de_costo_id,
                )}
                isPlaceholder={true}
              />
            )}
          {registrosDelDia.map(({ registro_de_hora }) => {
            return (
              <RegistroDeHora
                data-testid="registro-hora"
                key={registro_de_hora.id}
                registroDeHora={registro_de_hora}
                editable={editable}
                centroDeCosto={
                  registro_de_hora?.centroDeCosto?.nombre ||
                  nombreCeco(
                    centrosDeCosto,
                    registro_de_hora.centro_de_costo_id,
                  )
                }
                isPlaceholder={false}
                fechaSeleccionada={fechaSeleccionada}
              />
            );
          })}

          <HorasTotalesDelDia registrosDeHora={registrosDelDia} />
        </div>
      )}
    </EditingContext.Consumer>
  );
};

export const calcularRegistrosDeHoraPorDia = (registrosDeHora) => {
  const registrosDeHoraPorDia = {};
  registrosDeHora.forEach((registro) => {
    const fechaDelRegistro = registro.registro_de_hora.fecha;
    if (!(fechaDelRegistro in registrosDeHoraPorDia))
      registrosDeHoraPorDia[fechaDelRegistro] = [];

    registrosDeHoraPorDia[fechaDelRegistro].push(registro);
  });

  return registrosDeHoraPorDia;
};

export default class HorasDelMes extends Component {
  constructor(props) {
    super(props);
    this.refNumeroDelDiaSeleccionado = createRef();
  }
  shouldComponentUpdate = (nextProps) =>
    this.props.registrosDeHora.length !== nextProps.registrosDeHora.length ||
    !this.props.fechaSeleccionada.equals(nextProps.fechaSeleccionada) ||
    this.props.registrosDeHora.some(
      (registro) => registro.registro_de_hora.noPersistido,
    ) ||
    nextProps.registrosDeHora.some(
      (registro) => registro.registro_de_hora.noPersistido,
    ) ||
    this.props.centrosDeCosto.length === 0;

  componentDidMount() {
    setTimeout(() => {
      this.scrollearHaciaDiaSeleccionado();
    });
  }

  scrollearHaciaDiaSeleccionado() {
    if (!sonMismoAñoMesYDia(this.props.fechaAVisualizar, DateTime.now())) {
      return;
    }

    this.refNumeroDelDiaSeleccionado?.current?.scrollIntoView &&
      this.refNumeroDelDiaSeleccionado.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
  }

  diasDelMesHasta = (fecha) => {
    const ultimoDiaDelMesActual = fecha.endOf("month");

    return range(1, ultimoDiaDelMesActual.day + 1)
      .map((dia) =>
        DateTime.local(
          ultimoDiaDelMesActual.year,
          ultimoDiaDelMesActual.month,
          dia,
        ),
      )
      .reverse();
  };

  registrosDeHoraPorDia() {
    return calcularRegistrosDeHoraPorDia(this.props.registrosDeHora);
  }

  estaElDiaSeleccionado(dia) {
    return sonMismoAñoMesYDia(this.props.fechaSeleccionada, dia);
  }

  render() {
    const registrosDeHoraPorDia = this.registrosDeHoraPorDia();
    const esEditable = estaDentroDelRango(
      this.props.fechaAVisualizar,
      DateTime.now(),
      { months: 1 },
    );

    return (
      <SimpleBar style={{ maxHeight: "80.55vh" }}>
        <div className="HorasDelMes">
          {this.diasDelMesHasta(this.ultimoDiaAMostrar()).map((dia) => {
            return (
              <div
                className={`dia${esFinde(dia) ? " finde" : ""}`}
                key={dia.day}
              >
                <div
                  className="indicador-fecha"
                  ref={
                    this.estaElDiaSeleccionado(dia)
                      ? this.refNumeroDelDiaSeleccionado
                      : null
                  }
                >
                  <div className="nombreDia">{dia.weekdayShort}</div>
                  <div
                    className={classNames("numeroDia", {
                      hoy: esDiaDeHoy(dia),
                      seleccionado: this.estaElDiaSeleccionado(dia),
                    })}
                    data-testid={"numeroDia-" + dia.day}
                  >
                    {dia.day}
                  </div>
                </div>
                <RegistrosDeHoraPara
                  centrosDeCosto={this.props.centrosDeCosto}
                  editable={esEditable}
                  registrosDelDia={
                    registrosDeHoraPorDia[formatearFechaAString(dia)] || []
                  }
                  dia={dia}
                  fechaSeleccionada={this.props.fechaSeleccionada}
                />
              </div>
            );
          })}
        </div>
      </SimpleBar>
    );
  }

  ultimoDiaAMostrar() {
    const fechasCargadasDelMes = this.props.registrosDeHora.map((registro) =>
      parsearFecha(registro.registro_de_hora.fecha),
    );
    const fechaAVisualizar = this.props.fechaAVisualizar;

    return esMesActual(fechaAVisualizar)
      ? finDeMesDe(fechaAVisualizar)
      : max([max(fechasCargadasDelMes), fechaAVisualizar]);
  }
}
