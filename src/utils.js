import { DateTime, Interval } from "luxon";
import { BackofficeError } from "./backoffice_api/Backoffice";

export const esFinde = (dia) => dia.weekday === 6 || dia.weekday === 7;

export const TIPO_DE_HORA_DEFAULT = "Desarrollo";
export const TIPO_DE_HORA_ID_DEFAULT = "DESARROLLO";

const nombresDeTiposDeHora = {
  CONSULTORIA: "Consultoría",
  DESARROLLO: TIPO_DE_HORA_DEFAULT,
  PRE_VENTA: "Pre-Venta",
  DICTADO_CURSO: "Dictado de Curso",
  PREPARACION_CURSO: "Preparación de Curso",
  PROJECT_ADMIN: "Administración de projectos",
  INTERNA: "Tareas internas",
};

export const humanizarTipoDeHora = (tipoDeHora) => {
  return nombresDeTiposDeHora[tipoDeHora];
};

export const exportarABackofficeTipoHora = (tipoDeHora) => {
  return Object.keys(nombresDeTiposDeHora).find(
    (key) => nombresDeTiposDeHora[key] === tipoDeHora,
  );
};

export const tiposDeHora = async () => Object.values(nombresDeTiposDeHora);

const FORMATO_DE_FECHA_BACKOFFICE = "yyyy-MM-dd";

export const formatearFechaAString = (fecha) =>
  fecha.toFormat(FORMATO_DE_FECHA_BACKOFFICE);

export const parsearFecha = (fechaString) =>
  DateTime.fromFormat(fechaString, FORMATO_DE_FECHA_BACKOFFICE);

const ultimaParteDeCeco = (nombreCeco) => {
  return nombreCeco
    .split(">")
    .splice(-1)
    .pop()
    .substring(1, nombreCeco.length - 1);
};

export const tooltipTemplateButtonText = (template) => {
  let descripcionDelTemplate = "";
  descripcionDelTemplate += `Tipo de hora: ${template.tipoDeHora}\n`;

  if (template.cantidad) {
    descripcionDelTemplate += `Cantidad: ${template.cantidad}\n`;
  }

  descripcionDelTemplate += `Facturable: ${
    template.facturable ? "Si" : "No"
  }\n`;

  if (template.centroDeCosto) {
    descripcionDelTemplate += `Ceco: ${ultimaParteDeCeco(
      template.centroDeCosto.nombre,
    )}\n`;
  }

  if (template.nota) {
    descripcionDelTemplate += `Descripcion: ${template.nota}\n`;
  }

  return descripcionDelTemplate;
};

export const nombreCeco = (centrosDeCosto, centro_de_costo_id) => {
  const centroDeCosto = centrosDeCosto.find((ceco) => {
    return ceco.id === centro_de_costo_id;
  });
  return centroDeCosto ? centroDeCosto.nombre : "";
};

export const finDeMesDe = (fecha) =>
  DateTime.local(fecha.year, fecha.month, fecha.daysInMonth);

export const nombreMes = (fecha) => {
  const mes = fecha.setLocale("es").monthLong;
  return mes.charAt(0).toUpperCase() + mes.slice(1);
};

export const sonDelMismoMes = (unaFecha, otraFecha) =>
  unaFecha.startOf("month").equals(otraFecha.startOf("month"));

export const estaDentroDelRango = (unaFecha, otraFecha, duracion) => {
  const intervalo = Interval.fromDateTimes(
    otraFecha.minus(duracion).startOf("month"),
    otraFecha.plus(duracion).endOf("month"),
  );
  return intervalo.contains(unaFecha);
};

export const esMesPosteriorA = (unaFecha, otraFecha) =>
  unaFecha.month >= otraFecha.month && unaFecha.year === otraFecha.year;

export const sonMismoAñoMesYDia = (unaFecha, otraFecha) =>
  formatearFechaAString(unaFecha) === formatearFechaAString(otraFecha);

export const esDiaDeHoy = (dia) => sonMismoAñoMesYDia(dia, DateTime.now());

export const esMesActual = (dia) => sonDelMismoMes(dia, DateTime.now());

export const mostrarMensajeError = (toast) => (exception) => {
  if (exception instanceof BackofficeError) {
    exception.errorMessages.forEach((error) => toast.error(error));
  } else if (Array.isArray(exception)) {
    exception.forEach((error) => toast.error(error));
  } else {
    throw exception;
  }
};

export const obtenerRegistrosDeHoraAPrevisualizar = (
  horaPanelDeCarga,
  registrosDeHora,
  registrosDeHorasNuevos,
) => {
  return registrosDeHora
    .filter(
      ({ registro_de_hora }) => registro_de_hora.id !== horaPanelDeCarga.id,
    )
    .concat(registrosDeHorasNuevos);
};
