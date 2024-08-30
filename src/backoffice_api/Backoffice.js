import { exportarABackofficeTipoHora, formatearFechaAString } from "../utils";

export default class Backoffice {
  constructor(oidcClient, user) {
    this.oidcClient = oidcClient;
    this.user = user;
    oidcClient.events.addUserLoaded((user) => {
      this.user = user;
    });
  }

  autenticarse = () => {
    return this.oidcClient.signinRedirect();
  };

  estaAutenticado = () => {
    return this.user && !this.user.expired;
  };

  serializarFecha = (registroDeHora) => {
    return formatearFechaAString(registroDeHora.fecha);
  };

  registroDeHoraDeBackoffice = (registroDeHora) => {
    return {
      registro_de_hora: {
        fecha: this.serializarFecha(registroDeHora),
        cantidad_horas: registroDeHora.cantidad,
        notas: registroDeHora.nota,
        tipo_de_hora: exportarABackofficeTipoHora(registroDeHora.tipoDeHora),
        centro_de_costo_id: registroDeHora.centroDeCosto.id,
        facturable: registroDeHora.facturable,
      },
    };
  };

  fetchBackoffice = async (method, url, body) => {
    const user = this.user;
    const response = await fetch(backofficeUrl(url), {
      method,
      mode: "cors",
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) return response;

    if (response.status === 401) {
      await this.oidcClient.removeUser();
      throw new BackofficeError([
        "El token es invalido, refrescá la pagina para renovarlo",
      ]);
    }

    const isJson = response.headers
      ?.get("content-type")
      ?.includes("application/json");

    const data = isJson
      ? this.getErrorMessageFromJson(await response.json())
      : [this.getErrorMessage(response, method, url)];
    console.error(`Error al llamar al backoffice - ${method} ${url}`, data);
    throw new BackofficeError(data);
  };

  getErrorMessage = (response, method, url) => {
    const isHTML = response.headers?.get("content-type")?.includes("html");
    switch (response.status) {
      case 400:
        return `La operación ${method} tiene información incompleta.`;
      case 404:
        return isHTML
          ? `URL ${method} ${url} no encontrada`
          : `No se encontró el elemento para la operación ${method} ${url}`;
      default:
        return "Error interno de backoffice";
    }
  };

  getErrorMessageFromJson = (data) => {
    return (
      data.error ??
      Object.keys(data.errors).map((key) => `${key}: ${data.errors[key]}`)
    );
  };

  cargarHora = async (registroDeHora) => {
    const registroDeHoraACargar =
      this.registroDeHoraDeBackoffice(registroDeHora);
    const response = await this.fetchBackoffice(
      "POST",
      "registro_de_horas",
      registroDeHoraACargar,
    );
    return await response.json();
  };

  borrarHora = async (idDeHora) => {
    return this.fetchBackoffice("DELETE", `registro_de_horas/${idDeHora}`);
  };

  editarHora = async (idDeHora, horaEditada) => {
    const horaEditadaEnFormatoBackoffice =
      this.registroDeHoraDeBackoffice(horaEditada);
    return this.fetchBackoffice(
      "PUT",
      `registro_de_horas/${idDeHora}`,
      horaEditadaEnFormatoBackoffice,
    );
  };

  centrosDeCosto = async () => {
    const response = await this.fetchBackoffice("GET", "cecos");
    return await response.json();
  };

  horasDelMes = async (fecha) => {
    const fechaABuscar = formatearFechaAString(fecha);
    const params = new URLSearchParams(window.location.search);
    const fechaParam = params.has("fecha")
      ? `?fecha=${params.get("fecha")}`
      : `?fecha=${fechaABuscar}`;

    const response = await this.fetchBackoffice(
      "GET",
      `registro_de_horas${fechaParam}`,
    );
    const responseText = await response.text();
    return responseText === "" ? [] : JSON.parse(responseText);
  };

  diasDeVacacionesDisponibles = async () => {
    const response = await this.fetchBackoffice("GET", "vacaciones_restantes");
    return await response.json();
  };

  tiloDisponible = async () => {
    const response = await this.fetchBackoffice(
      "GET",
      "licencia_tilo_restantes",
    );
    return await response.json();
  };

  diasDeVacacionesAcumuladas = async () => {
    const response = await this.fetchBackoffice("GET", "vacaciones_acumuladas");
    return await response.json();
  };
}

export class BackofficeError extends Error {
  constructor(errors) {
    super("Hubo errores con un request del backoffice");
    this.errorMessages = errors;
  }
}

const baseBackofficeUrl = () => process.env.REACT_APP_BACKOFFICE_URL;

export const backofficeUrl = (endpoint) => {
  // Removemos todos los slashes dobles, excepto del de https://
  return `${baseBackofficeUrl()}/api/${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
};
