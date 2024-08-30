import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactDOM from "react-dom";

import { backofficeFalso } from "../__test_helpers__/backofficeMockApi";
import App, {
  crearTemplateConNombre,
  convertirHoraDeBackofficeAHoraParaCargar,
  convertirHoraDeBackofficeAHoraParaCopiar,
} from "../App";
import { elegirCeco } from "../__test_helpers__/accionesCecoSelect";
import { describe, expect } from "@jest/globals";
import { DateTime } from "luxon";
import { TIPO_DE_HORA_DEFAULT } from "../utils";

const setup = (backofficeApi = backofficeFalso()) =>
  render(<App backofficeApi={backofficeApi} />);

it("se renderiza", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App backofficeApi={backofficeFalso()} />, div);
});

it("muestra el login cuando no hay token", () => {
  setup(backofficeFalso({ estaAutenticado: false }));

  const main = screen.getByRole("main");

  expect(main).toHaveTextContent(
    "Inicia sesión con tus credenciales del Backoffice",
  );
});

xit("muestra el login cuando el token es inválido", () => {
  const mock = (backofficeFalso.horasDelMes = () =>
    Promise.resolve({ error: "" }));

  setup(mock);

  const main = screen.getByRole("main");

  expect(main).toHaveTextContent(
    "Inicia Sesión con tus credenciales del Backoffice",
  );
});

xit("renderiza panel de carga cuando el token es válido", () => {
  backofficeFalso.horasDelMes = () => Promise.resolve([]);
  const { getByTestId } = setup();

  const main = screen.getByRole("main");
  const panelCarga = getByTestId("formulario-carga");

  expect(main).toContainElement(panelCarga);
});

xit("renderiza el panel de carga luego de obtener el token exitosamente", async () => {
  backofficeFalso.autenticar = jest.fn((_usuario, _password) =>
    Promise.resolve({ token: "token-valido" }),
  );

  const { getByTestId, getByText } = setup(backofficeFalso());

  const usuario = getByTestId("input-usuario");
  const password = getByTestId("input-password");
  const botonLogin = getByText("Login");

  await userEvent.type(usuario, "pino");
  await userEvent.type(password, "password-pino");

  expect(usuario).toHaveValue("pino");
  expect(password).toHaveValue("password-pino");

  await userEvent.click(botonLogin);

  const main = screen.getByRole("main");

  expect(main).toContainElement(getByTestId("formulario-carga"));
});

it("se pueden elegir centros de costo disponibles en el backoffice", async () => {
  const centrosDeCosto = [{ id: 1, nombre: "10Pines > CECO" }];
  const { getByTestId } = setup(backofficeFalso({ centrosDeCosto }));

  const selectorCecos = getByTestId("select-ceco");
  await elegirCeco("10Pines > CECO", selectorCecos);

  expect(selectorCecos).toHaveTextContent("10Pines > CECO");
});

it("se pueden importar templates desde un json", async () => {
  const centrosDeCosto = [{ id: 1, nombre: "10Pines > CECO" }];
  const { getByTestId, getByText } = setup(backofficeFalso({ centrosDeCosto }));

  const archivoAImportar = new File(
    [
      '[{"nombre": "Nuevo Template","facturable": false,"cantidad": "3","tipoDeHora": "Desarrollo","centroDeCosto": { "id": 270, "nombre": "10Pines > Aguinaldos" } }]',
    ],
    "templates.json",
    {
      type: "application/json",
    },
  );

  const botonImportar = getByTestId("importar-templates");

  await userEvent.upload(botonImportar, archivoAImportar);

  const template = getByText("Nuevo Template");
  expect(template).not.toBeNull();
});

describe("al crear un template con un nombre el dia de hoy ", () => {
  const hoy = DateTime.now();
  const nombre = "testTemplate";

  describe("al tener una hora a cargar vacia", () => {
    const horaACargarVacia = {
      fecha: hoy,
      cantidad: "",
      nota: "",
      tipoDeHora: TIPO_DE_HORA_DEFAULT,
      centroDeCosto: undefined,
      facturable: false,
    };

    it("si no se ingreso ningun campo en la hora a cargar la misma solo contine nombre, fecha y tipo de hora", () => {
      const template = crearTemplateConNombre(nombre, horaACargarVacia);

      expect(template).toEqual({
        nombre,
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
        facturable: false,
      });
    });
  });

  describe("si se tiene una hora a cargar solo con cantidad", () => {
    const horaACargarConCantidad = {
      fecha: hoy,
      cantidad: 4,
      nota: "",
      tipoDeHora: TIPO_DE_HORA_DEFAULT,
      centroDeCosto: undefined,
      facturable: false,
    };

    it("si se ingresa cantidad de horas se tiene solo la hora base sin la fecha mas la cantidad", () => {
      const template = crearTemplateConNombre(nombre, horaACargarConCantidad);

      expect(template).toEqual({
        nombre,
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
        cantidad: 4,
        facturable: false,
      });
    });
  });

  describe("si se tiene una hora a cargar completa", () => {
    const horaACargarCompleta = {
      fecha: hoy,
      cantidad: 4,
      nota: "nota importante",
      tipoDeHora: TIPO_DE_HORA_DEFAULT,
      centroDeCosto: "10Pines",
      facturable: true,
    };

    it("si se ingresa cantidad de horas se tienen todos los campos completos sin la fecha", () => {
      const template = crearTemplateConNombre(nombre, horaACargarCompleta);

      expect(template).toEqual({
        nombre,
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
        cantidad: 4,
        nota: "nota importante",
        facturable: true,
        centroDeCosto: "10Pines",
      });
    });
  });
});

describe("al convertir la hora de backoffice para cargar", () => {
  const hoy = "2022-11-10";
  const centrosDeCosto = [{ id: 1, nombre: "10Pines > CECO" }];

  it("no trunca la cantidad de horas si tiene decimales", () => {
    const horaACargarCompleta = {
      fecha: hoy,
      cantidad_horas: "4.5",
      notas: "nota importante",
      tipo_de_hora: "DESARROLLO",
      centro_de_costo_id: 1,
      facturable: true,
    };

    const { cantidad, nota, tipoDeHora, centroDeCosto, facturable } =
      convertirHoraDeBackofficeAHoraParaCargar(
        horaACargarCompleta,
        centrosDeCosto,
      );

    expect(cantidad).toBe(4.5);
    expect(nota).toBe("nota importante");
    expect(tipoDeHora).toBe("Desarrollo");
    expect(centroDeCosto.nombre).toBe("10Pines > CECO");
    expect(facturable).toBeTruthy();
  });

  it("funciona ok si la cantidad de horas no tiene decimales", () => {
    const horaACargarCompleta = {
      fecha: hoy,
      cantidad_horas: "4",
      notas: "nota importante",
      tipoDeHora: "Desarrollo",
      centro_de_costo_id: 1,
      facturable: true,
    };

    const { cantidad } = convertirHoraDeBackofficeAHoraParaCargar(
      horaACargarCompleta,
      centrosDeCosto,
    );

    expect(cantidad).toEqual(4);
  });

  it("si la cantidad de decimales es un valor no numérico lo deja en cero", () => {
    const horaACargarCompleta = {
      fecha: hoy,
      cantidad_horas: "UH",
      notas: "nota importante",
      tipoDeHora: "Desarrollo",
      centro_de_costo_id: 1,
      facturable: true,
    };

    const { cantidad } = convertirHoraDeBackofficeAHoraParaCargar(
      horaACargarCompleta,
      centrosDeCosto,
    );

    expect(cantidad).toEqual(0);
  });
});
describe("al convertir la hora de backoffice para copiar", () => {
  const hoy = "2022-11-10";
  const centrosDeCosto = [{ id: 1, nombre: "10Pines > CECO" }];

  it("copia los valores", () => {
    const horaACargarCompleta = {
      id: 1,
      fecha: hoy,
      cantidad_horas: "4.5",
      notas: "nota importante",
      tipo_de_hora: "DESARROLLO",
      centro_de_costo_id: 1,
      facturable: true,
    };

    const { cantidad, nota, tipoDeHora, centroDeCosto, facturable } =
      convertirHoraDeBackofficeAHoraParaCopiar(
        horaACargarCompleta,
        centrosDeCosto,
      );

    expect(cantidad).toBe(4.5);
    expect(nota).toBe("nota importante");
    expect(tipoDeHora).toBe("Desarrollo");
    expect(centroDeCosto.nombre).toBe("10Pines > CECO");
    expect(facturable).toBeTruthy();
  });

  it("no copia el id y cambia la fecha al dia actual", () => {
    const horaACargarCompleta = {
      id: 1,
      fecha: "2022-11-10",
      cantidad_horas: "4.5",
      notas: "nota importante",
      tipo_de_hora: "DESARROLLO",
      centro_de_costo_id: 1,
      facturable: true,
    };

    const { id, fecha } = convertirHoraDeBackofficeAHoraParaCopiar(
      horaACargarCompleta,
      centrosDeCosto,
    );
    const diaActual = DateTime.now();
    expect(id).toBe(undefined);
    expect(fecha.day).toEqual(diaActual.day);
    expect(fecha.month).toEqual(diaActual.month);
    expect(fecha.year).toEqual(diaActual.year);
  });
});
