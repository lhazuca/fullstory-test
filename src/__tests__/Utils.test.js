import { describe, expect, it } from "@jest/globals";
import {
  TIPO_DE_HORA_DEFAULT,
  formatearFechaAString,
  tooltipTemplateButtonText,
  parsearFecha,
  esMesActual,
  esMesPosteriorA,
  sonDelMismoMes,
  sonMismoAñoMesYDia,
  finDeMesDe,
  nombreMes,
  esDiaDeHoy,
  obtenerRegistrosDeHoraAPrevisualizar,
  estaDentroDelRango,
} from "../utils";
import { DateTime, Settings } from "luxon";
import { every } from "lodash";

describe("Utils", () => {
  describe("teniendo un template", () => {
    const crearTemplate = (tipoDeHora, facturable, ceco, nota, cantidad) => {
      return {
        tipoDeHora: tipoDeHora || TIPO_DE_HORA_DEFAULT,
        facturable: facturable,
        centroDeCosto: ceco ? { nombre: ceco } : undefined,
        nota: nota,
        cantidad: cantidad,
      };
    };
    describe("que no tiene mas que los campos bases", () => {
      const templateBase = crearTemplate();
      it("su tooltip solamente deberia contener tipo de hora y descripcion", () => {
        const tooltip = tooltipTemplateButtonText(templateBase);
        expect(tooltip).toEqual("Tipo de hora: Desarrollo\nFacturable: No\n");
      });
    });

    describe("que contiene otros ademas de los campos base", () => {
      const templateSinTodosLosCampos = crearTemplate(
        "Consultoria",
        true,
        "10 pines > App carga horas",
      );
      it("el tooltip tiene los campos bases mas los extras", () => {
        const tooltip = tooltipTemplateButtonText(templateSinTodosLosCampos);
        expect(tooltip).toEqual(
          "Tipo de hora: Consultoria\nFacturable: Si\nCeco: App carga horas\n",
        );
      });
    });

    describe("que contiene todos los campos", () => {
      const templateConTodosLosCampos = crearTemplate(
        "Tareas Internas",
        false,
        "10 Pines > Ingles",
        "Clase",
        1,
      );

      it("el tooltip describira todos los campos del template", () => {
        const tooltip = tooltipTemplateButtonText(templateConTodosLosCampos);
        expect(tooltip).toEqual(
          "Tipo de hora: Tareas Internas\nCantidad: 1\nFacturable: No\nCeco: Ingles\nDescripcion: Clase\n",
        );
      });
    });
  });

  describe("teniendo una fecha", () => {
    describe("formateandola a string", () => {
      it("utc al formatearla a string sigue siendo el mismo dia", () => {
        const fecha = DateTime.fromISO("2020-04-13");
        const fechaComoString = formatearFechaAString(fecha);
        expect(fechaComoString).toEqual("2020-04-13");
      });

      it("utc al formatearla a string sigue siendo el mismo dia", () => {
        const fecha = DateTime.fromISO("2020-04-13T21:30:00.000Z").toUTC();
        const fechaComoString = formatearFechaAString(fecha);
        expect(fechaComoString).toEqual("2020-04-13");
      });

      it("argentina al formatearla a string (despues de las 21) sigue siendo el mismo dia", () => {
        const fecha = DateTime.fromISO("2020-04-13T21:30:00.000", {
          zone: "UTC-3",
        });
        const fechaComoString = formatearFechaAString(fecha);
        expect(fechaComoString).toEqual("2020-04-13");
      });

      it("argentina al formatearla a string (antes de las 21) sigue siendo el mismo dia", () => {
        const fecha = DateTime.fromISO("2020-04-13T20:30:00.000", {
          zone: "UTC-3",
        });
        const fechaComoString = formatearFechaAString(fecha);
        expect(fechaComoString).toEqual("2020-04-13");
      });
    });

    describe("comparaciones con la fecha de hoy", () => {
      const fechaActual = parsearFecha("2020-01-20");
      const settingsNow = Settings.now;

      beforeAll(() => {
        Settings.now = () => fechaActual.toMillis();
      });

      afterAll(() => {
        Settings.now = settingsNow;
      });

      it("una fecha dada es del mismo mes que la actual", () => {
        expect(esMesActual(parsearFecha("2020-01-01"))).toBeTruthy();
      });

      it("una fecha dada NO es del mismo mes que la actual", () => {
        expect(esMesActual(parsearFecha("2020-02-20"))).toBeFalsy();
      });

      it("una fecha dada es la actual", () => {
        expect(esDiaDeHoy(parsearFecha("2020-01-20"))).toBeTruthy();
      });

      it("una fecha dada NO es la actual", () => {
        expect(esDiaDeHoy(parsearFecha("2020-02-20"))).toBeFalsy();
      });
    });

    describe("comparaciones entre DateTimes", () => {
      it("julio es posterior a junio", () => {
        expect(
          esMesPosteriorA(
            parsearFecha("2020-07-01"),
            parsearFecha("2020-06-01"),
          ),
        ).toBeTruthy();
      });

      it("marzo no es posterior a mayo", () => {
        expect(
          esMesPosteriorA(
            parsearFecha("2020-03-01"),
            parsearFecha("2020-05-01"),
          ),
        ).toBeFalsy();
      });

      it("dos fechas son del mismo mes", () => {
        expect(
          sonDelMismoMes(
            parsearFecha("2020-11-01"),
            parsearFecha("2020-11-30"),
          ),
        ).toBeTruthy();
      });

      it("dos fechas NO son del mismo mes", () => {
        expect(
          sonDelMismoMes(
            parsearFecha("2020-01-01"),
            parsearFecha("2020-11-30"),
          ),
        ).toBeFalsy();
      });

      it("dos DateTimes son del mismo año, mes y dia", () => {
        expect(
          sonMismoAñoMesYDia(
            DateTime.local(2022, 1, 1, 20, 50),
            DateTime.local(2022, 1, 1, 0, 0),
          ),
        ).toBeTruthy();
      });

      it("dos DateTimes NO son del mismo año, mes y dia", () => {
        expect(
          sonMismoAñoMesYDia(
            DateTime.local(2022, 1, 11, 20, 50),
            DateTime.local(2022, 1, 11, 20, 50),
          ),
        ).toBeTruthy();
      });

      it("una fecha pasada esta en el rango de otra mas/menos una duracion", () => {
        expect(
          estaDentroDelRango(
            parsearFecha("2020-02-01"),
            parsearFecha("2020-03-15"),
            { months: 1 },
          ),
        ).toBeTruthy();
      });

      it("una fecha futura esta en el rango de otra mas/menos una duracion", () => {
        expect(
          estaDentroDelRango(
            parsearFecha("2020-04-30"),
            parsearFecha("2020-03-15"),
            { months: 1 },
          ),
        ).toBeTruthy();
      });

      it("una fecha esta NO en el rango de otra mas/menos una duracion", () => {
        expect(
          estaDentroDelRango(
            parsearFecha("2020-01-31"),
            parsearFecha("2020-03-15"),
            { months: 1 },
          ),
        ).toBeFalsy();
      });
    });

    describe("conversiones de fechas", () => {
      it("se obtiene el fin de mes de una fecha", () => {
        expect(finDeMesDe(parsearFecha("2022-01-01"))).toEqual(
          parsearFecha("2022-01-31"),
        );
      });

      it("se obtiene el nombre del mes de una fecha", () => {
        expect(nombreMes(parsearFecha("2022-01-01"))).toEqual("Enero");
      });
    });
  });

  describe("teniendo el registro de horas de un mes", () => {
    const registroDeHoras = [
      {
        registro_de_hora: {
          cantidad_horas: "3.0",
          centro_de_costo_id: 1,
          facturable: false,
          fecha: "2022-12-01",
          id: 26363,
          notas: "Codeando ando",
          tipo_de_hora: TIPO_DE_HORA_DEFAULT,
        },
      },
      {
        registro_de_hora: {
          cantidad_horas: "4.0",
          centro_de_costo_id: 1,
          facturable: false,
          fecha: "2022-12-02",
          id: 26364,
          notas: "Testeando ando",
          tipo_de_hora: TIPO_DE_HORA_DEFAULT,
        },
      },
    ];

    it("si no se quiere agregar ninguna hora nueva, visualizamos el mismo registro de horas", () => {
      const horaPanelDeCarga = {
        cantidad: "",
        centroDeCosto: undefined,
        facturable: false,
        fecha: DateTime.local(2020, 12, 3),
        nota: "",
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
      };
      const registrosDeHorasNuevos = [];

      const registrosDeHoraAPrevisualizar =
        obtenerRegistrosDeHoraAPrevisualizar(
          horaPanelDeCarga,
          registroDeHoras,
          registrosDeHorasNuevos,
        );

      expect(registrosDeHoraAPrevisualizar).toHaveLength(2);
      expect(
        every(
          registrosDeHoraAPrevisualizar,
          ({ vista_previa }) => vista_previa === undefined,
        ),
      ).toBeTruthy();
    });

    it("al querer cargar una hora nueva, se agrega una previsualizacion de la misma", () => {
      const horaPanelDeCarga = {
        cantidad: "3",
        centroDeCosto: undefined,
        facturable: false,
        fecha: DateTime.local(2020, 12, 3),
        nota: "",
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
      };
      const registrosDeHorasNuevos = [
        {
          registro_de_hora: {
            cantidad_horas: "3",
            centro_de_costo_id: undefined,
            facturable: false,
            fecha: "2022-12-02",
            notas: "",
            tipo_de_hora: undefined,
            vista_previa: true,
          },
        },
      ];

      const registrosDeHoraAPrevisualizar =
        obtenerRegistrosDeHoraAPrevisualizar(
          horaPanelDeCarga,
          registroDeHoras,
          registrosDeHorasNuevos,
        );

      expect(registrosDeHoraAPrevisualizar).toHaveLength(3);
      expect(
        registrosDeHoraAPrevisualizar[2].registro_de_hora.vista_previa,
      ).toBeTruthy();
    });

    it("al querer editar una hora existente, se reemplaza esa hora con una previsualizacion de la misma", () => {
      const horaPanelDeCarga = {
        id: 26363,
        cantidad: "5",
        centroDeCosto: { id: 1, nombre: "10Pines" },
        facturable: false,
        fecha: DateTime.local(2020, 12, 1),
        nota: "Codeando ando",
        tipoDeHora: TIPO_DE_HORA_DEFAULT,
      };

      const registrosDeHorasNuevos = [
        {
          registro_de_hora: {
            cantidad_horas: "5",
            centro_de_costo_id: undefined,
            facturable: false,
            fecha: "2022-12-01",
            notas: "Codeando ando",
            tipo_de_hora: undefined,
            vista_previa: true,
          },
        },
      ];

      const registrosDeHoraAPrevisualizar =
        obtenerRegistrosDeHoraAPrevisualizar(
          horaPanelDeCarga,
          registroDeHoras,
          registrosDeHorasNuevos,
        );

      const registroAEditar = registrosDeHoraAPrevisualizar[1];
      expect(registrosDeHoraAPrevisualizar).toHaveLength(2);
      expect(registroAEditar.registro_de_hora.vista_previa).toBeTruthy();
      expect(registroAEditar.registro_de_hora.cantidad_horas).toEqual("5");
    });
  });
});
