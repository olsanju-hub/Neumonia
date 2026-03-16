# Neumonía Adquirida en la Comunidad (NAC)

App estática e independiente para docencia sobre NAC en adultos. No depende de frameworks, CDNs ni del motor GUIYO.

## Qué Falta Para Completarla

Añade estos archivos locales cuando quieras ampliar o completar la sesión:

- `assets/portada/cover.png`
- `assets/imagen/nac/NNN.png`
- `assets/texto/nac/NNN.txt`

Reglas:

- La imagen de cada diapositiva debe ir en `assets/imagen/nac/NNN.png`.
- El texto opcional de cada diapositiva debe ir en `assets/texto/nac/NNN.txt`.
- Si existe el `.png`, la diapositiva se muestra aunque no exista el `.txt`.
- Si existe el `.txt` pero no el `.png`, la diapositiva sigue en la secuencia y muestra el aviso de diapositiva no disponible.
- La portada usa `assets/portada/cover.png`; si no existe, se mantiene la portada base.

## Cómo Debe Ir El `.txt`

Formato recomendado:

```text
Título de la diapositiva
Resumen breve de la diapositiva.

Segundo párrafo opcional.
```

Si la primera línea es corta, la app la usa como título. Si no, usa el orden docente por defecto.

## Estructura Del Proyecto

- `index.html`: estructura de portada, visor, navegación y paneles.
- `styles.css`: diseño visual, responsive y paneles laterales.
- `app.js`: lógica de la app, carga de diapositivas, fullscreen, paneles y escalas.
- `data/content.js`: contenido docente de Dx, Tx, Escalas y Sesión.
- `manifest.webmanifest`: manifiesto PWA.
- `service-worker.js`: cache de shell y assets base.
- `assets/ui/`: icono y placeholders visuales.
- `assets/portada/`: portada local.
- `assets/imagen/nac/`: imágenes de diapositivas.
- `assets/texto/nac/`: resúmenes de diapositivas.
- `docs/`: bibliografía local enlazada desde la app.

## Funcionalidades Disponibles

- Portada inicial con autor visible.
- Visor lineal de una sola diapositiva por vez.
- Navegación `Anterior` / `Siguiente`.
- Botón de `Pantalla completa`.
- Paneles superpuestos `Dx`, `Tx`, `Escalas` y `Sesión`.
- Cierre de panel por `X`, clic fuera o tecla `ESC`.
- Carga automática de diapositivas numeradas disponibles.
- Resumen opcional bajo cada imagen.
- Escalas funcionales:
  - `CRB-65`
  - `CURB-65`
  - `PSI`
  - `ATS/IDSA gravedad-UCI`
  - `PCR rápida`
- Bibliografía enlazada a PDFs locales dentro de `docs/`.

## Bibliografía Local

Los enlaces visibles en la app apuntan a los PDF de `docs/`. Si cambias nombres de archivos dentro de esa carpeta, tendrás que actualizar también las referencias en `data/content.js`.

## Cómo Abrir La App

Servidor local recomendado:

```bash
cd /Users/olsanju/Desktop/neomonia
python3 -m http.server 4173
```

Después abre:

```text
http://127.0.0.1:4173
```

Abrir `index.html` con `file://` puede cargar la interfaz, pero no es la forma recomendada para cache, manifest y lectura de archivos locales.

## Publicación En GitHub Pages

1. Sube el repositorio a GitHub.
2. Ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `Deploy from a branch`.
4. Elige la rama principal y la carpeta `/root`.
5. Guarda los cambios.
6. La app quedará publicada en la URL de GitHub Pages del repositorio.

## Mantenimiento Rápido

- Para añadir más diapositivas, solo suma `004.png`, `005.png`... y sus `.txt` opcionales.
- Para cambiar contenido docente, edita `data/content.js`.
- Para cambiar diseño, edita `styles.css`.
- Para ajustar comportamiento del visor o escalas, edita `app.js`.
