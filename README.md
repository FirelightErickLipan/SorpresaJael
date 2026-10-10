# Regalo para Jael 🐦‍⬛

Sitio estático (HTML + CSS + JS, sin instalar nada). Funciona en celular.

## Estructura

```
index.html          ← esqueleto (no hace falta tocarlo)
css/style.css       ← estilo gótico rojo oscuro/negro
js/content.js       ← AQUÍ editas textos, fotos, música y ajustes
js/main.js          ← lógica (pregunta, mapa, música, visor de fotos, ramo)
assets/img/         ← tus fotos
assets/audio/       ← tus canciones
```

## Flujo

1. **Portada «Para ti, Jael»** con el cuervo negro, Flutter y la pregunta (cada «No» pone más triste a Flutter; solo se entra con «Sí»).
2. **Mapa** con 4 señales rojas.
3. **Cosas que te gustan** → canción de Taehyung + dedicatoria + fotos.
4. **Lo que te hace ser tú** → gótico, rock/metal (Slipknot), Coraline (Halloween), K-pop/K-dramas (aquí suena la música de Ado, solo en este bloque) y Fluttershy.
5. **Nuestras partidas** → línea de tiempo (sin música).
6. **Lo que quería decirte** → ramo de claveles oscuros con copos de nieve (tócalo y caen copos), foto, carta y piano.

## Archivos que debes agregar (nombres EXACTOS, en minúscula)

**assets/img/**

| Archivo | Para qué |
|---|---|
| `fluttershy-feliz.png` | Flutter en la portada (PNG transparente / WebP / GIF) |
| `fluttershy-triste.png` | Flutter triste (opcional: si falta usa la feliz con filtro) |
| `taehyung-1.jpg` … `taehyung-4.jpg` | Cosas que te gustan (4 fotos) |
| `gotico-1.jpg`, `gotico-2.jpg` | Rojo y negro |
| `rock-1.jpg` | Foto de Slipknot |
| `coraline-1.jpg` | Una imagen de Coraline |
| `kpop-1.jpg` | K-pop / K-dramas |
| `pony-1.jpg` | My Little Pony / Fluttershy |
| `juego-01.jpg` | Cuando te hizo jugar como perro |
| `juego-02.jpg` | Parkour (una sola foto) |
| `juego-03.jpg` | Roblox con la hermana / mapaches (una sola foto) |
| `nosotros.jpg` | Foto de ustedes (página final) |

El juego de peleas no lleva foto.

**assets/audio/**: `taehyung.mp3`, `ado.mp3`, `piano.mp3`

> Si falta una foto, la página muestra un recuadro «Agrega aquí: archivo». Antes de enviarlo, **borra de `content.js` lo que no uses**.

## Cosas que puedes cambiar en `js/content.js`

- `forceYes: true/false` → solo se entra con «Sí», o aparece la salida «Necesito tiempo».
- `lockFinal` → la página final se abre al visitar las otras 3.
- `whatsapp: "59171234567"` → agrega un botón «Responderle cuando quieras» al final.
- `taehyung.track` → nombre que se muestra como «sonando» (igual a la canción que subas).
- La música de Ado se define dentro del bloque K-pop (`music: {...}`).

## Probarlo en tu PC

```bash
python3 -m http.server 8000     # y abre http://localhost:8000
```

## Publicarlo en Cloudflare Pages

1. Cloudflare → Workers & Pages → Create → Pages → **Upload assets**.
2. Sube la carpeta (o el .zip) con `index.html` **en la raíz**, no dentro de otra carpeta.
3. Tips: nombres en minúscula y sin espacios (Cloudflare distingue mayúsculas), fotos en `.jpg`/`.png`/`.webp` (no HEIC), cada archivo de menos de 25 MB (ideal fotos de 200–400 KB y canciones de menos de 5 MB). El sitio incluye `noindex` para que Google no lo muestre.
