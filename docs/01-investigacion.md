# Etapa 1 — Investigación: GTA VI Radio

**Fecha de consulta:** 2026-11-19 (día del lanzamiento del juego).
**Regla aplicada:** diferenciar `oficial` / `material oficial indirecto` / `prensa` / `rumor`. No se inventan emisoras, canciones ni artistas.

---

## 1. Fuentes consultadas

| Nivel | Fuente | URL |
|---|---|---|
| Oficial | Rockstar Newswire — *The Music of GTA VI: In-Game Radio Stations* (08/10/2026) | https://www.rockstargames.com/newswire/article/o3982oa93a23k4/the-music-of-grand-theft-auto-vi-in-game-radio-stations |
| Oficial | Web oficial de música de GTA VI (previews de emisoras, álbum y score) | https://www.rockstargames.com/VI/music |
| Oficial | Página de muestra: Flash FM | https://www.rockstargames.com/VI/music/flash-fm |
| Prensa | Consequence — reprodución íntegra de las 6 emisoras y sus hosts (08/10/2026) | https://consequence.net/2026/10/gta-6-radio-stations-hosts-details/ |
| Prensa | Shacknews — "largest radio selection", 6 estaciones reveladas (08/10/2026) | https://www.shacknews.com/article/150944/gta-6-radio-stations |
| Prensa | GameSpot — *All GTA 6 Radio Stations And Songs* (19/11/2026) | https://www.gamespot.com/articles/all-gta-6-radio-stations-and-songs/ |
| Comunidad | GTA Wiki — *Radio Stations in GTA VI* | https://gta.fandom.com/wiki/Radio_Stations_in_GTA_VI |
| API | YouTube IFrame Player API (requisitos y métodos) | https://developers.google.com/youtube/iframe_api_reference |
| API | Spotify Embed IFrame API + Widget Terms | https://developer.spotify.com/documentation/embeds/references/iframe-api · https://developer.spotify.com/documentation/embeds/terms |

> La web oficial de Rockstar **no publica un listado cerrado** de emisoras: dice que habrá "the biggest and widest-ranging selection" y termina pidiendo "stay tuned". Por eso el catálogo debe ser extensible.

---

## 2. Confirmado oficialmente por Rockstar (8 oct 2026)

Seis emisoras con **hosts y 3 canciones nominales cada una = 18 canciones**. Los nombres entre paréntesis son los personajes dentro del juego.

| Emisora | Género (según Rockstar) | Locutores | Canciones confirmadas |
|---|---|---|---|
| **Cocoteo FM** | Latin moderno: bachata, merengue, dembow, reggaeton. *"El party que nunca se apaga"* | Bad Bunny (**El Martillo**), RaiNao (**La Gata**) | Bad Bunny — *EoO* · Axel Rulay ft. Farruko & El Alfa — *Si Es Trucho Es Trucho (Remix)* · Romeo Santos & El Chaval de la Bachata — *Canalla* |
| **Back Country Radio** | Country "renegado" (Grassrivers, Port Gellhorn) | Morgan Wallen (**MW**), Lana Del Rey (**Delta Dawne**), Jeremy Dufrene (**Mud Dog Mike**, meteorólogo de pantano) | David Allan Coe — *Need a Little Time Off for Bad Behavior* · Loretta Lynn — *Don't Come Home A-Drinkin'* · Hank Williams Jr. & Waylon Jennings — *The Conversation* |
| **AfroBank FM** | Música africana: highlife, amapiano, 3-step | Burna Boy (**Burna**), Palms Trax (**Palmsy**) | Asake — *Joha* · Pat Thomas ft. Ebo Taylor — *Gye Wani* · DJ Lag & Robot Boii ft. Kamo Mphela — *Shay'sana* |
| **The Chamber 106.6** | Metal clásico desde los 80 | Kerry King (**DJ Kerry**), Tom Araya (**DJ Tom**) | Black Sabbath — *I* · Pantera — *I'm Broken* · Slayer — *Raining Blood* |
| **Flash FM** | Pop; emisora clásica de Vice City | Robyn (**Robyn**), Alex Consani (**Alex**) | Charli xcx — *Good Ones* · MGMT — *Electric Feel* · Zara Larsson & PinkPantheress — *Midnight Sun (Girls Trip)* |
| **Dirty South Classics** | Rap y hip-hop sureño clásico | Trick Daddy (**Trick**), Trina (**Trina**) | David Banner ft. Lil' Flip — *Like A Pimp* · JT Money ft. Solé — *Who Dat* · DJ Khaled ft. Trick Daddy, Rick Ross & Pitbull — *Born N Raised* |

**Además, en la web oficial aparece una séptima emisora con preview:**

| Emisora | Descripción oficial | Estado |
|---|---|---|
| **CircoLoco Records** | *"Underground house and techno from DJ Seth and DJ Antonio. You're on the guest list."* | Confirmada como **preview oficial en la web** (no salía en el comunicado; sin canciones nominales). |

Novedades de sistema confirmadas: la radio también se escucha **a pie** mediante el smartphone del personaje y se añaden **pódcasts bajo demanda** para Jason y Lucia (aún sin nombres oficiales).

---

## 3. Material oficial indirecto (casi seguro, NO anunciado como emisora)

| Emisora | Evidencia | Clasificación |
|---|---|---|
| **V-Rock** | Camiseta con el logo actualizado (y el buitre Jimmy) que viste Jason en material oficial; también vista en la web | `official-material` |
| **Vice City FM** | Anuncio en una parada de autobús en *An Extended Look* (~8:47) y póster promocional en Miami; would-be "non-stop '80s" | `official-material` |
| **Honey FM** | Camiseta en *An Extended Look* y anuncio en un taxi en una captura oficial | `official-material` |

**Decisión:** se guardan en el catálogo con `status: official-material` y badge visible "Vista en material oficial · sin anuncio". **No** se presentan como confirmadas.

---

## 4. Reportado por prensa (19 nov 2026)

GameSpot (review del juego ya lanzado) documenta **22 emisoras** y cientos de canciones escuchadas in-game. Ejemplos: Flash FM, Emotion 98.3, Vice City FM, Stockyard FM, Dirty South Classics, VCRR, Honey FM, Cocoteo FM, Radio La Ola, Radio On-U, V-Rock, The Chamber 106.6, Back Country Radio, Gloriana Blues Radio, Leonida Jazz Radio, Symphony FM, Worldwide FM, CircoLoco Records Radio, AfroBank FM, Kaleidoscope FM (host: Jeremy Irons), WKTT (host: Stavros Halkias), The Wipe, y Vault Radio (secreta, se desbloquea en The Vault Nightclub).

**Clasificación:** `press-reported`. Sirve para ampliar el catálogo en una etapa posterior, con su badge correspondiente y su fuente. **No** se mezcla con los 18 temas confirmados por Rockstar.

**Incorporación efectiva (19 nov 2026):** se añadieron 16 emisoras de prensa al catálogo y, en una segunda pasada, el listado completo del artículo: 312 líneas de canciones parseadas, 242 nuevas tras evitar duplicados. Total final: 297 temas `press-reported` + 18 `official` = 315 canciones. `The Vault Radio` se documenta como emisora secreta dentro del mismo artículo; GameSpot afirma "22 emisoras" en el texto pero enumera 22 secciones de emisora más la sección de desbloqueo de The Vault, de ahí que el catálogo tenga 23 entradas. Los artistas y títulos se copiaron literalmente del artículo; `scripts/expand-catalog.mjs` es idempotente y nunca sobrescribe los registros `official`.

### Canciones de tráilers sin emisora asignada
Tom Petty — *Love Is a Long Road* (tráiler 1) · The Pointer Sisters — *Hot Together* (tráiler 2) · Wang Chung — *Everybody Have Fun Tonight* · Zenglen & 5 Etwal — *Child Support* · Tammy Wynette — *Talkin' to Myself Again* · Justice ft. Tame Impala, SZA, King Gizzard & The Lizard Wizard — *Flower in a Hurricane* (tráiler de lanzamiento; también sencillo del score).

**Clasificación:** `trailer` → se listan en la biblioteca con `stationId: null` y etiqueta "Del tráiler · emisora desconocida".

---

## 5. Álbum y score (fuentes oficiales de escucha)

- **Grand Theft Auto VI: The Album** — 34 temas originales, con Atlantic Records. Enlace oficial: https://gtavi-thealbum.lnk.to/gtavithealbum. La web oficial lista 10 sencillos con enlace "Play Full Track" (Yung Lean, Travis Scott, CA7RIEL & Paco Amoroso, Justice, Morgan Wallen, Fuerza Regida, Rauw Alejandro, Cardi B, Tove Lo, Keith Richards).
- **Original Score by Justice** — 30 pistas + bonus, 11/12/2026. Enlace oficial: https://justice.lnk.to/gtaoriginalscoredigital.
- Rockstar **no ha dicho** qué temas del álbum suenan en qué emisora. No se asocia ninguno a una emisora sin confirmación.

---

## 6. Fuentes de reproducción: qué es realmente viable

| Opción | Permite | Restricción verificada | Uso en el proyecto |
|---|---|---|---|
| **YouTube IFrame API** | `loadVideoById`, `playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `getCurrentTime`, `getDuration`, `setLoop`, eventos `onStateChange`/`onError` | El player debe ser **visible y de al menos 200×200 px**; `onError` 101/150 = vídeo no embebible; `playVideo()` programado no suma view | **Motor principal** de reproducción in-app, con mini-player visible |
| **Spotify Embed IFrame API** | `loadEntity`, `play`, `pause`, `togglePlay`, `playback_update` | `seek()` documentado para pódcasts; **sin control de volumen**; Widget Terms: no alterar/ocultar el widget, no usarlo en producto que compita con Spotify, "Play Button may not be used for commercial purposes" | **Solo** como enlace "Escuchar en Spotify" / widget íntegro en la ficha, nunca como motor del reproductor custom |
| **Rockstar previews** |_samples_ oficiales de cada emisora en `rockstargames.com/VI/music` | No alojar, no hotlink como audio propio; son muestras promocionales | Enlace "Preview oficial" en cada emisora |
| **Smart links (lnk.to)** | Llevan al usuario a plataforma autorizada | No son reproductor embebible | Botón "Abrir fuente oficial" |
| **Audio propio** | Control total | Ninguna canción comercial puede descargarse ni alojarse | Solo para un posible "jingles" originales HTML/CSS, no música |

**Conclusión:** el reproductor se construye sobre un **adaptador** con motor YouTube (visible, controls propios) y fallback `external-link`. Cada pista lleva `sources[]` verificadas; si no hay fuente embebible, se muestra el estado `sin-fuente` con botón a la plataforma oficial. Nunca se descarga ni se proxynea audio.

---

## 7. Reglas para el catálogo (se aplican en la Etapa 2)

1. `status`: `official` | `official-material` | `press-reported` | `trailer` | `rumor` (los rumores **no** se incluyen en la UI).
2. Toda canción lleva `sourceIds[]`, `confirmedBy` (URL) y `confirmedAt`.
3. `year`/`album` solo si están verificados; si no, `null` y se oculta el campo.
4. Emisora sin canciones confirmadas → estado visual `empty` con enlace a preview oficial.
5. El catálogo se separa en archivos para poder actualizarlo sin tocar componentes.
