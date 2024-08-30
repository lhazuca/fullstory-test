import "../styles/MetricasDistribucion.scss";
import "../styles/TooltipRegistros.scss";

import { range } from "lodash";
import { Component, PureComponent, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  esFinde,
  formatearFechaAString,
  nombreCeco,
  parsearFecha,
  sonMismoAñoMesYDia,
} from "../utils";
import {
  calcularRegistrosDeHoraPorDia,
  RegistrosDeHoraPara,
} from "./HorasDelMes";
import { DateTime } from "luxon";
import { Dona } from "./Dona";

const TooltipRegistros = ({
  label,
  registrosDeHora,
  centrosDeCosto,
  fechaAVisualizar,
}) => {
  const registrosDeHoraPorDia = useMemo(
    () => calcularRegistrosDeHoraPorDia(registrosDeHora),
    [registrosDeHora],
  );

  const dia = parsearFecha(label ?? formatearFechaAString(fechaAVisualizar));

  return (
    <div className="TooltipRegistros">
      <div className="dia" key={dia.day}>
        <div className="indicador-fecha">
          <div className="nombreDia">{dia.weekdayLong}</div>
          <div className="numeroDia">{dia.day}</div>
        </div>
        <RegistrosDeHoraPara
          centrosDeCosto={centrosDeCosto}
          editable={false}
          dia={dia}
          registrosDelDia={
            registrosDeHoraPorDia[formatearFechaAString(dia)] || []
          }
          fechaSeleccionada={dia}
        />
      </div>
    </div>
  );
};

export default class MetricasDistribucion extends Component {
  ordenarPorFecha = (registro, otro) =>
    parsearFecha(registro.fecha)
      .diff(parsearFecha(otro.fecha), "days")
      .valueOf();

  diasDelMesActual = () => {
    const fechaSeleccionada = this.props.fechaAVisualizar;
    return range(1, this.props.fechaAVisualizar.daysInMonth + 1).map((day) =>
      DateTime.local(fechaSeleccionada.year, fechaSeleccionada.month, day),
    );
  };

  horasAgrupadasPorFecha = () => {
    const horasDelMes = this.diasDelMesActual().map((dia) => {
      return { fecha: formatearFechaAString(dia) };
    });

    const agruparYSumarHorasPorFecha = (total, { registro_de_hora }) => {
      let registroEnFecha = total.find(
        ({ fecha }) => fecha === registro_de_hora.fecha,
      );

      if (registroEnFecha !== undefined) {
        this.sumarHorasPorFecha(registro_de_hora, registroEnFecha);
      } else {
        registroEnFecha = { fecha: registro_de_hora.fecha };
        this.sumarHorasPorFecha(registro_de_hora, registroEnFecha);

        const horasDeEseDia = Number(registroEnFecha["cantidad_horas"] || 0);
        registroEnFecha["cantidad_horas"] =
          horasDeEseDia + Number(registro_de_hora.cantidad_horas);
        total.push(registroEnFecha);
      }

      return total;
    };

    const agregarSiEsFinDeSemana = (registroDeDia) => {
      const fecha = parsearFecha(registroDeDia.fecha);
      if (esFinde(fecha)) registroDeDia["esFinDeSemana"] = true;
      return registroDeDia;
    };

    const agregarSiEstaSeleccionado = (registroDeDia) => {
      const fecha = parsearFecha(registroDeDia.fecha);
      if (sonMismoAñoMesYDia(fecha, this.props.fechaSeleccionada))
        registroDeDia["estaSeleccionado"] = true;
      return registroDeDia;
    };

    return this.props.registrosDeHora
      .reduce(agruparYSumarHorasPorFecha, horasDelMes)
      .sort(this.ordenarPorFecha)
      .map(agregarSiEsFinDeSemana)
      .map(agregarSiEstaSeleccionado);
  };

  formatearEjeY = (cantidadHoras) => {
    return `${cantidadHoras}hs`;
  };

  sumarHorasPorFecha = (registro_de_hora, registroEnFecha) => {
    const horasRegistro = Number(registro_de_hora.cantidad_horas);

    if (registro_de_hora.vista_previa) {
      const horasDeEseDia = Number(registroEnFecha["vista previa"] || 0);
      registroEnFecha["vista previa"] = horasDeEseDia + horasRegistro;
    } else if (registro_de_hora.facturable) {
      const horasDeEseDia = Number(registroEnFecha["facturables"] || 0);
      registroEnFecha["facturables"] = horasDeEseDia + horasRegistro;
    } else {
      const horasDeEseDia = Number(registroEnFecha["no facturables"] || 0);
      registroEnFecha["no facturables"] = horasDeEseDia + horasRegistro;
    }
  };

  cantidadDiasCargados = () =>
    this.horasAgrupadasPorFecha().filter(
      (fecha) => fecha["facturables"] || fecha["no facturables"],
    ).length;

  cantidadDiasFacturablesCargados = () =>
    this.horasAgrupadasPorFecha().filter((fecha) => fecha["facturables"])
      .length;

  chequearDivisionInvalida = (resultadoDivision) => {
    if (isNaN(resultadoDivision) || !isFinite(resultadoDivision)) return 0;
    else return resultadoDivision;
  };

  promedioTotal = () => {
    const resultadoDivision = this.totalHoras() / this.cantidadDiasCargados();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  promedioHorasFacturables = () => {
    const resultadoDivision =
      this.totalHorasFacturables() / this.cantidadDiasFacturablesCargados();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  sumarHoras = (total, { registro_de_hora }) => {
    return Number(total) + Number(registro_de_hora.cantidad_horas);
  };

  totalHoras = () => {
    return this.props.registrosDeHora.reduce(this.sumarHoras, 0);
  };

  totalHorasSinLicencias = () => {
    return this.props.registrosDeHora
      .filter((hora) => {
        const nombreDelCeco = nombreCeco(
          this.props.centrosDeCosto,
          hora.registro_de_hora.centro_de_costo_id,
        );
        return !this.esLicencia(nombreDelCeco);
      })
      .reduce(this.sumarHoras, 0);
  };

  esLicencia(nombreDelCeco) {
    return nombreDelCeco.includes("Licencias personales");
  }

  totalHorasFacturables = () => {
    return this.props.registrosDeHora
      .filter(({ registro_de_hora }) => registro_de_hora.facturable)
      .reduce(this.sumarHoras, 0);
  };

  totalHorasNoFacturablesSinLicencias = () => {
    return this.props.registrosDeHora
      .filter(
        ({ registro_de_hora }) =>
          !registro_de_hora.facturable &&
          !this.esLicencia(
            nombreCeco(
              this.props.centrosDeCosto,
              registro_de_hora.centro_de_costo_id,
            ),
          ),
      )
      .reduce(this.sumarHoras, 0);
  };

  porcentajeHorasSinLicenciasFacturables = () => {
    const resultadoDivision =
      (this.totalHorasFacturables() * 100) / this.totalHorasSinLicencias();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  porcentajeHorasFacturables = () => {
    const resultadoDivision =
      (this.totalHorasFacturables() * 100) / this.totalHoras();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  porcentajeHorasSinLicenciasNoFacturables = () => {
    const resultadoDivision =
      (this.totalHorasNoFacturablesSinLicencias() * 100) /
      this.totalHorasSinLicencias();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  totalHorasNoFacturables = () => {
    return this.props.registrosDeHora
      .filter(({ registro_de_hora }) => !registro_de_hora.facturable)
      .reduce(this.sumarHoras, 0);
  };

  porcentajeHorasNoFacturables = () => {
    const resultadoDivision =
      (this.totalHorasNoFacturables() * 100) / this.totalHoras();
    return this.chequearDivisionInvalida(resultadoDivision).toFixed(1);
  };

  lineasDeReferenciaEjeY = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  render() {
    const data = this.horasAgrupadasPorFecha();

    const metricaDataReal = {
      datasets: [
        {
          data: [
            this.porcentajeHorasFacturables(),
            this.porcentajeHorasNoFacturables(),
          ],
          backgroundColor: ["#566B5C", "#00bc34"],
          borderWidth: 0,
        },
      ],
    };

    const metricaDataSinLicencias = {
      datasets: [
        {
          data: [
            this.porcentajeHorasSinLicenciasFacturables(),
            this.porcentajeHorasSinLicenciasNoFacturables(),
          ],
          backgroundColor: ["#566B5C", "#00bc34"],
          borderWidth: 0,
        },
      ],
    };

    return (
      <div className="Metricas">
        <h2>Distribución de horas</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis
              dataKey="fecha"
              tickFormatter={this.formatearEjeX}
              interval={0}
              tick={<CustomizedAxisTick data={data} />}
            />
            <YAxis
              tickFormatter={this.formatearEjeY}
              ticks={this.lineasDeReferenciaEjeY()}
            />
            <CartesianGrid strokeDasharray="2 0" vertical={false} />
            <Tooltip
              content={
                <TooltipRegistros
                  centrosDeCosto={this.props.centrosDeCosto}
                  registrosDeHora={this.props.registrosDeHora}
                  fechaAVisualizar={this.props.fechaAVisualizar}
                />
              }
            />
            <Bar
              dataKey="facturables"
              stackId="a"
              fill="#566B5C"
              background={<BackgroundForWeekends />}
            />
            <Bar dataKey="no facturables" stackId="a" fill="#00bc34" />
            <Bar dataKey="vista previa" stackId="a" fill="#FFD742" />
          </BarChart>
        </ResponsiveContainer>

        <div className="titulo">
          <h2>Métricas</h2>
          <span>
            Tomando en cuenta los {this.cantidadDiasCargados()} días cargados
            hasta hoy del mes actual.
          </span>
        </div>
        <div className="metricas">
          <div className="metrica">
            <div className="subtitulo">Total</div>
            <h1>{this.totalHoras()} hs</h1>
            <div className="notas">Promedio: {this.promedioTotal()} hs</div>
          </div>

          <div className="metrica">
            <div className="subtitulo">Facturables</div>
            <h1>{this.totalHorasFacturables()} hs</h1>
            <div className="notas">
              Promedio: {this.promedioHorasFacturables()} hs
            </div>
          </div>

          <div className="metrica">
            <div className="subtitulo">Contando licencias</div>
            <div className="porcentaje">
              <h1>{this.porcentajeHorasFacturables()}%</h1>
              <Dona data={metricaDataReal} />
            </div>
          </div>
          <div className="metrica">
            <div className="subtitulo">Sin contar licencias</div>
            <div className="porcentaje">
              <h1>{this.porcentajeHorasSinLicenciasFacturables()}%</h1>
              <div className="dona">
                <Dona data={metricaDataSinLicencias} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class BackgroundForWeekends extends PureComponent {
  render() {
    const {
      x,
      y,
      width,
      height,
      payload: { esFinDeSemana },
    } = this.props;

    return esFinDeSemana ? (
      <rect width={width} height={height} x={x} y={y} fill="#66666653" />
    ) : (
      <></>
    );
  }
}

class CustomizedAxisTick extends PureComponent {
  formatearEjeX = (fecha) => {
    return fecha.split("-")[2];
  };

  esAnteriorALaVisualizada = (fecha) => fecha < this.props.fechaAVisualizar;

  esPosteriorALaVisualizada = (fecha) => fecha > this.props.fechaAVisualizar;

  dataDelDiaNoTieneHorasCargadas = (dataDelDia) => {
    return !(dataDelDia["facturables"] || dataDelDia["no facturables"]);
  };

  colorDeTickDependiendoSiFueCargado = (fecha) => {
    const dataDelDia = this.dataDelDia();
    return this.esAnteriorALaVisualizada(fecha) &&
      this.dataDelDiaNoTieneHorasCargadas(dataDelDia)
      ? "red"
      : "black";
  };

  dataDelDia() {
    const { data, index } = this.props;
    return data[index];
  }

  colorDeTick = () => {
    const fecha = this.fechaParseada();
    if (this.esPosteriorALaVisualizada(fecha)) return "#a7a7a7";
    return esFinde(fecha)
      ? "#666"
      : this.colorDeTickDependiendoSiFueCargado(fecha);
  };

  fechaParseada() {
    return parsearFecha(this.props.payload.value);
  }

  esElDiaSeleccionado = () => {
    if (this.dataDelDia().estaSeleccionado)
      return this.dataDelDia().estaSeleccionado;
  };

  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        {this.esElDiaSeleccionado() && (
          <circle cy="12" r="10" fill="none" stroke="black" strokeWidth="1" />
        )}
        <text
          fontWeight="600"
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={this.colorDeTick()}
        >
          {this.formatearEjeX(payload.value)}
        </text>
      </g>
    );
  }
}
