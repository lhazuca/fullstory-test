import { fireEvent, render } from "@testing-library/react";

import {
  backofficeFalso,
  centrosDeCostoDefault,
  tiposDeHoraDefault,
} from "../__test_helpers__/backofficeMockApi";
import PanelCarga from "../components/PanelCarga";
import { elegirCeco } from "../__test_helpers__/accionesCecoSelect";
import { DateTime } from "luxon";

jest.mock("canvas-confetti", () => ({
  create() {
    const fire = jest.fn(() => {});
    fire.reset = jest.fn(() => {});
    return fire;
  },
}));

describe("el envío", () => {
  const fecha = DateTime.local(2022, 11, 7);
  const fechaQueEsperoRecibaElBackoffice = "2022-11-07";

  const setup = (horaACargar, actualizarHora = () => {}) => {
    const backoffice = backofficeFalso();

    const resetearHoraACargar = () => {
      horaACargar = {
        ...horaACargar,
        cantidad: "",
        nota: "",
        facturable: false,
        centroDeCosto: null,
      };
    };

    return {
      ...render(
        <PanelCarga
          horaACargar={horaACargar}
          registrosDeHora={[]}
          centrosDeCosto={centrosDeCostoDefault}
          tiposDeHora={tiposDeHoraDefault}
          backofficeApi={backoffice}
          cargarNuevaHora={() => {
            backoffice.cargarHora(horaACargar);
          }}
          alCargarHoraNueva={() => {}}
          actualizarHoraVistaPrevia={actualizarHora}
          actualizarHorasCargadas={() => {}}
          resetearHoraACargar={resetearHoraACargar}
          fecha={fecha}
        />,
      ),
      backoffice,
    };
  };

  const ingresarEn = (valor, input) =>
    fireEvent.change(input, { target: { value: valor } });

  it("es válido cuando tiene 0 horas", async () => {
    const horaACargar = {
      tiposDeHora: [],
      fecha: fecha,
      cantidad: 0,
      nota: "Esto es un registro de hora",
      tipoDeHora: "",
      centroDeCosto: { id: 1, nombre: "10Pines" },
      facturable: false,
    };

    const { getByTestId } = setup(horaACargar);
    const inputNota = getByTestId("input-nota");
    const cantidadHoras = getByTestId("input-cantidad-horas");
    const centroDeCosto = getByTestId("select-ceco");
    const enviar = getByTestId("boton-cargar-horas");

    ingresarEn("0", cantidadHoras);
    await elegirCeco("10Pines", centroDeCosto);
    ingresarEn("Probando, probando", inputNota);

    expect(enviar).not.toBeDisabled();
  });

  it("Al enviar, guarda las horas cargadas en el backoffice y limpia el formulario", async () => {
    const horaACargar = {
      tiposDeHora: [],
      fecha: fecha,
      cantidad: 2,
      nota: "Probando, probando",
      tipoDeHora: "CONSULTORIA",
      centroDeCosto: { id: 1, nombre: "10Pines" },
      facturable: false,
    };

    const { getByTestId, backoffice } = setup(horaACargar);
    const enviar = getByTestId("boton-cargar-horas");

    fireEvent.click(enviar);

    expect(await backoffice.horasDelMes()).toEqual([
      {
        cantidad_horas: 2,
        centro_de_costo_id: 1,
        facturable: false,
        fecha: fechaQueEsperoRecibaElBackoffice,
        id: 1,
        notas: "Probando, probando",
        tipo_de_hora: "CONSULTORIA",
      },
    ]);
  });

  it("es válido cuando es en un dia futuro del mismo mes", async () => {
    const horaACargar = {
      tiposDeHora: [],
      fecha: fecha.plus({ days: 1 }),
      cantidad: 1,
      nota: "Esto es un registro de hora",
      tipoDeHora: "CONSULTORIA",
      centroDeCosto: { id: 1, nombre: "10Pines" },
      facturable: false,
    };

    const { getByTestId } = setup(horaACargar);
    const enviar = getByTestId("boton-cargar-horas");

    expect(enviar.className).not.toContain("disabled");
  });
});
