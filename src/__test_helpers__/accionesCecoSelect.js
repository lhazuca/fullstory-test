import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";

export async function elegirCeco(nombreCeco, selectorCecos) {
  await act(async () => {
    abrirSelectorCecos(selectorCecos);
  });

  const opcion = Array.from(
    selectorCecos.querySelectorAll(".ceco__option"),
  ).find((cecoOpcion) => cecoOpcion.textContent === nombreCeco);

  fireEvent.click(opcion);

  if (
    selectorCecos.querySelector(".ceco__single-value").textContent !==
    nombreCeco
  ) {
    throw new Error(
      `No se pudo seleccionar el centro de costo "${nombreCeco}"`,
    );
  }
}

export function abrirSelectorCecos(selectorCecos) {
  const input = selectorCecos.querySelector("input");

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: "ArrowDown", keyCode: 39, code: 40 });
}
