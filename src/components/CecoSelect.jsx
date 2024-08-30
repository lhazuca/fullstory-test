import "../styles/App.scss";

import { useMemo } from "react";
import Select, { createFilter } from "react-select";

const getTheme = () => (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "#6D6058",
  },
});

const stylesDeGuardadoDeTemplate = {
  control: (base) => ({
    ...base,
    background: "#DCF4D4",
  }),
};

const cecoComoOpcion = ({ id, nombre }) => ({
  value: id,
  label: nombre,
});

const opcionComoCeco = ({ value, label }) => ({
  id: value,
  nombre: label,
});

const CecoSelect = ({
  value,
  cecos,
  onChange,
  seEstaGuardandoParaTemplate,
  selectRef,
}) => {
  const opcionesDeCecos = useMemo(() => cecos.map(cecoComoOpcion), [cecos]);

  return (
    <div className="ceco" data-testid="select-ceco">
      <label htmlFor="select-ceco">Centro de costo</label>
      <Select
        inputId="select-ceco"
        value={value && cecoComoOpcion(value)}
        placeholder="🔍 Buscar un centro de costo"
        theme={getTheme()}
        ref={selectRef}
        required={true}
        filterOption={createFilter({ ignoreAccents: false })}
        components={{
          MenuList,
        }}
        classNamePrefix="ceco"
        styles={seEstaGuardandoParaTemplate ? stylesDeGuardadoDeTemplate : {}}
        options={opcionesDeCecos}
        onChange={(opcion) => opcion && onChange(opcionComoCeco(opcion))}
      />
    </div>
  );
};

const MenuList = function MenuList(props) {
  const children = props.children;
  if (!children.length) {
    return <div>{children}</div>;
  }

  return (
    <div className="selectCecoContainer">
      {children.length &&
        children.slice(0, 15).map((key, i) => {
          return <div key={i}>{key}</div>;
        })}
    </div>
  );
};

export default CecoSelect;
