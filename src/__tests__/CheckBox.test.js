import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/react";

import CheckBox from "../components/CheckBox";

it("ejecuta onChange cuando lo seleccionás", () => {
  const onChangeMock = jest.fn();

  const { getByRole } = render(
    <CheckBox checked={false} onChange={onChangeMock} />,
  );

  const check = getByRole("checkbox");

  fireEvent.click(check);

  expect(onChangeMock).toHaveBeenCalledTimes(1);
});
