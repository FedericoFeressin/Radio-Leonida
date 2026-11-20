/**
 * Comprueba en un navegador real qué vídeos de sources.json permiten embebido.
 * Uso: node scripts/check-embeddable.mjs
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const sources = JSON.parse(readFileSync("src/data/sources.json", "utf8")).filter(
  (source) => source.kind === "youtube" && source.videoId,
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  { cwd: process.cwd(), stdio: "ignore" },
);
for (let i = 0; i < 60; i += 1) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  await sleep(500);
}

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });

await page.evaluate(
  () =>
    new Promise((resolve, reject) => {
      if (window.YT?.Player) return resolve();
      window.onYouTubeIframeAPIReady = () => resolve();
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => reject(new Error("No se pudo cargar la API"));
      document.head.appendChild(script);
    }),
);

for (const source of sources) {
  const result = await page.evaluate(
    (videoId) =>
      new Promise((resolve) => {
        const host = document.createElement("div");
        host.style.cssText =
          "position:fixed;left:0;top:0;width:400px;height:300px;z-index:99999;background:#000";
        document.body.appendChild(host);
        let finished = false;
        let player;
        let ready = false;
        const finish = (value) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          clearTimeout(observe);
          try { player?.destroy(); } catch {}
          host.remove();
          resolve(value);
        };
        // Espera 6s después de onReady: el error 101/150 puede llegar tarde.
        const observe = setTimeout(() => {
          if (ready) finish("ok");
        }, 6000);
        const timer = setTimeout(() => finish(ready ? "ok-timeout" : "timeout"), 12000);
        player = new window.YT.Player(host, {
          width: "400",
          height: "300",
          videoId,
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => { ready = true; },
            onError: (event) => finish(`error-${event.data}`),
          },
        });
      }),
    source.videoId,
  );
  console.log(`${source.id.padEnd(24)} ${source.videoId}  ${result}`);
  await sleep(200);
}

await browser.close();
server.kill("SIGKILL");
