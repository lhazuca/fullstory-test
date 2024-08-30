import "../styles/RegistrosDeHora.scss";

import { PieChart } from "@material-ui/icons";
import BarChartIcon from "@material-ui/icons/BarChart";
import ViewListIcon from "@material-ui/icons/ViewList";
import { Component } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import HorasDelMes from "./HorasDelMes";
import MetricasDistribucion from "./MetricasDistribucion";
import TortaDeCecos from "./TortaDeCecos";
import {
  esMesPosteriorA,
  formatearFechaAString,
  nombreMes,
  obtenerRegistrosDeHoraAPrevisualizar,
} from "../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretSquareLeft,
  faCaretSquareRight,
} from "@fortawesome/free-solid-svg-icons";
import { DateTime } from "luxon";

export default class RegistrosDeHora extends Component {
  sonHorasValidas(rawHoras) {
    return /^\d+(\.\d+)?$/.test(rawHoras);
  }

  crearhoraACargar() {
    if (!this.sonHorasValidas(this.props.horaACargar.cantidad)) {
      return [];
    }

    return [
      {
        registro_de_hora: {
          cantidad_horas: this.props.horaACargar.cantidad,
          centro_de_costo_id: this.props.horaACargar.centro_de_costo_id,
          facturable: this.props.horaACargar.facturable,
          fecha: formatearFechaAString(this.props.horaACargar.fecha),
          notas: this.props.horaACargar.nota,
          tipo_de_hora: this.props.horaACargar.tipo_de_hora,
          vista_previa: true,
        },
      },
    ];
  }

  registrosDeHorasAPrevisualizar() {
    return obtenerRegistrosDeHoraAPrevisualizar(
      this.props.horaACargar,
      this.props.registrosDeHora,
      this.crearhoraACargar(),
    );
  }

  puedeAvanzarFecha() {
    return !esMesPosteriorA(
      this.props.fechaAVisualizar,
      DateTime.now().plus({ month: 1 }),
    );
  }

  render() {
    const fechaSeleccionada = this.props.horaACargar.fecha;
    return (
      <div
        className={"RegistrosDeHora" + (this.props.cargando ? " cargando" : "")}
      >
        <div className="header">
          <FontAwesomeIcon
            icon={faCaretSquareLeft}
            className="boton-cambio-fecha"
            onClick={this.props.onClickAtras}
          />
          <span className="mes-y-año">
            {nombreMes(this.props.fechaAVisualizar)}{" "}
            {this.props.fechaAVisualizar.year}
          </span>
          <FontAwesomeIcon
            icon={faCaretSquareRight}
            className={
              this.puedeAvanzarFecha()
                ? `boton-cambio-fecha`
                : `boton-cambio-fecha oculto`
            }
            onClick={this.props.onClickAdelante}
          />
        </div>

        <Tabs>
          <TabList className="TabList">
            <Tab className="Tab">
              <ViewListIcon />
              <span className="title">Listado</span>
            </Tab>
            <Tab className="Tab">
              <BarChartIcon />
              <span className="title">Distribución</span>
            </Tab>
            <Tab className="Tab">
              <PieChart />
              <span className="title">Cecos</span>
            </Tab>
          </TabList>
          <TabPanel>
            <HorasDelMes
              centrosDeCosto={this.props.centrosDeCosto}
              registrosDeHora={this.props.registrosDeHora}
              fechaAVisualizar={this.props.fechaAVisualizar}
              fechaSeleccionada={fechaSeleccionada}
            />
          </TabPanel>
          <TabPanel>
            <MetricasDistribucion
              centrosDeCosto={this.props.centrosDeCosto}
              registrosDeHora={this.registrosDeHorasAPrevisualizar()}
              fechaAVisualizar={this.props.fechaAVisualizar}
              fechaSeleccionada={DateTime.now()}
            />
          </TabPanel>
          <TabPanel>
            <TortaDeCecos
              centrosDeCosto={this.props.centrosDeCosto}
              registrosDeHora={this.registrosDeHorasAPrevisualizar()}
              centroCostoIdEditado={this.props.horaACargar.centro_de_costo_id}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}
