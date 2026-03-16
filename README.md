# Neumonía Adquirida en la Comunidad (NAC)

Aplicación docente estática, independiente y offline para presentar una sesión sobre NAC en adultos.

No depende de frameworks, librerías externas, CDN ni del motor GUIYO.

## Qué es este proyecto

La app está pensada para funcionar como visor docente lineal:

- portada inicial
- una diapositiva visible cada vez
- navegación anterior/siguiente
- paneles laterales superpuestos
- bibliografía local en PDF
- funcionamiento offline con `manifest` y `service worker`
- modo de lectura móvil al pulsar `FS`

El proyecto está hecho en HTML, CSS y JavaScript vanilla.

## Flujo de uso

1. Se abre la portada.
2. Al pulsar `Entrar` se muestra la primera diapositiva disponible.
3. Las diapositivas se cargan automáticamente desde `assets/imagen/nac/` y `assets/texto/nac/`.
4. Los paneles `Dx`, `Tx`, `Escalas` y `Sesión` se abren por encima de la presentación sin cambiar la diapositiva actual.
5. En escritorio el resumen de la diapositiva aparece en una columna lateral.
6. En móvil el resumen se abre como ventana superpuesta.
7. En móvil, al pulsar `FS`, la app entra en modo lectura limpio y permite avanzar por `swipe` izquierda/derecha.

## Estructura del proyecto

```text
.
├── README.md
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── service-worker.js
├── data
│   └── content.js
├── assets
│   ├── portada
│   │   ├── .gitkeep
│   │   └── cover.png
│   ├── imagen
│   │   └── nac
│   │       ├── 001.png
│   │       ├── 002.png
│   │       └── ...
│   ├── texto
│   │   └── nac
│   │       ├── 001.txt
│   │       ├── 002.txt
│   │       └── ...
│   └── ui
│       ├── apple-touch-icon.png
│       ├── cover-placeholder.svg
│       ├── icon.svg
│       └── slide-placeholder.svg
└── docs
    └── *.pdf
```

## Qué hace cada archivo principal

- `index.html`: shell base de la app, portada, visor, paneles y modales.
- `styles.css`: identidad visual, responsive, modo escritorio, modo móvil y lectura fullscreen.
- `app.js`: lógica completa de navegación, carga de diapositivas, paneles, escalas, fullscreen, `swipe` y PWA.
- `data/content.js`: configuración docente de la sesión, títulos fijos, paneles, bibliografía y escalas.
- `manifest.webmanifest`: configuración PWA.
- `service-worker.js`: cache de shell y assets base.

## Archivos que puedes cambiar sin tocar la lógica

- `assets/portada/cover.png`: portada principal.
- `assets/imagen/nac/NNN.png`: imágenes de diapositivas.
- `assets/texto/nac/NNN.txt`: resumen de cada diapositiva.
- `docs/*.pdf`: bibliografía enlazada.

## Convención de diapositivas

La app busca diapositivas numeradas en este formato:

- `assets/imagen/nac/001.png`
- `assets/imagen/nac/002.png`
- `assets/imagen/nac/003.png`
- ...

Texto opcional asociado:

- `assets/texto/nac/001.txt`
- `assets/texto/nac/002.txt`
- `assets/texto/nac/003.txt`
- ...

Reglas:

- si existe `NNN.png`, la diapositiva se muestra
- si falta `NNN.txt`, la diapositiva sigue funcionando sin resumen
- si existe `NNN.txt` pero falta `NNN.png`, la diapositiva sigue en la secuencia y se mostrará como no disponible; no es el comportamiento recomendado
- la detección automática de diapositivas está controlada por `slideScan` en `data/content.js`

## Cómo debe ir el `.txt`

El `.txt` se usa como resumen de la diapositiva.

Formato recomendado:

```text
Resumen breve de la diapositiva.

Segundo párrafo opcional.

Tercer párrafo opcional.
```

Importante:

- los títulos de las diapositivas están fijados en `data/content.js`
- el archivo `.txt` se usa solo como resumen y apoyo al estudio; no sustituye el título visible
- lo más limpio es usar el archivo solo para el resumen

## Títulos fijos actuales de la sesión

Los títulos visibles de la presentación salen de `sessionOutline` en `data/content.js`:

1. NAC
2. Concepto y Epidemiología
3. Patogenia
4. Etiología Microbiológica
5. Orientación Etiológica
6. Dx Clínico y Rx
7. Pruebas complementarias
8. Estratificación de riesgo
9. Escala PES
10. Tratamiento Ambulatorio
11. Tratamiento UHD
12. Tratamiento Hospitalario
13. Duración del TTO
14. Prevención
15. Bibliografía
16. Cierre

## Cómo funciona el visor

- una sola diapositiva visible cada vez
- `Anterior` y `Siguiente` cambian solo la diapositiva
- el contador superior muestra la posición actual
- el panel `Sesión` permite saltar a una diapositiva concreta
- abrir `Dx`, `Tx`, `Escalas` o `Sesión` no cambia la diapositiva actual

## Cómo funciona el resumen

En escritorio:

- aparece junto a la diapositiva en una columna lateral
- tiene su propio scroll interno

En móvil:

- no roba espacio fijo al visor
- se abre con el botón `Resumen`
- aparece como ventana superpuesta

## Modo móvil y pantalla completa

La app tiene un modo de lectura móvil específico.

Al pulsar `FS` en móvil:

- se ocultan header, footer, firma y elementos no esenciales
- la diapositiva usa todo el alto visible real del dispositivo
- se respetan `safe-area-inset-top`, `bottom`, `left` y `right`
- se elimina el scroll fantasma del layout
- la navegación principal pasa a `swipe` izquierda/derecha

Notas prácticas:

- el comportamiento mejora mucho en iPhone y iPad modernos
- si la app se abre como PWA/standalone, el resultado es más cercano a una app nativa
- si se abre en navegador normal, la app limpia su propio layout, pero el chrome del navegador sigue dependiendo de iOS o Android

## Paneles laterales

Paneles disponibles:

- `Dx`
- `Tx`
- `Escalas`
- `Sesión`

Todos se comportan igual:

- se abren superpuestos
- no cambian la diapositiva
- se cierran con `X`
- se cierran con clic fuera
- se cierran con `ESC`

## Escalas incluidas

En el panel `Escalas` hay calculadoras/interpretadores funcionales para:

- `CRB-65`
- `CURB-65`
- `PSI`
- `ATS/IDSA`
- `PCR rápida`

No solo calculan:

- interpretan
- explican el significado
- sugieren un siguiente paso práctico

## Bibliografía local

Los enlaces visibles en la app apuntan a los PDF de `docs/`.

Reglas:

- si renombras un PDF, también tienes que actualizar su referencia en `data/content.js`
- los nombres deben coincidir exactamente
- la app abre los PDFs locales en una pestaña nueva

## Funcionamiento offline

La app incluye:

- `manifest.webmanifest`
- `service-worker.js`
- iconos locales
- cache del shell

Qué se cachea:

- `index.html`
- `styles.css`
- `app.js`
- `data/content.js`
- `manifest.webmanifest`
- iconos y placeholders base

## Cómo abrir la app en local

La forma recomendada es usar un servidor local simple:

```bash
cd /Users/olsanju/Desktop/neomonia
python3 -m http.server 4173
```

Después abre:

```text
http://127.0.0.1:4173
```

Nota:

- la carpeta local real del proyecto en esta máquina es `neomonia`
- el nombre del repositorio publicado es `Neumonia`

No es recomendable usar `file://` para pruebas reales de:

- `service worker`
- `manifest`
- comportamiento offline
- carga robusta de `.txt`

## Cómo publicarla en GitHub Pages

1. Sube el repositorio a GitHub.
2. Ve a `Settings > Pages`.
3. En `Build and deployment`, elige `Deploy from a branch`.
4. Selecciona `main` y la carpeta `/ (root)`.
5. Guarda.
6. La app quedará publicada en la URL de GitHub Pages del repositorio.

URL esperable en este proyecto:

```text
https://olsanju-hub.github.io/Neumonia/
```

## Qué hacer si no ves los cambios nuevos

Como la app usa `service worker`, a veces el navegador conserva una versión anterior.

Si no ves cambios:

- haz una recarga fuerte
- cierra y vuelve a abrir la pestaña
- borra los datos del sitio si hace falta

Si cambias shell base de la app:

- puede ser útil subir la versión del caché en `service-worker.js`

## Cómo reutilizar este repo como plantilla

Si quieres usar esta app como base para otra sesión docente:

1. Cambia `appName` y `author` en `data/content.js`.
2. Sustituye `sessionOutline` por los títulos de la nueva sesión.
3. Reescribe los paneles `dx`, `tx`, `scales` y `session` en `data/content.js`.
4. Sustituye los PDFs de `docs/`.
5. Actualiza `bibliography` en `data/content.js` para que apunte a los nuevos nombres.
6. Cambia `assets/portada/cover.png`.
7. Sustituye las imágenes `assets/imagen/nac/NNN.png`.
8. Sustituye o crea los resúmenes `assets/texto/nac/NNN.txt`.
9. Si el proyecto deja de ser de NAC, renombra también textos visibles, título del repo y este `README`.

## Qué tocar si quieres modificar algo concreto

- contenido docente: `data/content.js`
- diseño y responsive: `styles.css`
- navegación, visor, fullscreen y lógica general: `app.js`
- estructura HTML base: `index.html`
- comportamiento PWA/offline: `manifest.webmanifest` y `service-worker.js`

## Limitaciones conocidas

- una diapositiva horizontal nunca llenará una pantalla vertical sin recorte
- la app maximiza el área útil, pero mantiene `object-fit: contain` para no cortar la diapositiva
- la app maximiza el área útil visible en móvil, aunque el chrome del navegador sigue dependiendo de iOS o Android

## Resumen corto

Para mantener esta app o usarla como plantilla solo necesitas recordar esto:

- las diapositivas viven en `assets/imagen/nac/`
- los resúmenes viven en `assets/texto/nac/`
- la portada vive en `assets/portada/cover.png`
- la bibliografía vive en `docs/`
- la sesión y el contenido docente viven en `data/content.js`
- el comportamiento visual vive en `styles.css`
- la lógica del visor vive en `app.js`
