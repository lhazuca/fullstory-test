import "./styles/index.scss";
import ReactDOM from "react-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import Backoffice from "./backoffice_api/Backoffice";

async function main() {
  const oidcSettings = {
    authority: process.env.REACT_APP_IDP_ISSUER,
    client_id: process.env.REACT_APP_IDP_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_IDP_REDIRECT_URI,
    scope: "openid profile horas",
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  };

  if (process.env.NODE_ENV === "development") {
    // En prod esto se consigue por discovery automaticamente de la libreria
    // con un request PERO en local el backoffice se niega a responder por
    // CORS (solo *.10pines.com puede hacer requests al backoffice).
    // Entonces lo que hacemos es hardcodear el resultado con un par de
    // modificaciones:
    oidcSettings.metadata = {
      // el issuer viene en el id_token asi que lo seteamos bien.
      issuer: oidcSettings.authority,
      // esta url se usa por redireccion, asi que tiene que tener el host
      // correcto.
      authorization_endpoint: oidcSettings.authority + "/oauth/authorize",
      // el resto de las urls las accedemos a traves del proxy de
      // create-react-app asi que no tienen host
      token_endpoint: "/oauth/token",
      revocation_endpoint: "/oauth/revoke",
      introspection_endpoint: "/oauth/introspect",
      userinfo_endpoint: "/oauth/userinfo",
      jwks_uri: "/oauth/discovery/keys",
    };
  }

  const oidcClient = new UserManager(oidcSettings);

  let user = null;

  if (window.location.pathname === "/auth/callback") {
    try {
      user = await oidcClient.signinRedirectCallback(window.location);
    } catch (e) {
      console.error(e);
    } finally {
      window.history.replaceState({}, "", "/");
    }
  }
  if (!user) {
    user = await oidcClient.getUser();
  }
  if (user && user.expired) {
    user = await oidcClient.signinSilent();
  }

  const backofficeApi = new Backoffice(oidcClient, user);

  ReactDOM.render(
    <App backofficeApi={backofficeApi} />,
    document.getElementById("root"),
  );

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
}

main();
