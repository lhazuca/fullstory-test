import classNames from "classnames/bind";

const TipoDeHora = (props) => (
  <label className="inputConLabel">
    Tipo de hora
    <select
      onChange={props.onChange}
      value={props.tipoDeHoraSeleccionada}
      className={classNames("tipo-hora", props.className)}
      name="tipoDeHora"
    >
      {props.tiposDeHora.map((tipoDeHora) => {
        return (
          <option key={tipoDeHora} value={tipoDeHora}>
            {tipoDeHora}
          </option>
        );
      })}
    </select>
  </label>
);

export default TipoDeHora;
