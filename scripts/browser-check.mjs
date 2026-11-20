/**
 * Verificación en navegador real (Edge/Chromium) con Playwright Core.
 * No descarga música: sólo comprueba render, interacción, estados y consola.
 *
 * Uso: npm run build && node scripts/browser-check.mjs
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const SHOTS = "C:\\Users\\fedef\\AppData\\Local\\Temp\\opencode\\radio-shots";
mkdirSync(SHOTS, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
function check(label, ok, detail = "") {
  results.push({ label, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

async function waitForServer() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {
      // todavía arranca
    }
    await sleep(500);
  }
  throw new Error("El servidor no respondió en 30s");
}

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { cwd: process.cwd(), stdio: "ignore" },
);

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

  // ---------- Home ----------
  await page.goto(BASE, { waitUntil: "networkidle" });
  check("home: hero visible", await page.locator("h1").first().isVisible());
  check("home: escena SVG", await page.locator("svg.sunset-scene").count() === 1);
  check(
    "home: 7 emisoras oficiales",
    await page.locator(".station-card").count() === 7,
    `encontradas ${await page.locator(".station-card").count()}`,
  );
  await page.screenshot({ path: `${SHOTS}\\home-desktop.png`, fullPage: true });

  // ---------- Emisoras y filtros ----------
  await page.getByRole("link", { name: /Explorar emisoras/i }).first().click();
  await page.waitForURL("**/emisoras");
  check(
    "emisoras: 23 tarjetas",
    await page.locator(".station-card").count() === 23,
    `encontradas ${await page.locator(".station-card").count()}`,
  );
  await page.getByRole("button", { name: "Reportadas" }).click();
  check(
    "emisoras: filtro Reportadas = 16",
    await page.locator(".station-card").count() === 16,
    `encontradas ${await page.locator(".station-card").count()}`,
  );
  await page.getByRole("button", { name: "Confirmadas" }).click();
  check(
    "emisoras: filtro Confirmadas = 7",
    await page.locator(".station-card").count() === 7,
  );
  await page.screenshot({ path: `${SHOTS}\\emisoras-desktop.png`, fullPage: true });

  // ---------- Emisora reportada con fuente añadida ----------
  await page.goto(`${BASE}/emisoras/emotion-98-3`, { waitUntil: "networkidle" });
  check(
    "emisorable: encabezado de prensa",
    (await page.locator("#tracklist-title").textContent())?.includes("reportadas"),
  );
  check("emisora: 15 canciones", await page.locator(".track-row").count() === 15);
  await page.locator(".track-row__play").first().click();
  await sleep(1500);
  const selectedPressTrack = (await page.locator(".player-track__text strong").textContent())?.trim();
  const status = (await page.locator(".playback-status").textContent())?.trim();
  check(
    "emisora reportada: canción con fuente seleccionada",
    selectedPressTrack === "Drive",
    `canción=${selectedPressTrack}`,
  );
  check("emisora reportada: fuente lista para reproducir", status !== "Sin fuente", `estado=${status}`);

  // ---------- Reproducción con fuente ----------
  await page.goto(`${BASE}/emisoras/flash-fm`, { waitUntil: "networkidle" });
  await page.locator(".station-hero button", { hasText: "Sintonizar emisora" }).click();
  await sleep(3500);
  const playing = (await page.locator(".player-track__text strong").textContent())?.trim();
  check("reproductor: canción con fuente cargada", playing === "Good Ones", `canción=${playing}`);
  check("reproductor: iframe visible", await page.locator(".mini-stage iframe").count() === 1);
  const playStatus = (await page.locator(".playback-status").textContent())?.trim();
  check(
    "reproductor: sin error de embed",
    playStatus !== "Sin señal",
    `estado=${playStatus}`,
  );
  const stageBox = await page.locator(".mini-stage").boundingBox();
  const barBox = await page.locator(".player-bar").boundingBox();
  check(
    "reproductor: escenario ≥200x200",
    Boolean(stageBox && stageBox.width >= 200 && stageBox.height >= 200),
    stageBox ? `${Math.round(stageBox.width)}x${Math.round(stageBox.height)}` : "sin caja",
  );
  check(
    "reproductor: escenario no tapa la barra",
    Boolean(stageBox && barBox && stageBox.y + stageBox.height <= barBox.y + 4),
  );
  await page.screenshot({ path: `${SHOTS}\\player-desktop.png` });

  // ---------- Siguiente / anterior / volumen ----------
  const before = (await page.locator(".player-track__text strong").textContent())?.trim();
  await page.getByRole("button", { name: "Canción siguiente" }).click();
  await sleep(600);
  const afterNext = (await page.locator(".player-track__text strong").textContent())?.trim();
  check("reproductor: siguiente cambia canción", before !== afterNext, `${before} → ${afterNext}`);
  await page.getByRole("button", { name: "Canción anterior" }).click();
  await sleep(600);
  const afterPrev = (await page.locator(".player-track__text strong").textContent())?.trim();
  check("reproductor: anterior vuelve", afterPrev === before, `${afterPrev}`);

  const shuffleButton = page.getByRole("button", { name: "Activar aleatorio" });
  await shuffleButton.click();
  check(
    "reproductor: modo aleatorio",
    await page.getByRole("button", { name: "Desactivar aleatorio" }).getAttribute("aria-pressed") === "true",
  );
  await page.getByRole("button", { name: "Activar repetición" }).click();
  check("reproductor: repetición de cola", await page.getByRole("button", { name: "Repetir cola" }).count() === 1);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press("n");
  await sleep(500);
  check(
    "reproductor: atajo N pasa a siguiente",
    (await page.locator(".player-track__text strong").textContent())?.trim() !== afterPrev,
  );

  await page.locator('input[aria-label="Volumen"]').evaluate((input) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, "0.35");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.reload({ waitUntil: "networkidle" });
  const volume = await page.locator('input[aria-label="Volumen"]').inputValue();
  check("persistencia: volumen tras recargar", Math.abs(Number(volume) - 0.35) < 0.01, `vol=${volume}`);

  // ---------- Biblioteca ----------
  await page.goto(`${BASE}/biblioteca`, { waitUntil: "networkidle" });
  check("biblioteca: listado paginado", await page.locator(".track-row").count() === 50);
  await page.getByRole("button", { name: /Mostrar 50 más/i }).click();
  check("biblioteca: cargar más resultados", await page.locator(".track-row").count() === 100);
  await page.getByRole("searchbox", { name: /Buscar en la biblioteca/i }).fill("MGMT");
  await sleep(300);
  check("biblioteca: búsqueda MGMT", await page.locator(".track-row").count() === 1);
  await page.getByRole("searchbox", { name: /Buscar en la biblioteca/i }).fill("Myke Towers");
  await sleep(300);
  await page.locator(".track-row__play").first().click();
  await page.getByRole("button", { name: /Abrir cola de reproducción/ }).click();
  check(
    "reproducción individual: no agrega otras canciones de la emisora",
    await page.locator(".queue-panel__list .queue-item").count() === 1 &&
      (await page.locator(".queue-item__text strong").first().textContent())?.trim() === "Girl",
  );
  await page.getByRole("button", { name: "Cerrar cola" }).click();
  await page.getByRole("searchbox", { name: /Buscar en la biblioteca/i }).fill("");
  const addableTrack = page.locator(".queue-add-button:not(:disabled)").first();
  const addedTrackLabel = await addableTrack.getAttribute("aria-label");
  const addedTrackTitle = addedTrackLabel?.replace(/^Agregar /, "").replace(/ a la cola$/, "");
  await addableTrack.click();
  await page.getByRole("button", { name: /Abrir cola de reproducción/ }).click();
  check("cola: panel con próximas canciones", await page.locator(".queue-panel__list .queue-item").count() > 0);
  check(
    "cola: agregar desde biblioteca",
    (await page.locator(".queue-item__text strong").allTextContents()).includes(addedTrackTitle ?? ""),
  );
  check("historial: panel de recientes", await page.locator(".queue-panel__recent-list li").count() > 0);
  await page.getByRole("button", { name: "Cerrar cola" }).click();
  await page.locator(".track-row .favorite-button").first().click();
  await page.reload({ waitUntil: "networkidle" });
  check(
    "persistencia: favorito tras recargar",
    await page.locator(".track-row .favorite-button.is-favorite").count() === 1,
  );

  // ---------- Móvil ----------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(BASE, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: `${SHOTS}\\home-mobile.png`, fullPage: true });
  await mobilePage.getByRole("button", { name: "Expandir reproductor" }).click();
  check("móvil: reproductor expandido", await mobilePage.locator(".player-expanded").isVisible());
  await mobilePage.keyboard.press("Escape");
  check("móvil: cerrar reproductor expandido", await mobilePage.locator(".player-expanded").count() === 0);
  const overflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check("móvil: sin desbordamiento horizontal", overflow <= 2, `overflow=${overflow}px`);
  await mobilePage.goto(`${BASE}/emisoras`, { waitUntil: "networkidle" });
  await mobilePage.screenshot({ path: `${SHOTS}\\emisoras-mobile.png`, fullPage: true });

  // ---------- Accesibilidad básica y consola ----------
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("button")].filter((button) => {
      const label = button.getAttribute("aria-label") ?? button.getAttribute("title") ?? "";
      return !label.trim() && !(button.textContent ?? "").trim();
    }).length,
  );
  check("a11y: botones con nombre accesible", unnamed === 0, `sin nombre=${unnamed}`);
  const relevantErrors = consoleErrors.filter(
    (error) =>
      !/youtube|ytimg|ERR_BLOCKED|net::|favicon|Permissions policy violation/i.test(error),
  );
  check("consola: sin errores de la app", relevantErrors.length === 0, relevantErrors.join(" | "));
  console.log(`\nCapturas en ${SHOTS}`);
} catch (error) {
  console.error("ERROR EN LA PRUEBA:", error);
  results.push({ label: "ejecución", ok: false, detail: String(error) });
} finally {
  await browser?.close();
  server.kill("SIGKILL");
  await sleep(500);
  const failed = results.filter((result) => !result.ok);
  console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} pruebas OK`);
  if (failed.length > 0) process.exitCode = 1;
}
