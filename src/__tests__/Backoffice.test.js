import { describe, expect, it } from "@jest/globals";

import { backofficeUrl } from "../backoffice_api/Backoffice";

describe("Backoffice", () => {
  describe("backofficeUrl", () => {
    const subpath = "subpath";
    const OLD_ENV = process.env.REACT_APP_BACKOFFICE_URL;

    beforeEach(() => {
      process.env.REACT_APP_BACKOFFICE_URL = "https://backoffice.10pines.com/";
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it(`forma la URL del backoffice de forma correcta`, () => {
      expect(backofficeUrl(subpath)).toBe(
        `https://backoffice.10pines.com/api/${subpath}`,
      );
    });

    it(`elimina las barras adicionales del subpath`, () => {
      expect(backofficeUrl(`/${subpath}`)).toBe(
        `https://backoffice.10pines.com/api/${subpath}`,
      );
    });

    it(`elimina las barras adicionales de la URL base`, () => {
      process.env.REACT_APP_BACKOFFICE_URL = "https://backoffice.10pines.com//";
      expect(backofficeUrl(subpath)).toBe(
        `https://backoffice.10pines.com/api/${subpath}`,
      );
    });
  });
});
