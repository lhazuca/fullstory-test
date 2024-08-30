import { TIPO_DE_HORA_DEFAULT, formatearFechaAString } from "../utils";

export const centrosDeCostoDefault = [{ id: 1, nombre: "10Pines" }];
export const tiposDeHoraDefault = ["Consultoria", TIPO_DE_HORA_DEFAULT];

export function backofficeFalso({
  estaAutenticado = true,
  centrosDeCosto = centrosDeCostoDefault,
} = {}) {
  const horasCargadas = [];
  const tiloDisponible = { dias_tilo_restantes: 0, horas_tilo_restantes: 40.0 };

  return {
    centrosDeCosto: async () => centrosDeCosto,
    tiposDeHora: async () => tiposDeHoraDefault,
    horasDelMes: async () => horasCargadas,
    estaAutenticado: () => estaAutenticado,
    diasDeVacacionesDisponibles: async () => 0,
    tiloDisponible: async () => tiloDisponible,
    diasDeVacacionesAcumuladas: async () => 0,

    cargarHora: async (registroDeHora) => {
      horasCargadas.push({
        cantidad_horas: registroDeHora.cantidad,
        centro_de_costo_id: registroDeHora.centroDeCosto.id,
        facturable: registroDeHora.facturable,
        fecha: formatearFechaAString(registroDeHora.fecha),
        id: horasCargadas.length + 1,
        notas: registroDeHora.nota,
        tipo_de_hora: registroDeHora.tipoDeHora.toUpperCase(),
      });

      return {};
    },
  };
}
