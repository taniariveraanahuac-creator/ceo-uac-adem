# CEO León · Anáhuac Cancún

Simulador de negocios en vivo por equipos (Taller León, Escuela Internacional de Negocios, Universidad Anáhuac Cancún).

Los participantes **no necesitan cuenta, correo ni aplicación**: abren una liga (o escanean el QR del proyector) y juegan desde el navegador del celular.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | El juego completo (pantallas, casos, reglas, sonidos). |
| `red.js` | La conexión en vivo entre la computadora del creador y los celulares. |
| `.nojekyll` | Le indica a GitHub Pages que publique los archivos tal cual. |
| `README.md` | Estas instrucciones. |

## Publicarlo en GitHub Pages (una sola vez)

1. Entra a [github.com](https://github.com) con tu cuenta y crea un repositorio nuevo **público**, por ejemplo `ceo-leon`.
2. En el repositorio: **Add file → Upload files**. Arrastra los 4 archivos (`index.html`, `red.js`, `.nojekyll`, `README.md`) y pulsa **Commit changes**.
   - Si tu computadora oculta `.nojekyll`, no pasa nada: el juego funciona igual sin él.
3. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y pulsa **Save**.
4. Espera 1–2 minutos. Tu liga será:
   `https://TU-USUARIO.github.io/ceo-leon/`

## Ligas para el día del taller

- **Creador (proyector):** `https://TU-USUARIO.github.io/ceo-leon/#creador`
- **Participantes (celulares):** `https://TU-USUARIO.github.io/ceo-leon/#equipo`

El código QR que aparece en el proyector ya incluye el código de la partida, así que al escanearlo cada celular entra directo.

## Cómo funciona la conexión

- La computadora del creador funciona como "servidor": guarda la partida y la reparte a los celulares mediante WebRTC (biblioteca gratuita PeerJS). No hay base de datos ni registro.
- **No cierres ni recargues la pestaña del creador** durante el juego. Si se cierra, vuelve a abrir `#creador` en la misma computadora y usa **Reanudar** con el código: la partida se guardó en ese navegador.
- Si un celular pierde la conexión, se reconecta solo en unos segundos.

## Recomendaciones de red

- Lo ideal es que la computadora y los celulares estén en **la misma red wifi**.
- Algunas redes institucionales bloquean conexiones directas entre dispositivos. **Haz una prueba días antes** con 2 o 3 celulares en el salón. Si un celular no logra entrar, prueba con datos móviles o con un hotspot del celular del coordinador.
- Si nadie tiene celular, usa el botón **"Jugar en un solo dispositivo"**: el coordinador registra las decisiones de cada equipo desde la computadora.
