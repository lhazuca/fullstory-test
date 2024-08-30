import EditIcon from "@material-ui/icons/Edit";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import classNames from "classnames";

import { EditingContext } from "../App";
import { humanizarTipoDeHora, parsearFecha } from "../utils";

const BotonDeEdicion = ({
  seEstaEditandoEstaHora,
  modoEdicionEstaAcivado,
  onClickEditar,
}) => {
  return !seEstaEditandoEstaHora ? (
    <button
      onClick={!modoEdicionEstaAcivado ? onClickEditar : null}
      className={classNames("boton-de-edicion", {
        "boton-de-edicion-desactivado": modoEdicionEstaAcivado,
      })}
    >
      <EditIcon />
      Editar
    </button>
  ) : (
    <button className="boton-de-edicion">*Editando*</button>
  );
};
const BotonDeCopia = ({
  seEstaEditandoEstaHora,
  modoEdicionEstaAcivado,
  onClickCopiar,
}) => {
  return !seEstaEditandoEstaHora ? (
    <button
      onClick={!modoEdicionEstaAcivado ? onClickCopiar : null}
      className={classNames("boton-de-copiar", {
        "boton-de-copiar-desactivado": modoEdicionEstaAcivado,
      })}
    >
      <FileCopyIcon />
      Copiar
    </button>
  ) : (
    <></>
  );
};

const RegistroDeHora = ({
  registroDeHora,
  centroDeCosto,
  isPlaceholder,
  editable,
  fechaSeleccionada,
}) => {
  const seEstaEditandoEstaHora = (idQueSeEstaEditando) =>
    idQueSeEstaEditando === registroDeHora.id;

  const estaSeleccionadaLaFechaDelRegistro = () => {
    return fechaSeleccionada.hasSame(
      parsearFecha(registroDeHora.fecha),
      "days",
    );
  };

  const claseDelRegistro = registroDeHora.facturable
    ? "registro-facturable"
    : "registro-no-facturable";

  return (
    <EditingContext.Consumer>
      {({ estaEditando, setEditando, horaAEditar, copiarHora }) => (
        <div
          className={classNames(claseDelRegistro, {
            "registro-movido":
              seEstaEditandoEstaHora(horaAEditar?.id) &&
              !isPlaceholder &&
              !estaSeleccionadaLaFechaDelRegistro(),
            "registro-placeholder":
              isPlaceholder || seEstaEditandoEstaHora(horaAEditar?.id),
            "registro-en-segundo-plano":
              estaEditando && !seEstaEditandoEstaHora(horaAEditar?.id),
          })}
          data-testid="registro-hora"
        >
          <div className="columnaDeRegistro">
            <span className="horas">{registroDeHora.cantidad_horas} hs </span>
            {registroDeHora.facturable && <span>Facturable</span>}
          </div>
          <div className="columnaDeRegistro">
            <span className="nota">{registroDeHora.notas}</span>
            <span className="centroDeCosto">{centroDeCosto}</span>
          </div>
          <div className="columnaDeRegistro">
            {editable && (
              <BotonDeEdicion
                seEstaEditandoEstaHora={seEstaEditandoEstaHora(horaAEditar?.id)}
                modoEdicionEstaAcivado={estaEditando}
                onClickEditar={() => setEditando(true, registroDeHora)}
              />
            )}
            <BotonDeCopia
              seEstaEditandoEstaHora={seEstaEditandoEstaHora(horaAEditar?.id)}
              modoEdicionEstaAcivado={estaEditando}
              onClickCopiar={() => copiarHora(registroDeHora)}
            />
            <span className="tipoDeHora">
              {humanizarTipoDeHora(registroDeHora.tipo_de_hora)}
            </span>
          </div>
        </div>
      )}
    </EditingContext.Consumer>
  );
};

export default RegistroDeHora;
