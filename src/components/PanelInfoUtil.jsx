import "../styles/InfoUtil.scss";

import { Component } from "react";

export default class PanelInfoUtil extends Component {
  render() {
    const hayTiloDisponible =
      this.props.infoLicencias.cantidadDiasTiloDisponibles !== 0;
    return (
      <div className="InfoUtil">
        <div className="Metricas">
          <div className="titulo">
            <h2>Información útil</h2>
          </div>
          <div className="metricas">
            <div className="metrica">
              <div className="subtitulo">Vacaciones disponibles</div>
              <h1>
                {this.props.infoLicencias.cantidadVacacionesDisponibles} días
              </h1>
              <div className="notas">
                De otros años:{" "}
                {this.props.infoLicencias.cantidadDiasVacacionesAcumuladas} días
              </div>
            </div>
            <div className="metrica">
              <div className="subtitulo">
                Tiempo Libre Optativo (TiLO) disponible
              </div>
              {hayTiloDisponible && (
                <>
                  <h1>
                    {this.props.infoLicencias.cantidadDiasTiloDisponibles} días{" "}
                    o {this.props.infoLicencias.cantidadHorasTiloDisponibles}{" "}
                    horas
                  </h1>
                  <div className="notas">
                    Recordá que vencen a fin de <b>Diciembre</b>
                  </div>
                </>
              )}
              {!hayTiloDisponible && (
                <>
                  <h1>Consumiste todo tu TiLO 🍵</h1>
                  <div className="notas">
                    Recordá que se renuevan en <b>Enero</b>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
