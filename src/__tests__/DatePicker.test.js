import DatePicker, { trasladarFecha } from "../components/DatePicker";
import { DateTime, Settings } from "luxon";
import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";

describe("DatePicker", () => {
  describe("trasladarFecha", () => {
    it("trasladar una fecha intermedia del mes hacia adelante avanza esa cantidad de dias dento del mes", () => {
      const unDiaEnMedioDeDiciembre = DateTime.local(2020, 12, 15);
      const diaSiguienteAUnDiaEnMedioDeDiciembre = unDiaEnMedioDeDiciembre.plus(
        {
          day: 1,
        },
      );

      expect(trasladarFecha(unDiaEnMedioDeDiciembre, 1, 31)).toEqual(
        diaSiguienteAUnDiaEnMedioDeDiciembre,
      );
    });

    it("al estar en el ultimo dia del mes y se avanza un dia se vuelve al primero del mismo mes", () => {
      const ultimoDiaDeDiciembre = DateTime.local(2020, 12, 31);
      const primerDiaDeDiciembre = DateTime.local(2020, 12, 1);

      expect(trasladarFecha(ultimoDiaDeDiciembre, 1, 31)).toEqual(
        primerDiaDeDiciembre,
      );
    });

    it("al estar en el primer dia del mes y se retrasa un dia se va al ultimo del mismo mes", () => {
      const ultimoDiaDeDiciembre = DateTime.local(2020, 12, 31);
      const primerDiaDeDiciembre = DateTime.local(2020, 12, 1);
      expect(trasladarFecha(primerDiaDeDiciembre, -1, 31)).toEqual(
        ultimoDiaDeDiciembre,
      );
    });
  });

  describe("SelectorFecha", () => {
    const spy = jest.fn();

    const expectedNow = DateTime.local(2022, 11, 23, 23, 0, 0);
    Settings.now = () => expectedNow.toMillis();

    const fechaInicial = DateTime.local(2022, 11, 1);
    let { queryAllByTestId } = {};

    beforeEach(() => {
      ({ queryAllByTestId } = render(
        <DatePicker
          onChange={spy}
          fecha={fechaInicial}
          fieldRef={createRef()}
          showControls={true}
        />,
      ));
    });

    it("permite inputtear una fecha futura del mismo mes", () => {
      const input = queryAllByTestId("panelCargaFecha-input")[0];
      fireEvent.change(input, { target: { value: "2022-11-30" } });

      expect(spy).toHaveBeenCalled();
    });

    it("permite inputtear una fecha futura si es de un mes siguiente al actual", () => {
      const input = queryAllByTestId("panelCargaFecha-input")[0];
      fireEvent.change(input, { target: { value: "2022-12-24" } });

      expect(spy).toHaveBeenCalled();
    });

    it("no permite inputtear una fecha futura si es de dos meses siguiente al actual", () => {
      const input = queryAllByTestId("panelCargaFecha-input")[0];
      fireEvent.change(input, { target: { value: "2023-01-24" } });

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
