import "../styles/TortaDeCecos.scss";

import { Component } from "react";
import { Pie } from "react-chartjs-2";
import { isEmpty } from "lodash";

export default class TortaDeCecos extends Component {
  agruparCentrosDeCostoConHoras() {
    return this.props.registrosDeHora.reduce((accum, { registro_de_hora }) => {
      let registroAgrupado = accum.find(
        (registroAgrupado) =>
          registroAgrupado.centro_de_costo_id ===
          registro_de_hora.centro_de_costo_id,
      );

      if (registroAgrupado) {
        registroAgrupado.cantidad_horas += parseFloat(
          registro_de_hora.cantidad_horas,
        );
        registroAgrupado.facturable =
          registroAgrupado.facturable || registro_de_hora.facturable;
      } else {
        accum = [
          ...accum,
          {
            centro_de_costo_id: registro_de_hora.centro_de_costo_id,
            cantidad_horas: parseFloat(registro_de_hora.cantidad_horas),
            facturable: registro_de_hora.facturable,
          },
        ];
      }
      return accum;
    }, []);
  }

  nombreDelCentroCosto(id) {
    let centroDeCosto = this.props.centrosDeCosto.find((cc) => cc.id === id);
    return centroDeCosto?.nombre;
  }

  crearDatosAMostrar() {
    const centrosDeCostoAgrupadosConNombre =
      this.agruparCentrosDeCostoConHoras().map(
        ({ centro_de_costo_id, cantidad_horas, facturable }) => {
          const nombre =
            this.nombreDelCentroCosto(centro_de_costo_id) ??
            this.nombreDelCentroCosto(this.props.centroCostoIdEditado) ??
            "Editando...";
          return {
            cantidad: cantidad_horas,
            nombre,
            facturable,
          };
        },
      );

    const cecoConMasHoras = this.buscarCecoConMasHoras(
      centrosDeCostoAgrupadosConNombre,
    );

    const cecoConMasHorasNoFacturable = this.buscarCecoConMasHoras(
      centrosDeCostoAgrupadosConNombre.filter((ceco) => !ceco.facturable),
    );

    const totalCecos = centrosDeCostoAgrupadosConNombre.length;

    const totalCecosFacturables = centrosDeCostoAgrupadosConNombre.filter(
      (ceco) => ceco.facturable,
    ).length;

    return {
      labels: centrosDeCostoAgrupadosConNombre.map((cc) => cc.nombre),
      horasPorCentro: centrosDeCostoAgrupadosConNombre.map((cc) => cc.cantidad),
      colores: centrosDeCostoAgrupadosConNombre.map(
        () =>
          `rgb(${this.numeroRandomEntre0y255()},${this.numeroRandomEntre0y255()},${this.numeroRandomEntre0y255()})`,
      ),
      descripcion: "¿En que venimos invirtiendo el tiempo?",
      cecoConMasHoras,
      cecoConMasHorasNoFacturable,
      totalCecos,
      totalCecosFacturables,
    };
  }

  buscarCecoConMasHoras(centrosDeCostoAgrupadosConNombre) {
    return (
      centrosDeCostoAgrupadosConNombre.sort(
        (a, b) => b.cantidad - a.cantidad,
      )[0]?.nombre ?? "No hay Cecos todavía"
    );
  }

  numeroRandomEntre0y255() {
    return Math.floor(Math.random() * 256);
  }

  mostrarGraficoCecos(datos, hasAtLeastMediumScreenSize) {
    return (
      <div className="GraphContainer">
        <Pie
          data={{
            labels: datos.labels,
            legend: {
              display: false,
            },
            datasets: [
              {
                label: datos.descripcion,
                data: datos.horasPorCentro,
                backgroundColor: datos.colores,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
                align: "start",
                display: hasAtLeastMediumScreenSize,
              },

              tooltip: {
                callbacks: {
                  label(tooltipItem) {
                    const item = `${tooltipItem.label}: ${tooltipItem.formattedValue}hs`;
                    return hasAtLeastMediumScreenSize
                      ? item
                      : item.match(/.{1,32}/g);
                  },
                },
              },
            },
          }}
        />
      </div>
    );
  }

  render() {
    const datos = this.crearDatosAMostrar();
    const hasAtLeastMediumScreenSize = window.innerWidth > 600;
    return (
      <div className="TortaDeCecos">
        <h2>Horas por ceco</h2>
        {isEmpty(datos.labels)
          ? this.tortaPlaceholder()
          : this.mostrarGraficoCecos(datos, hasAtLeastMediumScreenSize)}
        <div className="titulo">
          <h2>Métricas</h2>
          <span>
            Teniendo en cuenta desde la primer hora cargada del mes hasta hoy
          </span>
        </div>
        <div className="indicadores">
          <ul>
            <li>Ceco con más horas: {datos.cecoConMasHoras}</li>
            <li>
              Ceco con más horas No Facturable:{" "}
              {datos.cecoConMasHorasNoFacturable}
            </li>
          </ul>
          <ul>
            <li>
              Cantidad de centro costos usados este mes: {datos.totalCecos}
            </li>
            <li>
              Cantidad de centro costos donde se facturaron horas:{" "}
              {datos.totalCecosFacturables}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  tortaPlaceholder() {
    return (
      <div className="reemplazo-torta">
        No hay nada para mostrar, todavía no se cargó ninguna hora este mes
      </div>
    );
  }
}
