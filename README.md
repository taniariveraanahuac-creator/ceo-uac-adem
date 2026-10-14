# CEO León · Anáhuac Cancún

Simulador de negocios en vivo por equipos (Taller León, Escuela Internacional de Negocios, Universidad Anáhuac Cancún).

Los participantes **no necesitan cuenta, correo ni aplicación**: abren una liga (o escanean el QR del proyector) y juegan desde el navegador del celular.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | El juego completo (pantallas, casos, reglas, sonidos). |
| `red.js` | La conexión en vivo entre la computadora del creador y los celulares. |
| `firebase-config.js` | Los datos de tu proyecto de Firebase (la base de datos en la nube donde viven las partidas). |
| `database.rules.json` | Reglas de seguridad para pegar en Firebase. |
| `.nojekyll` | Le indica a GitHub Pages que publique los archivos tal cual. |
| `README.md` | Estas instrucciones. |

## Paso 1 · Crear la base de datos gratuita (una sola vez, ~10 min)

El juego guarda cada partida en **Firebase Realtime Database** (plan gratuito *Spark*, sin tarjeta). Así cualquier celular, en cualquier red, encuentra la partida por su código.

1. Entra a <https://console.firebase.google.com> con una cuenta de Google y pulsa **Crear un proyecto** (por ejemplo `ceo-leon`). Puedes desactivar Google Analytics.
2. En el menú izquierdo: **Compilación → Realtime Database → Crear base de datos**. Elige la ubicación **Estados Unidos (us-central1)** y **Comenzar en modo bloqueado**.
3. En la pestaña **Reglas**, borra todo, pega el contenido de `database.rules.json` y pulsa **Publicar**.
4. Ve a **⚙ Configuración del proyecto → General → Tus apps** y pulsa el ícono **`</>`** (App web). Ponle un nombre y pulsa **Registrar app** (no hace falta Firebase Hosting).
5. Firebase muestra un bloque `firebaseConfig`. Copia sus valores en `firebase-config.js` (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`).
   - Si `databaseURL` no aparece, cópialo de la parte superior de la pantalla de Realtime Database (termina en `firebaseio.com` o `firebasedatabase.app`).

> Estos datos no son secretos: Firebase está diseñado para que vayan en la página. La protección la dan las reglas del paso 3.

## Paso 2 · Publicar en GitHub Pages

1. En el repositorio: **Add file → Upload files**. Arrastra `index.html`, `red.js`, `firebase-config.js`, `database.rules.json` y `README.md`, y pulsa **Commit changes**.
2. **Settings → Pages** → *Deploy from a branch*, rama **main**, carpeta **/ (root)** → **Save**.
3. Espera 1–2 minutos y abre la liga con **Ctrl+F5** (o en ventana de incógnito) para evitar la versión vieja en caché.

## Ligas para el día del taller

- **Creador (proyector):** `https://taniariveraanahuac-creator.github.io/ceo-uac-adem/#creador`
- **Participantes (celulares):** `https://taniariveraanahuac-creator.github.io/ceo-uac-adem/#equipo`

El código QR que aparece en el proyector ya incluye el código de la partida, así que al escanearlo cada celular entra directo.

## Cómo funciona la conexión

- La partida (estado del juego) y los votos de cada celular se guardan en Firebase y se sincronizan al instante con todos los dispositivos.
- Funciona con wifi institucional, datos móviles o cualquier mezcla: ya no hace falta una conexión directa computadora↔celular.
- Si la pestaña del creador se cierra o recarga, abre `#creador` y usa **Reanudar** con el código: la partida sigue en la nube.
- Si un celular pierde señal, se reconecta solo y recupera su equipo.
- Si `firebase-config.js` se deja vacío, el juego vuelve al modo anterior (conexión directa con PeerJS), que muchas redes bloquean.
