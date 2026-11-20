import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/common/Reveal";
import { SunsetScene } from "@/components/common/SunsetScene";
import { NowPlaying } from "@/components/player/NowPlaying";
import { StationCard } from "@/components/stations/StationCard";
import { officialStations, stations as allStations, tracks } from "@/lib/catalog";
import heroArt from "@/img/img-5.svg";
import featureArt from "@/img/img-1.svg";

export default function HomePage() {
  const stations = officialStations();
  const documentedCount = allStations.length;
  const officialTrackCount = tracks.filter((track) => track.status === "official").length;

  return (
    <>
      <section className="hero">
        <SunsetScene />
        <div className="hero__layout">
          <div className="hero__content">
            <p className="eyebrow">GRAND THEFT AUTO VI · LEONIDA</p>
            <h1>
              BROADCASTING<br />
              <span>LIVE ACROSS</span><br />
              LEONIDA
            </h1>
            <p className="hero__lede">
              Las emisoras confirmadas por Rockstar, la música que suena en ellas y un
              reproductor que te acompaña mientras recorres Vice City. Sin descargas,
              sin fuentes inventadas.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" href="/emisoras">
                ▶ Explorar emisoras
              </Link>
              <Link className="button button--ghost" href="/biblioteca">
                Abrir biblioteca →
              </Link>
            </div>
            <dl className="hero__stats">
              <div>
                <dt>{stations.length}</dt>
                <dd>emisoras oficiales</dd>
              </div>
              <div>
                <dt>{officialTrackCount}</dt>
                <dd>canciones confirmadas</dd>
              </div>
              <div>
                <dt>∞</dt>
                <dd>reproducción continua</dd>
              </div>
            </dl>
          </div>
          <div className="hero__visual">
            <div className="hero__art" aria-hidden="true">
              <Image src={heroArt} alt="" fill priority unoptimized sizes="(max-width: 760px) 100vw, 45vw" />
              <span className="hero__art-label">VICE CITY · 99.7 FM</span>
            </div>
            <NowPlaying />
          </div>
        </div>
      </section>

      <div className="page-shell home-page">
        <Reveal delay={0.08}>
          <section className="section home-stations" aria-labelledby="station-section-title">
            <div className="section__head">
              <div>
                <p className="eyebrow">01 / SEÑAL OFICIAL</p>
                <h2 id="station-section-title">Emisoras en el dial</h2>
              </div>
              <Link className="text-link" href="/emisoras">
                Ver todas →
              </Link>
            </div>
            <p className="result-count">
              {stations.length} confirmadas por Rockstar de {documentedCount} emisoras
              documentadas. Las reportadas por prensa llevan su etiqueta.
            </p>
            <div className="station-grid">
              {stations.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="editorial home-editorial" aria-labelledby="editorial-title">
            <div className="editorial__art">
              <Image src={featureArt} alt="Ilustración de dos protagonistas junto a un automóvil en Leonida" fill unoptimized sizes="(max-width: 760px) 100vw, 48vw" />
              <span className="editorial__stamp">LEONIDA<br />STATE OF MIND</span>
            </div>
            <div className="editorial__copy">
              <p className="eyebrow">TU FRECUENCIA, TU RUTA</p>
              <h2 id="editorial-title">La banda sonora<br /><span>de Leonida.</span></h2>
              <p>Explora las emisoras, descubre qué canciones están confirmadas y escucha las disponibles mientras recorres el dial.</p>
              <Link className="button button--primary" href="/biblioteca">Abrir biblioteca <span aria-hidden="true">→</span></Link>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.16}>
          <section className="notice home-notice" aria-label="Sobre las fuentes">
            <span className="notice__mark">i</span>
            <div>
              <h3>Datos verificados, música autorizada</h3>
              <p>
                Cada emisora y canción indica si fue confirmada por Rockstar, vista en
                material oficial o reportada por prensa. Reproducimos vídeos alojados en
                YouTube y enlazamos a Spotify o a los smart links oficiales; nunca alojamos
                música protegida.
              </p>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
