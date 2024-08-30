import { TIPO_DE_HORA_DEFAULT } from "../utils";
import MetricasDistribucion from "../components/MetricasDistribucion";

const centroDeCostoLicencia = {
  id: 1,
  nombre: "10Pines > Licencias personales",
};

const centroDeCostoNoLicencia = { id: 2, nombre: "10Pines > No licencia" };

const centroDeCostoDeProyecto = { id: 3, nombre: "10Pines > Proyectos > Pala" };

function crearHora(
  id,
  centroDeCosto = centroDeCostoNoLicencia,
  facturable = false,
) {
  return {
    registro_de_hora: {
      id: id,
      fecha: "2020-01-03",
      notas: "Haciendo cosas",
      cantidad_horas: "1.0",
      centro_de_costo_id: centroDeCosto.id,
      facturable: facturable,
      tipo_de_hora: TIPO_DE_HORA_DEFAULT,
    },
  };
}

describe("MetricasDistribucion", function () {
  it("devuelve el total de horas sin contar las licencias", function () {
    const centrosDeCosto = [centroDeCostoLicencia, centroDeCostoNoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoNoLicencia),
      crearHora(4, centroDeCostoNoLicencia),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(metricasDistribucion.totalHorasSinLicencias(centrosDeCosto)).toBe(3);
  });

  it("devuelve el total de horas facturables", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(metricasDistribucion.totalHorasFacturables(centrosDeCosto)).toBe(2);
  });

  it("devuelve el total de horas no facturables que no son licencias", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(
      metricasDistribucion.totalHorasNoFacturablesSinLicencias(centrosDeCosto),
    ).toBe(1);
  });

  it("devuelve el porcentaje de horas no facturables que no son licencias", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(
      metricasDistribucion.porcentajeHorasSinLicenciasNoFacturables(),
    ).toBe("33.3");
  });

  it("devuelve el porcentaje de horas que no son licencias facturables", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(metricasDistribucion.porcentajeHorasSinLicenciasFacturables()).toBe(
      "66.7",
    );
  });

  it("devuelve el porcentaje de horas facturables", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(metricasDistribucion.porcentajeHorasFacturables()).toBe("50.0");
  });

  it("devuelve el porcentaje de horas no facturables", function () {
    const centroDeCostoLicencia = {
      id: 1,
      nombre: "10Pines > Licencias personales",
    };
    const centrosDeCosto = [centroDeCostoLicencia];
    const registrosDeHora = [
      crearHora(1, centroDeCostoLicencia),
      crearHora(2, centroDeCostoNoLicencia),
      crearHora(3, centroDeCostoDeProyecto, true),
      crearHora(4, centroDeCostoDeProyecto, true),
    ];

    const metricasDistribucion = new MetricasDistribucion({
      registrosDeHora: registrosDeHora,
      centrosDeCosto: centrosDeCosto,
    });

    expect(metricasDistribucion.porcentajeHorasFacturables()).toBe("50.0");
  });
});
