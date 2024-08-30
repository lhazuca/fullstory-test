import classNames from "classnames/bind";

const CheckBox = (props) => (
  <div className="inputConLabel facturable">
    <label htmlFor="facturable">Facturable</label>
    <div className={classNames("contenedorCheckbox", props.className)}>
      <input
        id="facturable"
        type="checkbox"
        name="facturable"
        checked={props.checked}
        onChange={props.onChange}
      />
    </div>
  </div>
);

export default CheckBox;
