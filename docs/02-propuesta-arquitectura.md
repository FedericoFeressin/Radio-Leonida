# Etapas 2 y 3 — Propuesta de arquitectura y diseño

Estado: **propuesta aprobada e implementada**. Este documento describe la arquitectura acordada; el estado final del código está en `README.md`.

---

## 1. Decisión de stack

| Necesidad del prompt | Elección | Por qué |
|---|---|---|
| Navegación entre emisoras, biblioteca y favoritos | **Next.js (App Router)** | Routings por carpeta; el provider del reproductor vive en `layout.tsx` y **no se desmonta** al navegar |
| Tipado del catálogo y del reproductor | **TypeScript (strict)** | `status`, `sources` y eventos del engine se validan en compile-time |
| Estilos | **Tailwind CSS + CSS custom properties** | Tokens de la paleta en un solo sitio; utilidades para layout; CSS puro para gradientes, glow y scanlines |
| Animaciones | **Motion (Framer Motion)** | Apariciones al scroll y transiciones; se desactiva con `useReducedMotion()` |
| Estado del reproductor y favoritos | **React Context + `useReducer`** | Suficiente; evita Zustand/Redux. Persistencia en `localStorage` vía hook propio |
| Datos | **JSON tipado en `src/data/`** | 18 canciones confirmadas por Rockstar y 297 reportadas por prensa (315 en total); se actualiza sin migraciones. SQLite no se justifica (sin backend, sin escritura multiusuario) |
| Backend | **Ninguno** | No hay contenido sensible ni escrituras compartidas. Los enlaces son públicos y los favoritos son locales |

**Descartado:** Astro (el prompt pide React y el reproductor persistente entre rutas es más simple con un layout de Next); Web Playback SDK de Spotify (requiere Premium y no encaja con enlaces por canción); alojar audio (ilicencia).

---

## 2. Estructura propuesta

```
RadioGTAVI/
├── Agent/                       # existente, no tocar
├── Skills/                      # existente, no tocar
├── docs/
│   ├── 01-investigacion.md
│   └── 02-propuesta-arquitectura.md
├── public/
│   └── (SVG originales: logo, fondos de gradient, iconos)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # PlayerProvider + Header + PlayerBar
│   │   ├── page.tsx                   # Pantalla principal / centro de control
│   │   ├── emisoras/page.tsx          # Listado
│   │   ├── emisoras/[slug]/page.tsx   # Detalle de emisora + tracklist
│   │   ├── biblioteca/page.tsx        # Búsqueda, filtros, orden
│   │   ├── favoritos/page.tsx         # Canciones y emisoras guardadas
│   │   ├── globals.css                # tokens + base + utilidades visuales
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/Header.tsx · PlayerBar.tsx · escenario integrado en PlayerBar.tsx
│   │   ├── stations/StationCard.tsx · StationHero.tsx · HostBadge.tsx
│   │   ├── tracks/TrackRow.tsx · TrackDetailModal.tsx · SourceButton.tsx
│   │   ├── library/LibraryFilters.tsx · SearchInput.tsx
│   │   ├── common/ConfirmBadge.tsx · EmptyState.tsx · Skeleton.tsx
│   │   └── player/PlayerProvider.tsx · usePlayer.ts · playerReducer.ts
│   ├── data/
│   │   ├── stations.json              # 7 oficiales + material oficial indirecto
│   │   ├── tracks.json                # 18 confirmadas + tráilers + reportadas
│   │   └── sources.json               # enlaces verificados por canción
│   ├── lib/
│   │   ├── types.ts                   # Station, Track, Source, PlayerState
│   │   ├── catalog.ts                 # carga, normaliza y deriva índices
│   │   ├── engines/types.ts           # interfaz AudioEngine
│   │   ├── engines/youtube.ts         # YT.Player adaptado
│   │   ├── engines/external.ts        # fallback: abre fuente oficial
│   │   ├── engines/index.ts           # factoría por source.kind
│   │   ├── storage.ts                 # localStorage con hydrate segura
│   │   └── format.ts                  # mm:ss, normalización de búsqueda
│   └── hooks/
│       ├── useFavorites.ts
│       └── useReducedMotion.ts        # o usar el de Motion
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 3. Modelo de datos

```ts
type ConfirmationStatus =
  | 'official'          // comunicado / web de Rockstar
  | 'official-material' // vista en tráiler o material oficial, sin anunciar
  | 'press-reported'    // prensa especializada, in-game
  | 'trailer'           // canción de tráiler sin emisora conocida
  | 'rumor';            // solo interno, nunca se renderiza

type SourceKind = 'youtube' | 'spotify' | 'soundcloud' | 'rockstar-preview' | 'official-link';

interface Source {
  id: string;
  kind: SourceKind;
  url: string;                 // URL canonical, nunca un iframe arbitrario
  label: string;               // "Escuchar en YouTube (canal oficial)"
  verifiedAt: string;          // ISO date
  embeddable: boolean;         // YouTube 101/150 → false
}

interface Station {
  id: string;                  // slug: 'flash-fm'
  name: string;
  frequency?: string;          // '106.6'
  genre: string;
  genres: string[];
  description: string;
  hosts: { name: string; character?: string }[];
  status: ConfirmationStatus;
  trackIds: string[];
  previewUrl?: string;         // rockstargames.com/VI/music/...
  accent: string;              // token CSS, p. ej. '--accent-pink'
  glyph: string;               // marca original en SVG/CSS, NO logo de Rockstar
  confirmedBy?: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  stationId: string | null;
  genre: string | null;
  status: ConfirmationStatus;
  sourceIds: string[];
  artwork: { kind: 'gradient'; token: string } | null; // original, sin carátulas protegidas
  confirmedBy?: string;
  confirmedAt?: string;
}
```

**Derivaciones en `catalog.ts`:** `getStationTracks`, `getTrackById`, `searchTracks(query)`, `filterBy({ stationId, genre })`, `sortBy('title'|'artist')`, `getSourcesFor(trackId)`. La UI nunca accede a los JSON directamente.

---

## 4. Reproductor persistente

### Interfaz del motor

```ts
interface AudioEngine {
  load(source: Source, opts?: { autoplay?: boolean }): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume0to1: number): void;
  getPosition(): number;
  getDuration(): number;
  destroy(): void;
  on(event: 'ready'|'playing'|'paused'|'ended'|'error', cb: (payload?: unknown) => void): () => void;
}
```

- `youtube.ts`: carga `https://www.youtube.com/iframe_api` una sola vez; usa `loadVideoById`, `playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `getCurrentTime`, `getDuration`; escucha `onStateChange` (`0` ended → siguiente canción) y `onError` (`100/101/150/153` → estado `error`/`sin-fuente`). El `<div>` del player se monta en `MiniStage`, **visible ≥ 200×200 px**, con `playsinline: 1` y `origin` de la app.
- `external.ts`: no reproduce; abre `source.url` en pestaña nueva con `rel="noopener noreferrer"` y marca la canción como `external`.
- La factoría elige `youtube` → `spotify` → `external` según `source.kind` y `embeddable`.

### Estado global

```ts
interface PlayerState {
  queue: string[];          // trackIds de la emisora activa
  index: number;
  currentTrackId: string | null;
  stationId: string | null;
  playback: 'idle'|'loading'|'playing'|'paused'|'ended'|'error'|'no-source'|'external';
  position: number;
  duration: number;
  volume: number;           // 0..1
  muted: boolean;
  error?: string;
}
```

Acciones: `PLAY_STATION`, `PLAY_TRACK`, `PLAY_QUEUE_TRACK`, `ADD_TO_QUEUE`, `REMOVE_FROM_QUEUE`, `MOVE_IN_QUEUE`, `CLEAR_UP_NEXT`, `TOGGLE_SHUFFLE`, `SET_REPEAT`, `TOGGLE`, `NEXT`, `PREV`, `SEEK`, `SET_VOLUME`, `ENGINE_EVENT`, `RESTORE`.

**Persistencia:** favoritos, volumen, aleatorio, repetición e historial reciente (máximo 30 pistas) en `localStorage` (claves versionadas `gta6radio:v1:*`). Se hidrata en `useEffect` para evitar desajuste SSR/CSR. La posición, la pista actual y la cola **no** se persisten: al recargar no hay autoplay.

**Autoplay:** ninguna reproducción arranca sola; siempre detrás de un click del usuario. Cumple las políticas de Safari/Chrome y el principio "sin botones que no funcionan".

---

## 5. Vistas y componentes clave

| Ruta | Contenido |
|---|---|
| `/` | Hero "BROADCASTING LIVE ACROSS LEONIDA", ahora-suena grande, grid de emisoras oficiales, acceso a biblioteca y favoritos |
| `/emisoras` | Grid filtrable por género; badge de confirmación en cada tarjeta |
| `/emisoras/[slug]` | Hero de emisora (glyph original + degradado propio), hosts, descripción oficial, tracklist con botón play, preview oficial, aviso de estado |
| `/biblioteca` | Buscador por canción y artista, filtros emisora/género/estado, orden alfabético, paginación suave |
| `/favoritos` | Canciones y emisoras guardadas; empty state con CTA a emisoras |
| `TrackDetailModal` | Título, artista, álbum, año, emisora, género, estado de confirmación, fuente y enlace autorizado |

**PlayerBar** fijo abajo en todas las rutas: portada generada (gradient + glyph), título/artista, controles, barra de progreso `input[type=range]` accesible, volumen e indicador de estado. Incluye cola reordenable, acceso a recientes, aleatorio, repetición y un reproductor expandido en móvil. Atajos fuera de campos interactivos: Espacio/K reproducir o pausar, N/P siguiente o anterior, M silenciar y J/L buscar ±10 segundos.

---

## 6. Sistema visual (skill "Vice City Retro Futurism")

Tokens en `globals.css` y espejo en `tailwind.config.ts`:

| Token | Valor | Uso |
|---|---|---|
| `--pink` / `--coral` / `--orange` | `#FF4FA3` / `#FF784B` / `#FFB45E` | Acentos, degradados |
| `--cyan` / `--violet` | `#42D9E8` / `#8062E9` | Énfasis, glows |
| `--bg` / `--surface` / `--text` | `#10101B` / `#1C1B2B` / `#F8F3F5` | Fondo, tarjetas, texto |
| `--radius-card` | 26px | Tarjetas (rango 20–30px) |
| `--radius-pill` | 999px | Botones |

**Identidad propia:** marca tipográfica "RADIO LEONIDA" + glyphs originales por emisora (formas SVG simples: onda, sol, palmera, rayo), grid de horizonte 80s en CSS, scanlines muy sutiles y glow controlado. **No** se copian los logos oficiales ni se usan carátulas comerciales: se usan degradados originales por pista. Si querés los logos oficiales, se evaluan por separado con su advertencia de licencia.

**Accesibilidad:** `lang="es"`, un solo `h1`, foco visible, targets ≥44px, contraste AA (el rosa sobre fondo oscuro se usa solo en texto grande o con superficie intermedia), `aria-live="polite"` para cambios de pista y errores, `prefers-reduced-motion` desactiva animaciones, navegación completa por teclado.

**Rendimiento:** solo el `MiniStage` carga el iframe de YouTube cuando hay una fuente reproducible; el resto son SVG/CSS. Imágenes `next/image` si se agreuben fotos originales; fuentes con `font-display: swap`.

---

## 7. Etapas de ejecución (tras aprobación)

| Etapa | Entregable | Verificación |
|---|---|---|
| 2 — Planificación | Este documento + `README.md` + `package.json` + tipos y catálogo seeds | `tsc --noEmit` sin errores |
| 3 — Diseño | Tokens, layout, Header, PlayerBar, StationCard, TrackRow (con datos reales) | Vista en móvil/tablet/escritorio; contraste AA |
| 4 — Desarrollo | Motor YouTube + fallback, rutas, búsqueda, filtros, favoritos, modal | Reproducir/pausar/siguiente/volumen; persistencia tras recargar |
| 5 — Pruebas | `npm run build`, Lighthouse, axe, pruebas manuales de teclado | Sin errores de consola; CWV en verde |

---

## 8. Supuestos, límites y riesgos

1. **Supuesto:** se siembra el catálogo con las 7 emisoras de la web oficial + 18 canciones confirmadas. Las emisoras de GameSpot (22 en total) quedan fuera del seed; se incorporan en una pasada separada con `status: press-reported`.
2. **Supuesto:** no hay backend; favoritos = `localStorage`. Si querés sincronización entre dispositivos, ahí sí entra SQLite + API.
3. **Riesgo legal:** los enlaces a YouTube/Spotify pueden caducar o no ser embebibles (error 101/150). El adaptador degrada a "Abrir fuente oficial" y nunca intenta eludir la restricción.
4. **Riesgo de datos:** Rockstar sigue revelando emisoras; por eso `status` y `confirmedBy` son obligatorios en cada registro.
5. **Límite:** no se incluyen pódcasts de Jason/Lucia porque aún no tienen nombre oficial (etapa futura).
6. **Límite:** el reproductor no mezcla audio de múltiples fuentes; una pista = un motor activo a la vez.

---

## 9. Única decisión que necesito antes de programar

¿Aprobás este stack (Next.js + TS + Tailwind + Motion, sin backend) y este alcance inicial (7 emisoras oficiales + 18 canciones, con el resto marcado como prensa), o preferís que arranque con otro stack / otro alcance?

## Implementacion actual y verificacion (2026-11-19)

La propuesta anterior describe las decisiones de diseño originales. La implementación vigente conserva Next.js App Router, TypeScript, Motion, datos JSON y estado global con React Context + `useReducer`. No hay backend.

- El escenario de YouTube está integrado en `src/components/layout/PlayerBar.tsx`; no existe un componente independiente `MiniStage.tsx`.
- `src/hooks/useReducedMotion.ts` espera a la hidrataciÃ³n antes de aplicar la preferencia del sistema; el SSR y el primer render del cliente conservan las mismas props de Motion. `Reveal` empieza visible (`initial={false}`), por lo que la preferencia reducida no oculta el listado de emisoras.
- `src/lib/engines/youtube.ts` usa `cueVideoById` y `playVideo`. La API compartida tiene un timeout de 15 segundos y permite reintentar tras un fallo. Si el motor se destruye mientras espera la API, no crea un reproductor tardío.
- `src/components/player/PlayerProvider.tsx` mantiene el estado `external` para enlaces que se abren fuera de la app. Ese estado no se convierte en `playing` al pulsar reproducir.
- El almacenamiento local conserva favoritos, volumen, aleatorio, repetición e historial (hasta 30 canciones). La pista actual y la cola no se restauran tras recargar.

Verificaciones ejecutadas:

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Correcto |
| `npm run build` | Correcto; rutas estáticas y dinámicas generadas |
| `node scripts/browser-check.mjs` | 34/34 comprobaciones correctas; incluye reproducción individual sin poblar la cola, cola, recientes, aleatorio, repetición, atajo N, reproductor expandido móvil, volumen, biblioteca, favoritos, responsive y consola |
| Emisoras con movimiento reducido | 23 tarjetas visibles, opacidad 1 y cero errores de consola |

Capturas de navegador: `C:\Users\fedef\AppData\Local\Temp\opencode\radio-shots`.
