## Carga de horas

Esta aplicación sirve para cargar las horas más facilmente al backoffice, 
se puede usar entrando a https://horas.10pines.com.

Es una app frontend que usa una API del Backoffice.

### Documentacion

[Diseños y assets](https://www.figma.com/file/wUmkOhQBonDtD3kkLub1Vc/App-Horas?type=design&node-id=152-2&mode=design&t=HW2s7nO2on1Pvsdi-0)

### Levantar ambiente local

1. Instalar Node (v18). Si usas NVM podes instalar la version correcta corriendo `nvm install`
2. Instalar dependencias con NPM: `npm install`
3. Correr los tests con `npm test`
4. Levantar la app con `npm start` (por defecto usa el backoffice de staging como backend)

#### Levantar backend (backoffice) local
Si querés la experiencia completa en local tenés que levantar el backoffice en el puerto `3333`.
Podés obtener más información al respecto 
[en el repo del Backoffice](https://github.com/10Pines/10pines-bk#como-lo-levanto).

Luego de eso, podes crear tu propio archivo de override llamado `.env.local` copiando el archivo de ejemplo 
[.env.local.sample](.env.local.sample). Este archivo de ejemplo ya contiene un override para usar una instancia local
del backoffice, pero ademas se puede usar para cualquier otro override que quieras tener en tu propio ambiente. Este
archivo `.env.local` va a ser solo tuyo, porque no se commitea.

Finalmente, corriendo `npm start` levanta esta aplicación.

#### Mockear el backend (backoffice)
No sirve de mucho, pero podrías indicarle a [App.js](src/App.js) en #backofficeApi()
que utilice [el mock en memoria del Backoffice](src/__test_helpers__/backofficeMockApi.js).

### Deploy

La aplicación se deploya a Netlify automáticamente cuando se pushean cambios al branch `master`.

El sitio es parte de la cuenta de Netlify de infraestructura@10pines.com (credenciales en Bitwarden)

#### Review apps

Netlify crea una review app (deploy preview) automaticamente cuando se crea un merge request contra `master`. 
Sin embargo, el backoffice en staging no tiene configurado CORS con el dominio de netlify, así que no se pueden utilizar
correctamente.

El link a la review app se puede encontrar en un comentario del merge request que Netlify va a crear automaticamente. 

#### CI

El build de CI corre automaticamente cuando se pushean cambios. Utiliza el CI de gitlab, valida los tests, corre linter 
y build.

#### Linter y Formatter

El proyecto usa `eslint` como linter y `prettier` como formatter. La primera vez que hagas `npm install` deberia
instalarse automaticamente `husky`. A traves de `husky` estamos corriendo un `pre-commit` hook para correr tanto el 
linter como el formatter sobre los archivos modificados, corrigiendo automaticamente lo que sea necesario.

Si queres correr manualmente estas herramientas en modo "chequeo" podes usar los comandos:
- `npm run format` para correr `prettier`
- `npm run lint` para correr `eslint`

Si queres correr el autofix por tu cuenta, podes usar estos comandos:
- `npm run format:fix` para autofixear el formateo con `prettier`
- `npm run lint:fix` para autofixear los problemas de linter con `eslint`