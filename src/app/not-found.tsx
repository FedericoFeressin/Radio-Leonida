import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell not-found">
      <p className="eyebrow">FRECUENCIA NO ENCONTRADA</p>
      <h1>404 · Señal perdida</h1>
      <p>Esta emisora no existe en el catálogo verificado.</p>
      <Link className="button button--primary" href="/emisoras">
        Volver al dial
      </Link>
    </div>
  );
}
