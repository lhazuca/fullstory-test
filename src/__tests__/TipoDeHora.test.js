import { render } from "@testing-library/react";

import TipoDeHora from "../components/TipoDeHora";
import { TIPO_DE_HORA_DEFAULT } from "../utils";

it("no muestra ninguna opción cuando no recibe tipos de hora", () => {
  const { getByRole } = render(<TipoDeHora tiposDeHora={[]} />);

  const tiposDeHora = getByRole("combobox");

  expect(tiposDeHora).toBeEmptyDOMElement();
});

it("muestra tantas opciones como tipos de hora recibe", () => {
  const tiposDeHoraDados = [TIPO_DE_HORA_DEFAULT, "Internas"];
  const { getByRole } = render(<TipoDeHora tiposDeHora={tiposDeHoraDados} />);

  const tiposDeHora = getByRole("combobox");

  expect(tiposDeHora).toHaveLength(tiposDeHoraDados.length);
  expect(tiposDeHora).toHaveTextContent(tiposDeHoraDados.join(""));
});
