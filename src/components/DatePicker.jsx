import "../styles/DatePicker.scss";
import "react-datepicker/dist/react-datepicker.css";

import {
  faCaretSquareDown,
  faCaretSquareUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component } from "react";
import { hotkeys } from "react-keyboard-shortcuts";

import { formatearFechaAString, parsearFecha } from "../utils";
import { DateTime } from "luxon";

const modPositivo = (m, n) => {
  let res = m % n;

  if (res >= 0) {
    return res;
  } else {
    return res + n;
  }
};

export const trasladarFecha = (fechaOriginal, traslado, ultimoDiaDelMes) => {
  const nuevoDia =
    modPositivo(fechaOriginal.day - 1 + traslado, ultimoDiaDelMes) + 1;
  return fechaOriginal.set({ day: nuevoDia });
};

class SelectorFecha extends Component {
  hot_keys = {
    "ctrl+up": {
      handler: () => this.avanzarUnDia(),
    },
    "ctrl+down": {
      handler: () => this.retrocederUnDia(),
    },
    "command+up": {
      handler: () => this.avanzarUnDia(),
    },
    "command+down": {
      handler: () => this.retrocederUnDia(),
    },
    "command+left": {
      handler: () => this.retrocederUnDia(),
    },
    "command+right": {
      handler: () => this.avanzarUnDia(),
    },
  };

  avanzarUnDia = () => {
    this.moverFechaPor(1);
  };
  retrocederUnDia = () => {
    this.moverFechaPor(-1);
  };

  cambioFecha = (fechaNueva) => {
    if (fechaNueva.isValid && fechaNueva <= this.ultimoDiaSeleccionable()) {
      this.props.onChange(fechaNueva);
    }
  };

  cambioFechaManual = (fechaNuevaAsString) => {
    this.cambioFecha(parsearFecha(fechaNuevaAsString));
  };

  primerDiaDelMesAnterior = () =>
    this.props.fecha.set({ day: 1 }).minus({ month: 1 });

  ultimoDiaSeleccionable = () =>
    DateTime.local(
      DateTime.now().year,
      DateTime.now().month,
      DateTime.now().daysInMonth,
    ).plus({ month: 1 });

  moverFechaPor(diferencialDeFecha) {
    const nuevaFecha = trasladarFecha(
      this.props.fecha,
      diferencialDeFecha,
      this.ultimoDiaSeleccionable().day,
    );
    this.cambioFecha(nuevaFecha);
  }

  render() {
    return (
      <div className="inputConLabel" data-testid="panelCargaFecha">
        <div className="datePickerTitleContainer">
          <label htmlFor="datePickerInput">Fecha</label>
          {this.props.showControls && (
            <div className="datepicker-controls">
              <FontAwesomeIcon
                icon={faCaretSquareUp}
                className="control-letter"
              />
              <FontAwesomeIcon
                icon={faCaretSquareDown}
                className="control-letter"
              />
            </div>
          )}
        </div>

        <input
          data-testid="panelCargaFecha-input"
          type="date"
          value={formatearFechaAString(this.props.fecha)}
          onChange={(event) =>
            this.cambioFechaManual(event.currentTarget.value)
          }
          max={formatearFechaAString(this.ultimoDiaSeleccionable())}
          min={formatearFechaAString(this.primerDiaDelMesAnterior())}
          ref={this.props.fieldRef}
        />
      </div>
    );
  }
}

export default hotkeys(SelectorFecha);
