import "../styles/PanelTemplate.scss";
import "../styles/PanelContainer.scss";

import {
  faCheck,
  faPen,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { tooltipTemplateButtonText } from "../utils";
import { useHotkeys } from "react-hotkeys-hook";

const TemplateButton = ({
  mostrarControlPorTeclado,
  seEstaEditandoTemplates,
  buttonTooltipText,
  onBorrarTemplate,
  onSelectTemplate,
  template,
  index,
}) => {
  useHotkeys(
    `alt+${index}`,
    (e) => {
      onSelectTemplate(template);
      e.preventDefault();
    },
    { enableOnTags: ["TEXTAREA", "INPUT"] },
  );

  if (seEstaEditandoTemplates) {
    return (
      <button
        key={index}
        title={buttonTooltipText}
        className="templateSelectButton no-select"
      >
        {template.nombre}
        <FontAwesomeIcon
          key={index}
          icon={faTrash}
          className="templateSelectButtonCross"
          onClick={(e) => onBorrarTemplate(e, template)}
        />
      </button>
    );
  } else {
    return (
      <button
        key={index}
        title={buttonTooltipText}
        className="templateSelectButton"
        onClick={() => onSelectTemplate(template)}
      >
        {template.nombre}
        {mostrarControlPorTeclado && index < 10 && (
          <span className="keyboard-control">{index}</span>
        )}
      </button>
    );
  }
};

export default class PanelTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seEstaEditandoTemplates: false,
      mostrarControlesPorTeclado: false,
    };

    window.addEventListener("keydown", (event) => {
      if (event.key === "Alt") {
        this.setState({ mostrarControlesPorTeclado: true });
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "Alt") {
        this.setState({ mostrarControlesPorTeclado: false });
      }
    });
  }

  comenzarAEditarTemplates = () => {
    this.setState({ seEstaEditandoTemplates: true });
  };

  terminarDeEditarTemplates = () => {
    this.setState({ seEstaEditandoTemplates: false });
  };

  handleClickEnBorrarTemplate = (e, template) => {
    this.props.borrarTemplate(template);
    e.stopPropagation();
    if (this.props.templates.length === 0)
      this.setState({ seEstaEditandoTemplates: false });
  };

  renderIconoDeEdicion = () => {
    if (this.props.templates.length === 0) return;
    if (!this.state.seEstaEditandoTemplates) {
      return (
        <button
          onClick={this.comenzarAEditarTemplates}
          className="nameTemplateButton"
        >
          <FontAwesomeIcon icon={faPen} />
          <span>Editar</span>
        </button>
      );
    } else {
      return (
        <button
          onClick={this.terminarDeEditarTemplates}
          className="nameTemplateButton"
        >
          <FontAwesomeIcon icon={faCheck} />
          <span>Listo</span>
        </button>
      );
    }
  };

  exportarTemplates = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(this.props.templates),
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "templates.json";

    link.click();
  };

  handleUploadChange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      this.props.importarTemplates(e.target.result);
    };
  };

  handleTemplateButtonClick = (template) => {
    this.props.onTemplateSelected(template);
  };

  render() {
    const templates = this.props.templates;

    return (
      <div className="templatePannel">
        <div className="titleContainer">
          <span>Templates</span>
        </div>
        <div className="templatesContainer">
          {this.props.templates.length <= 0 && (
            <span>Aqui van a aparecer los templates que crees.</span>
          )}
          <TransitionGroup>
            {templates.map((template, index) => (
              <CSSTransition
                key={index}
                classNames="templateButton"
                timeout={{ enter: 500 }}
              >
                <TemplateButton
                  seEstaEditandoTemplates={this.state.seEstaEditandoTemplates}
                  buttonTooltipText={tooltipTemplateButtonText(template)}
                  onBorrarTemplate={this.handleClickEnBorrarTemplate}
                  onSelectTemplate={this.handleTemplateButtonClick}
                  template={template}
                  index={index + 1}
                  mostrarControlPorTeclado={
                    this.state.mostrarControlesPorTeclado
                  }
                />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
        <div className="botonesContainer">
          <div className="botonDeEdicionContainer">
            {this.renderIconoDeEdicion()}
          </div>
          <div className="botonDeEdicionContainer">
            <button
              onClick={this.exportarTemplates}
              className="nameTemplateButton"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Exportar</span>
            </button>
          </div>
          <div className="botonDeEdicionContainer">
            <label className="nameTemplateButton">
              <input
                type="file"
                data-testid="importar-templates"
                onChange={this.handleUploadChange}
              />
              <FontAwesomeIcon icon={faUpload} />
              <span>Importar</span>
            </label>
          </div>
        </div>
      </div>
    );
  }
}
