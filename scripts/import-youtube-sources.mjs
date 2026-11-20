/**
 * Finds high-confidence embeddable YouTube videos for catalog tracks.
 * Usage: node scripts/import-youtube-sources.mjs --scope=all --offset=0 --limit=99 [--dry-run]
 * Search API quota is limited; use non-overlapping offsets across days.
 */
import { readFile, writeFile } from "node:fs/promises";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const API_KEY = process.env.YOUTUBE_API_KEY;
const TRACKS_PATH = "src/data/tracks.json";
const SOURCES_PATH = "src/data/sources.json";
const args = new Map(process.argv.slice(2).map((value) => {
  const [key, ...rest] = value.replace(/^--/, "").split("=");
  return [key, rest.join("=") || "true"];
}));
const offset = Number(args.get("offset") ?? 0);
const limit = Number(args.get("limit") ?? 99);
const dryRun = args.has("dry-run");
const scope = args.get("scope") ?? "press-reported";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!API_KEY) throw new Error("Falta YOUTUBE_API_KEY en .env.local");
if (!Number.isInteger(offset) || offset < 0) throw new Error("--offset debe ser un entero >= 0");
if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("--limit debe estar entre 1 y 100");
if (scope !== "all" && scope !== "press-reported") {
  throw new Error("--scope debe ser all o press-reported");
}

const tracks = JSON.parse(await readFile(TRACKS_PATH, "utf8"));
const sources = JSON.parse(await readFile(SOURCES_PATH, "utf8"));
const candidates = scope === "all"
  ? tracks
  : tracks.filter((track) => track.status === "press-reported");
const batch = candidates.slice(offset, offset + limit);
const sourceIds = new Set(sources.map((source) => source.id));
const sourceById = new Map(sources.map((source) => [source.id, source]));
const decodeEntities = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("&#39;", "'")
  .replaceAll("&quot;", '"')
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");
const normalize = (value) => decodeEntities(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const artistNames = (artist) => artist
  .split(/\s+(?:feat(?:uring)?\.?|ft\.?)\s+|\s*&\s*|\s+and\s+|\s*;\s*/i)
  .map(normalize)
  .filter((name) => name.length >= 3);
const compact = (value) => normalize(value).replaceAll(" ", "");

let searched = 0;
let matched = 0;
let skipped = 0;
let failed = false;

for (const [batchIndex, track] of batch.entries()) {
  if (track.sourceIds?.some((id) => {
    const source = sourceById.get(id);
    return source?.kind === "youtube" && source.embeddable && source.videoId;
  })) {
    skipped += 1;
    continue;
  }

  const query = `${track.artist} ${track.title}`;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams({
    key: API_KEY,
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    maxResults: "10",
    q: query,
  }).toString();

  try {
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok) {
      const reason = payload?.error?.errors?.[0]?.reason ?? `HTTP ${response.status}`;
      console.error(`API error at offset ${offset + batchIndex}: ${reason}`);
      failed = true;
      break;
    }
    searched += 1;

    const expectedTitle = normalize(track.title);
    const aliases = artistNames(track.artist);
    const candidate = (payload.items ?? []).find((item) => {
      const videoTitle = normalize(item.snippet?.title ?? "");
      const channel = normalize(item.snippet?.channelTitle ?? "");
      const exactSongTitle = ` ${videoTitle} `.includes(` ${expectedTitle} `);
      const compactChannel = compact(item.snippet?.channelTitle ?? "");
      const artistChannelMatch = aliases.some((artist) => {
        const alias = compact(artist);
        return compactChannel === alias
          || compactChannel === `${alias}topic`
          || compactChannel === `${alias}vevo`
          || compactChannel === `${alias}official`
          || compactChannel === `${alias}officialartistchannel`
          || (compactChannel.startsWith(alias) && compactChannel.endsWith("topic"));
      });
      return exactSongTitle && artistChannelMatch && Boolean(item.id?.videoId);
    });

    if (candidate) {
      const videoId = candidate.id.videoId;
      const id = `yt-${track.id}`;
      const source = {
        id,
        kind: "youtube",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        label: `${track.title} — canal ${candidate.snippet.channelTitle}`,
        verifiedAt: new Date().toISOString().slice(0, 10),
        embeddable: true,
      };
      const existingIndex = sources.findIndex((item) => item.id === id);
      if (existingIndex >= 0) sources[existingIndex] = source;
      else sources.push(source);
      sourceIds.add(id);
      sourceById.set(id, source);
      track.sourceIds = [...new Set([...(track.sourceIds ?? []), id])];
      matched += 1;
      console.log(`MATCH ${track.artist} — ${track.title} [${candidate.snippet.channelTitle}]`);
    } else {
      console.log(`REVIEW ${track.artist} — ${track.title}`);
    }
  } catch (error) {
    console.error(`Request failed at offset ${offset + batchIndex}: ${error instanceof Error ? error.message : "unknown error"}`);
    failed = true;
    break;
  }

  await sleep(1000);
}

console.log(`Scope ${scope}, batch ${offset}-${offset + batch.length - 1}: searched=${searched} matched=${matched} skipped=${skipped}`);
if (!dryRun && searched > 0) {
  await writeFile(TRACKS_PATH, `${JSON.stringify(tracks, null, 2)}\n`, "utf8");
  await writeFile(SOURCES_PATH, `${JSON.stringify(sources, null, 2)}\n`, "utf8");
  console.log("Catalog files updated.");
}
if (failed) process.exitCode = 1;
