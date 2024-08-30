import "../styles/Header.scss";

import HorasLogo from "../images/Logotipo.svg";

const Header = () => {
  return (
    <div className="header">
      <img className="logo" src={HorasLogo} alt="logotipo" />
    </div>
  );
};

export default Header;
