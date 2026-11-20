# Radio Leonida · GTA VI Radio

App web de radio musical inspirada en Grand Theft Auto VI. Catálogo verificado, reproductor persistente entre rutas, biblioteca con búsqueda y filtros, favoritos en LocalStorage y fichas de canción con fuentes autorizadas.

## Estado del proyecto

- **Etapa 1 — Investigación:** completada en [`docs/01-investigacion.md`](docs/01-investigacion.md).
- **Etapas 2/3 — Propuesta y arquitectura:** en [`docs/02-propuesta-arquitectura.md`](docs/02-propuesta-arquitectura.md).
- **Etapas 4/5 — Desarrollo y pruebas:** implementadas. Verificación: typecheck y build correctos; 34/34 comprobaciones en navegador, incluida reproducción individual sin poblar la cola, cola, historial, modos de reproducción, atajo de teclado y reproductor expandido móvil. La ruta de emisoras también se comprobó con movimiento reducido: 23 tarjetas visibles, sin errores de consola.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir **http://localhost:3000** (usar `localhost`, no `127.0.0.1`: YouTube rechaza el embebido desde una IP y la app degrada a "Abrir fuente oficial").

```bash
npm run typecheck   # validación de tipos
npm run build       # build de producción
npm run start       # servir el build
```

Verificación:

```bash
node scripts/browser-check.mjs      # 34 comprobaciones en Edge/Chromium (requiere build previo)
npm run import:youtube -- --scope=all --offset=0 --limit=100  # busca fuentes en todo el catálogo
node scripts/check-embeddable.mjs   # comprueba qué vídeos permiten embebido
node scripts/expand-catalog.mjs     # siembra emisoras de prensa; idempotente
node scripts/import-gamespot-tracks.mjs --dry   # vista previa de la importación completa
node scripts/import-gamespot-tracks.mjs         # importa el listado completo de GameSpot
```

El importador de YouTube requiere `YOUTUBE_API_KEY` en `.env.local`; procesa offsets no superpuestos porque la API tiene una cuota diaria de búsquedas. Usa `--scope=all` para recorrer el catálogo completo en rangos estables; el importador omite las pistas que ya tienen video embebible y solo asocia coincidencias exactas de título y canal del artista. Al 19/11/2026, 91 de 316 canciones tienen una fuente embebible asociada y 225 están pendientes. La cuota de la API se agotó durante la búsqueda; continuar desde el siguiente rango tras el reinicio diario.

`browser-check.mjs` usa `playwright-core` con el Edge instalado y guarda capturas en el directorio temporal del sistema (`radio-shots`).

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS 4 · Motion · React Context + `useReducer`. Sin backend.

## Estructura

```
src/
├── app/                 # rutas y estilos globales
├── components/
│   ├── layout/          # Header, PlayerBar
│   ├── player/          # PlayerProvider, NowPlaying, reducer
│   ├── stations/        # StationCard, StationHero, StationGrid
│   ├── tracks/          # TrackRow, modal, SourceButton
│   ├── library/         # LibraryView, FavoritesView
│   └── common/          # Glyph, ConfirmBadge, EmptyState
├── data/                # stations.json, tracks.json, sources.json
├── hooks/               # useFavorites, useReducedMotion
└── lib/
    ├── catalog.ts       # derivaciones del catálogo
    ├── engines/         # YouTube, external, factoría
    ├── format.ts · storage.ts · types.ts
```

## Catálogo y verificación

El catálogo contiene **23 emisoras** (7 con preview en la web oficial + 16 reportadas por GameSpot) y **315 canciones** (18 nominales del comunicado de Rockstar del 8 de octubre de 2026 y 297 reportadas por prensa). Cada registro lleva `status` y `confirmedBy`:

| Estado | Significado |
|---|---|
| `official` | Publicado por Rockstar en su web o Newswire |
| `official-material` | Visto en tráilers o material oficial, sin anunciar como emisora |
| `press-reported` | Reportado por prensa especializada |
| `trailer` | Canción de tráiler sin emisora conocida |
| `rumor` | Uso interno; nunca se muestra en la UI |

Para añadir música: editar `src/data/*.json`, manteniendo los IDs y las URLs de confirmación. La UI deriva todo desde `src/lib/catalog.ts`. Las emisoras de prensa se generaron con `scripts/expand-catalog.mjs` y su listado completo se importó con `scripts/import-gamespot-tracks.mjs`, ambos desde el artículo de GameSpot y sin duplicar los temas oficiales. Las emisoras talk (WKTT, The Wipe) y la emisora secreta (The Vault Radio) no tienen canciones publicadas.

La reproducción continua usa solamente los temas con fuente embebible verificada: el resto se puede buscar y abrir en la plataforma autorizada, pero no corta la cola. La biblioteca muestra 50 resultados por página.

## Reproducción y derechos

- Motor principal: **YouTube IFrame API**, con el vídeo visible (≥200×200 px), controles propios y detección de errores 101/150. La carga tiene timeout y permite reintentos; los motores destruidos durante una carga tardía no crean iframes huérfanos.
- Si no hay fuente embebible verificada: estado `sin fuente` y botón **Abrir fuente oficial** (Spotify, smart links `lnk.to` o web de Rockstar). El estado externo no se presenta como reproducción dentro de la app.
- **No se descarga, aloja ni proxynea audio protegido.** No se usan carátulas comerciales: las portadas son degradados originales y las marcas de emisora son SVG propios.
- El reproductor no arranca solo: toda reproducción requiere una acción del usuario.

## Persistencia

`localStorage` con prefijo `gta6radio:v1:`. Se guardan favoritos, volumen, modo aleatorio, repetición e historial de hasta 30 canciones. La pista actual y la cola no se restauran tras recargar para evitar autoplay no deseado.

La cola permite agregar canciones desde la biblioteca y las fichas, reproducirlas, cambiar el orden de las próximas y quitarlas. Al reproducir una canción individual, solo esa canción ocupa la cola; al sintonizar una emisora, se carga su lista reproducible. El panel del reproductor también muestra las canciones recientes. En móvil se puede expandir el reproductor. Atajos disponibles fuera de campos de texto y controles: `Espacio` o `K` reproducir/pausar, `N` siguiente, `P` anterior, `M` silenciar y `J`/`L` retroceder/avanzar 10 segundos.

## Accesibilidad

Navegación por teclado, foco visible, objetivos táctiles ≥44 px, `aria-live` para cambios de pista y errores, `prefers-reduced-motion` y contraste AA en la paleta oscura. La preferencia de movimiento reducido se aplica después de hidratar para mantener el HTML del servidor y el primer render del cliente sincronizados. En modo de movimiento reducido el contenido sigue visible y se omiten las animaciones de entrada.
