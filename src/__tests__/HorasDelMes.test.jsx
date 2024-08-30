import { render } from "@testing-library/react";

import HorasDelMes from "../components/HorasDelMes";
import { TIPO_DE_HORA_DEFAULT, parsearFecha } from "../utils";
import { Settings } from "luxon";

describe("HorasDelMes", () => {
  const fechaActual = parsearFecha("2020-01-20");
  const settingsNow = Settings.now;

  beforeAll(() => {
    Settings.now = () => fechaActual.toMillis();
  });

  afterAll(() => {
    Settings.now = settingsNow;
  });

  describe("sin horas cargadas", function () {
    it("no muestra ninguna hora si no las recibe", () => {
      const { queryAllByTestId } = render(
        <HorasDelMes
          centrosDeCosto={[]}
          registrosDeHora={[]}
          fechaSeleccionada={fechaActual}
          fechaAVisualizar={fechaActual}
        />,
      );

      const horasDelMes = queryAllByTestId("registro-hora");

      expect(horasDelMes).toEqual([]);
    });
  });

  describe("Con horas pasadas cargadas", function () {
    it("muestra tantos registros de hora como recibe y dias como dias tenga el mes", () => {
      const registrosDeHora = [
        {
          registro_de_hora: {
            id: 1,
            fecha: "2020-01-03",
            notas: "Haciendo cosas",
            cantidad_horas: "1.0",
            centro_de_costo_id: 123,
            facturable: false,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
        {
          registro_de_hora: {
            id: 2,
            fecha: "2020-01-04",
            notas: "Haciendo otras cosas",
            cantidad_horas: "3.0",
            centro_de_costo_id: 321,
            facturable: true,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
      ];

      const { queryAllByTestId, container } = render(
        <HorasDelMes
          centrosDeCosto={[]}
          registrosDeHora={registrosDeHora}
          fechaSeleccionada={fechaActual}
          fechaAVisualizar={fechaActual}
        />,
      );
      const horasCargadasDelMes = queryAllByTestId("registro-hora");
      expect(horasCargadasDelMes.length).toBe(registrosDeHora.length);

      const diasDelMes = container.getElementsByClassName("indicador-fecha");
      expect(diasDelMes.length).toBe(fechaActual.daysInMonth);

      const botonesDeEdicion =
        container.getElementsByClassName("boton-de-edicion");
      expect(botonesDeEdicion).toHaveLength(2);
    });
  });

  describe("Con una hora futura cargada", () => {
    const ultimoDiaCargado = 23;

    const registrosDeCargaHoraFutura = [
      {
        registro_de_hora: {
          id: 1,
          fecha: "2020-01-03",
          notas: "Haciendo cosas",
          cantidad_horas: "1.0",
          centro_de_costo_id: 123,
          facturable: false,
          tipo_de_hora: TIPO_DE_HORA_DEFAULT,
        },
      },
      {
        registro_de_hora: {
          id: 2,
          fecha: "2020-01-" + ultimoDiaCargado,
          notas: "Haciendo otras cosas",
          cantidad_horas: "3.0",
          centro_de_costo_id: 321,
          facturable: true,
          tipo_de_hora: TIPO_DE_HORA_DEFAULT,
        },
      },
    ];

    it("Muestra tantos dias como tiene el mes", () => {
      const { queryByTestId, container } = render(
        <HorasDelMes
          centrosDeCosto={[]}
          registrosDeHora={registrosDeCargaHoraFutura}
          fechaSeleccionada={fechaActual}
          fechaAVisualizar={fechaActual}
        />,
      );

      const diasDelMes = container.getElementsByClassName("indicador-fecha");
      expect(diasDelMes.length).toBe(fechaActual.daysInMonth);

      const componenteUltimoDiaCargado = queryByTestId("numeroDia-23");
      expect(componenteUltimoDiaCargado).toBeTruthy();
    });

    it("Se marca el dia actual como seleccionado por default", () => {
      const { queryByTestId } = render(
        <HorasDelMes
          centrosDeCosto={[]}
          registrosDeHora={registrosDeCargaHoraFutura}
          fechaSeleccionada={fechaActual}
          fechaAVisualizar={fechaActual}
        />,
      );

      const diaActual = queryByTestId("numeroDia-20");
      expect(diaActual.className).toContain("seleccionado");
      expect(diaActual.className).toContain("hoy");
    });

    describe("Con otro mes distinto al actual seleccionado", () => {
      const registrosDeHorasDelMesAnterior = [
        {
          registro_de_hora: {
            id: 1,
            fecha: "2019-12-03",
            notas: "Haciendo cosas",
            cantidad_horas: "1.0",
            centro_de_costo_id: 123,
            facturable: false,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
        {
          registro_de_hora: {
            id: 2,
            fecha: "2019-12-04",
            notas: "Haciendo otras cosas",
            cantidad_horas: "3.0",
            centro_de_costo_id: 321,
            facturable: true,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
      ];
      it("Se ven las horas cargadas y se pueden editar", function () {
        const { container, queryAllByTestId } = render(
          <HorasDelMes
            centrosDeCosto={[]}
            registrosDeHora={registrosDeHorasDelMesAnterior}
            fechaSeleccionada={fechaActual.minus({ months: 1 })}
            fechaAVisualizar={fechaActual.minus({ months: 1 })}
          />,
        );

        const dias = queryAllByTestId("registro-hora");
        expect(dias).toHaveLength(2);

        const botonesDeEdicion =
          container.getElementsByClassName("boton-de-edicion");
        expect(botonesDeEdicion).toHaveLength(2);
      });
    });
    describe("Con un una fecha dos meses atras al actual seleccionado", () => {
      const registrosDeHorasDelMesAnterior = [
        {
          registro_de_hora: {
            id: 1,
            fecha: "2019-11-03",
            notas: "Haciendo cosas",
            cantidad_horas: "1.0",
            centro_de_costo_id: 123,
            facturable: false,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
        {
          registro_de_hora: {
            id: 2,
            fecha: "2019-11-04",
            notas: "Haciendo otras cosas",
            cantidad_horas: "3.0",
            centro_de_costo_id: 321,
            facturable: true,
            tipo_de_hora: TIPO_DE_HORA_DEFAULT,
          },
        },
      ];
      it("Se ven las horas cargadas pero no se pueden editar", function () {
        const { container, queryAllByTestId } = render(
          <HorasDelMes
            centrosDeCosto={[]}
            registrosDeHora={registrosDeHorasDelMesAnterior}
            fechaSeleccionada={fechaActual.minus({ months: 2 })}
            fechaAVisualizar={fechaActual.minus({ months: 2 })}
          />,
        );

        const dias = queryAllByTestId("registro-hora");
        expect(dias).toHaveLength(2);

        const botonesDeEdicion =
          container.getElementsByClassName("boton-de-edicion");
        expect(botonesDeEdicion).toHaveLength(0);
      });
    });
  });
});
