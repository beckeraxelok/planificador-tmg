import React, { useState, useMemo, useRef } from "react";

const GOLD = "#C5A55A";
const GOLD_PALE = "#D9C489";
const GOLD_DARK = "#A87C2A";
const BLACK = "#1A1A1A";
const CHARCOAL = "#242424";
const CARD = "#212121";
const LINE = "#332F27";
const OFF = "#EDEAE3";
const MUTED = "#8A857B";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const HOY = new Date();
const ANIO_ACTUAL = HOY.getFullYear();
const ANIOS = Array.from({ length: 31 }, (_, i) => ANIO_ACTUAL + i);

const nuevoObjetivo = () => ({
  id: Math.random().toString(36).slice(2),
  nombre: "",
  monto: "0",
  fuente: "",
  mes: "",
  anio: "",
  asignado: "0",
  siNo: "",
  cambio: "",
  innegociable: false,
});

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);

// Guarda dígitos crudos, muestra con separador de miles
const soloDigitos = (s) => String(s).replace(/\D/g, "");
const conPuntos = (s) => {
  const d = soloDigitos(s);
  if (d === "") return "0";
  return fmt(Number(d));
};

function mesesHasta(mes, anio) {
  const idx = MESES.indexOf(mes);
  if (idx < 0 || !anio) return null;
  return (Number(anio) - ANIO_ACTUAL) * 12 + (idx - HOY.getMonth());
}

function horizonte(m) {
  if (m === null) return null;
  if (m <= 24) return { label: "Corto plazo", tono: "corto" };
  if (m <= 84) return { label: "Mediano plazo", tono: "medio" };
  return { label: "Largo plazo", tono: "largo" };
}

const css = `
  .tmg-root *{box-sizing:border-box}
  html,body,#root{background:${BLACK};margin:0;padding:0;min-height:100%}
  .tmg-root{background:${BLACK};color:${OFF};font-family:Arial,Helvetica,sans-serif;min-height:100vh;padding:0 0 80px}
  .tmg-wrap{max-width:760px;margin:0 auto;padding:0 24px}
  .tmg-serif{font-family:Georgia,'Times New Roman',serif}
  .tmg-kicker{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${GOLD};font-weight:700}
  .tmg-h1{font-family:Georgia,serif;font-size:34px;line-height:1.18;margin:10px 0 0;font-weight:400}
  .tmg-h2{font-family:Georgia,serif;font-size:22px;line-height:1.25;margin:0;font-weight:400}
  .tmg-lead{color:${MUTED};font-size:14.5px;line-height:1.65;margin:14px 0 0}
  .tmg-brand{text-align:center;padding:34px 0 10px}
  .tmg-brand .m{font-family:Georgia,serif;font-size:26px;letter-spacing:.24em;color:${GOLD}}
  .tmg-brand .s{font-size:9px;letter-spacing:.32em;color:${MUTED};margin-top:5px;text-transform:uppercase}
  .tmg-bar{display:flex;align-items:center;gap:16px;margin:26px 0 30px}
  .tmg-track{flex:1;height:2px;background:${LINE};position:relative;overflow:hidden}
  .tmg-fill{position:absolute;inset:0 auto 0 0;background:${GOLD};transition:width .45s cubic-bezier(.4,0,.2,1)}
  .tmg-step{font-size:11px;letter-spacing:.14em;color:${MUTED};white-space:nowrap}
  .tmg-back{background:none;border:none;color:${MUTED};font-size:12.5px;cursor:pointer;padding:0;font-family:inherit}
  .tmg-back:hover{color:${GOLD}}
  .tmg-card{background:${CARD};border:1px solid ${LINE};border-radius:5px;padding:22px}
  .tmg-card + .tmg-card{margin-top:14px}
  .tmg-label{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${GOLD};font-weight:700;margin-bottom:7px}
  .tmg-help{font-size:12px;color:${MUTED};line-height:1.55;margin:-2px 0 9px}
  .tmg-input,.tmg-select,.tmg-textarea{width:100%;background:${CHARCOAL};border:1px solid ${LINE};border-radius:4px;color:${OFF};
    font-family:inherit;font-size:14.5px;padding:11px 13px;outline:none;transition:border-color .18s}
  .tmg-input:focus,.tmg-select:focus,.tmg-textarea:focus{border-color:${GOLD}}
  .tmg-textarea{resize:vertical;min-height:66px;line-height:1.55}
  .tmg-select{appearance:none;cursor:pointer;
    background-image:linear-gradient(45deg,transparent 50%,${MUTED} 50%),linear-gradient(135deg,${MUTED} 50%,transparent 50%);
    background-position:calc(100% - 17px) 50%,calc(100% - 12px) 50%;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
  .tmg-select option{background:${CHARCOAL};color:${OFF}}
  .tmg-field{margin-top:17px}
  .tmg-field:first-child{margin-top:0}
  .tmg-row{display:flex;gap:12px}
  .tmg-row > *{flex:1;min-width:0}
  .tmg-prefix{position:relative}
  .tmg-prefix .p{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:${MUTED};font-size:14px;pointer-events:none}
  .tmg-prefix input{padding-left:44px}
  .tmg-btn{background:${GOLD};color:${BLACK};border:none;border-radius:4px;font-family:inherit;font-size:14px;font-weight:700;
    padding:13px 26px;cursor:pointer;transition:background .18s,opacity .18s}
  .tmg-btn:hover:not(:disabled){background:${GOLD_PALE}}
  .tmg-btn:disabled{opacity:.32;cursor:not-allowed}
  .tmg-btn-ghost{background:none;border:1px solid ${LINE};color:${OFF}}
  .tmg-btn-ghost:hover{border-color:${GOLD};background:none}
  .tmg-actions{display:flex;gap:12px;align-items:center;margin-top:26px;flex-wrap:wrap}
  .tmg-err{color:#C97A5A;font-size:12.5px;margin-top:8px}
  .tmg-tag{display:inline-block;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;padding:4px 9px;border-radius:3px;font-weight:700}
  .t-corto{background:rgba(197,165,90,.12);color:${GOLD_PALE};border:1px solid rgba(197,165,90,.3)}
  .t-medio{background:rgba(197,165,90,.07);color:${GOLD};border:1px solid rgba(197,165,90,.2)}
  .t-largo{background:rgba(255,255,255,.04);color:${MUTED};border:1px solid ${LINE}}
  .tmg-item{background:${CARD};border:1px solid ${LINE};border-radius:5px;padding:16px 18px;display:flex;gap:14px;align-items:flex-start}
  .tmg-item + .tmg-item{margin-top:10px}
  .tmg-rank{font-family:Georgia,serif;font-size:26px;color:${GOLD};line-height:1;width:34px;flex-shrink:0;padding-top:2px}
  .tmg-move{display:flex;flex-direction:column;gap:4px;flex-shrink:0}
  .tmg-move button{background:none;border:1px solid ${LINE};color:${MUTED};border-radius:3px;width:26px;height:22px;
    cursor:pointer;font-size:10px;line-height:1;transition:all .16s}
  .tmg-move button:hover:not(:disabled){border-color:${GOLD};color:${GOLD}}
  .tmg-move button:disabled{opacity:.25;cursor:not-allowed}
  .tmg-chk{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:13px;color:${MUTED};user-select:none}
  .tmg-chk input{appearance:none;width:16px;height:16px;border:1px solid ${LINE};border-radius:3px;background:${CHARCOAL};cursor:pointer;
    flex-shrink:0;position:relative;transition:all .16s}
  .tmg-chk input:checked{background:${GOLD};border-color:${GOLD}}
  .tmg-chk input:checked::after{content:'';position:absolute;left:5px;top:1.5px;width:4px;height:8px;
    border:solid ${BLACK};border-width:0 2px 2px 0;transform:rotate(45deg)}
  .tmg-chk input:disabled{opacity:.3;cursor:not-allowed}
  .tmg-total{border:1px solid ${LINE};border-left:3px solid ${GOLD};background:${CARD};border-radius:4px;padding:24px;margin-top:22px}
  .tmg-total .n{font-family:Georgia,serif;font-size:42px;color:${GOLD};line-height:1;letter-spacing:-.01em}
  .tmg-stat{display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;border-bottom:1px solid ${LINE};font-size:13.5px}
  .tmg-stat:last-child{border-bottom:none}
  .tmg-stat .k{color:${MUTED}}
  .tmg-stat .v{color:${OFF};font-weight:700}
  .tmg-note{font-size:12.5px;color:${MUTED};line-height:1.65}
  .tmg-del{background:none;border:none;color:${MUTED};font-size:12px;cursor:pointer;padding:0;font-family:inherit;text-decoration:underline}
  .tmg-del:hover{color:#C97A5A}
  .tmg-copybox{background:${CHARCOAL};border:1px solid ${LINE};border-radius:4px;padding:18px;font-family:'SF Mono',Menlo,monospace;
    font-size:11.5px;line-height:1.75;color:${MUTED};white-space:pre-wrap;max-height:290px;overflow:auto;margin-top:14px}
  .tmg-foot{text-align:center;font-size:11px;color:#5C574E;line-height:1.7;margin-top:44px;padding-top:22px;border-top:1px solid ${LINE}}
  @media(max-width:560px){
    .tmg-h1{font-size:27px}.tmg-row{flex-direction:column}.tmg-total .n{font-size:34px}
  }
`;

export default function PlanificadorObjetivos() {
  const [pantalla, setPantalla] = useState("intro");
  const [objetivos, setObjetivos] = useState([nuevoObjetivo()]);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const textoRef = useRef(null);

  const set = (id, campo, valor) => {
    setObjetivos((o) => o.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
    setError("");
  };

  const agregar = () => setObjetivos((o) => [...o, nuevoObjetivo()]);
  const borrar = (id) => setObjetivos((o) => o.filter((x) => x.id !== id));

  const mover = (i, dir) => {
    setObjetivos((o) => {
      const n = [...o];
      const j = i + dir;
      if (j < 0 || j >= n.length) return o;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  const toggleInneg = (id) => {
    setObjetivos((o) => {
      const actual = o.find((x) => x.id === id);
      const cuenta = o.filter((x) => x.innegociable).length;
      if (!actual.innegociable && cuenta >= 2) {
        setError("Máximo dos innegociables. Si todo es innegociable, nada lo es.");
        return o;
      }
      setError("");
      return o.map((x) => (x.id === id ? { ...x, innegociable: !x.innegociable } : x));
    });
  };

  const validarCarga = () => {
    if (objetivos.length === 0) return "Cargá al menos un objetivo.";
    for (const o of objetivos) {
      if (!o.nombre.trim()) return "Falta el nombre de uno de los objetivos.";
      if (!o.monto || Number(o.monto) <= 0) return `Falta el monto de "${o.nombre}". Averigualo antes de seguir.`;
      if (o.fuente.trim().length < 8) return `En "${o.nombre}" falta de dónde sacaste el monto.`;
      if (!o.mes || !o.anio) return `Falta la fecha de "${o.nombre}". Mes y año, no un rango.`;
      const m = mesesHasta(o.mes, o.anio);
      if (m !== null && m < 0) return `La fecha de "${o.nombre}" ya pasó.`;
    }
    return "";
  };

  const validarDetalle = () => {
    for (const o of objetivos) {
      if (!o.siNo.trim()) return `En "${o.nombre}" falta responder qué pasa si no lo lográs en esa fecha.`;
      if (!o.cambio.trim()) return `En "${o.nombre}" falta responder qué cambia el día que lo tengas.`;
    }
    return "";
  };

  const totales = useMemo(() => {
    const total = objetivos.reduce((s, o) => s + (Number(o.monto) || 0), 0);
    const asignado = objetivos.reduce((s, o) => s + (Number(o.asignado) || 0), 0);
    const inneg = objetivos.filter((o) => o.innegociable).reduce((s, o) => s + (Number(o.monto) || 0), 0);
    const conMeses = objetivos
      .map((o) => ({ o, m: mesesHasta(o.mes, o.anio) }))
      .filter((x) => x.m !== null)
      .sort((a, b) => a.m - b.m);
    return { total, asignado, inneg, falta: total - asignado, masCercano: conMeses[0] || null };
  }, [objetivos]);

  const texto = useMemo(() => {
    const l = [];
    l.push("PLANIFICADOR DE OBJETIVOS — TMG");
    l.push(`Fecha: ${HOY.toLocaleDateString("es-AR")}`);
    l.push("");
    l.push(`Total de todo lo que quiero lograr: USD ${fmt(totales.total)}`);
    l.push(`Ya tengo asignado a estos objetivos: USD ${fmt(totales.asignado)}`);
    l.push(`Me falta reunir: USD ${fmt(totales.falta)}`);
    if (totales.inneg > 0) l.push(`Suma de los innegociables: USD ${fmt(totales.inneg)}`);
    if (totales.masCercano) {
      const { o } = totales.masCercano;
      l.push(`Objetivo más cercano en el tiempo: ${o.nombre} (${o.mes} ${o.anio})`);
    }
    l.push("");
    l.push("MIS OBJETIVOS, EN ORDEN DE PRIORIDAD");
    l.push("");
    objetivos.forEach((o, i) => {
      const m = mesesHasta(o.mes, o.anio);
      const h = horizonte(m);
      l.push(`${i + 1}. ${o.nombre} — USD ${fmt(Number(o.monto) || 0)} — ${o.mes} ${o.anio}${h ? ` (${h.label})` : ""}`);
      l.push(`   ${o.innegociable ? "Innegociable" : "Deseable"}`);
      l.push(`   De dónde saqué el monto: ${o.fuente.trim()}`);
      l.push(`   Ya tengo asignado: USD ${fmt(Number(o.asignado) || 0)}`);
      l.push(`   Si no lo logro en esa fecha: ${o.siNo.trim()}`);
      l.push(`   Qué cambia el día que lo tenga: ${o.cambio.trim()}`);
      l.push("");
    });
    return l.join("\n");
  }, [objetivos, totales]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      if (textoRef.current) {
        textoRef.current.select();
        document.execCommand("copy");
      }
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2600);
  };

  const pasos = ["intro", "carga", "detalle", "prioridad", "resumen"];
  const idx = pasos.indexOf(pantalla);
  const pct = pantalla === "intro" ? 0 : (idx / (pasos.length - 1)) * 100;

  const Header = ({ kicker, titulo, lead, atras }) => (
    <>
      <div className="tmg-bar">
        {atras ? (
          <button className="tmg-back" onClick={() => { setPantalla(atras); setError(""); }}>← Volver</button>
        ) : (
          <span style={{ width: 52 }} />
        )}
        <div className="tmg-track"><div className="tmg-fill" style={{ width: `${pct}%` }} /></div>
        <span className="tmg-step">{idx}/4</span>
      </div>
      <div className="tmg-kicker">{kicker}</div>
      <h1 className="tmg-h1">{titulo}</h1>
      {lead && <p className="tmg-lead">{lead}</p>}
    </>
  );

  return (
    <div className="tmg-root">
      <style>{css}</style>

      <div className="tmg-brand">
        <div className="m">TMG</div>
        <div className="s">The Money Game</div>
      </div>

      <div className="tmg-wrap">
        {pantalla === "intro" && (
          <div style={{ paddingTop: 40 }}>
            <div className="tmg-kicker">Planificador de objetivos</div>
            <h1 className="tmg-h1">Un objetivo que no tiene número<br />no es un objetivo</h1>
            <p className="tmg-lead">
              Es un deseo. Y los deseos no se planifican: se postergan.
            </p>
            <p className="tmg-lead">
              Acá vas a bajar a tierra todo lo que querés lograr con tu plata. Cada objetivo con un
              monto averiguado, una fecha concreta y un orden de prioridad. Sin eso, no hay cartera
              que se pueda armar.
            </p>
            <p className="tmg-lead">
              No vas a calcular cuánto aportar por mes — eso lo definimos juntos en la sesión. Lo que
              tenés que llevar es esta lista, hecha en serio.
            </p>
            <div className="tmg-actions">
              <button className="tmg-btn" onClick={() => setPantalla("carga")}>Empezar</button>
            </div>
          </div>
        )}

        {pantalla === "carga" && (
          <>
            <Header
              kicker="Paso 1 · Los números"
              titulo="¿Qué querés lograr?"
              lead="Uno por bloque. El monto tiene que estar averiguado, no estimado: buscá el precio real antes de escribirlo. Y la fecha va con mes y año, no en rangos."
              atras="intro"
            />
            <div style={{ marginTop: 26 }}>
              {objetivos.map((o, i) => (
                <div className="tmg-card" key={o.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span className="tmg-kicker">Objetivo {i + 1}</span>
                    {objetivos.length > 1 && (
                      <button className="tmg-del" onClick={() => borrar(o.id)}>Quitar</button>
                    )}
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">Qué es</label>
                    <input
                      className="tmg-input"
                      value={o.nombre}
                      placeholder="Auto usado, viaje a Europa, comprarme un departamento"
                      onChange={(e) => set(o.id, "nombre", e.target.value)}
                    />
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">Cuánto cuesta, en dólares</label>
                    <div className="tmg-prefix">
                      <span className="p">USD</span>
                      <input
                        className="tmg-input"
                        type="text"
                        inputMode="numeric"
                        value={conPuntos(o.monto)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => set(o.id, "monto", soloDigitos(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">De dónde sacaste ese número</label>
                    <p className="tmg-help">
                      Esta es la parte que separa un objetivo real de uno inventado. Un link, un
                      presupuesto, un precio que viste. Si no lo sabés, averigualo ahora.
                    </p>
                    <input
                      className="tmg-input"
                      value={o.fuente}
                      placeholder="Corolla 2019 en MercadoLibre, promedio de las publicaciones"
                      onChange={(e) => set(o.id, "fuente", e.target.value)}
                    />
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">Para cuándo</label>
                    <div className="tmg-row">
                      <select className="tmg-select" value={o.mes} onChange={(e) => set(o.id, "mes", e.target.value)}>
                        <option value="">Mes</option>
                        {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select className="tmg-select" value={o.anio} onChange={(e) => set(o.id, "anio", e.target.value)}>
                        <option value="">Año</option>
                        {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    {(() => {
                      const h = horizonte(mesesHasta(o.mes, o.anio));
                      return h ? (
                        <div style={{ marginTop: 10 }}>
                          <span className={`tmg-tag t-${h.tono}`}>{h.label}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">Cuánto tenés hoy destinado a esto</label>
                    <p className="tmg-help">Plata que ya está apartada para este objetivo puntual. Si no hay nada, poné 0.</p>
                    <div className="tmg-prefix">
                      <span className="p">USD</span>
                      <input
                        className="tmg-input"
                        type="text"
                        inputMode="numeric"
                        value={conPuntos(o.asignado)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => set(o.id, "asignado", soloDigitos(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="tmg-actions">
              <button className="tmg-btn tmg-btn-ghost" onClick={agregar}>Agregar otro objetivo</button>
              <button
                className="tmg-btn"
                onClick={() => {
                  const e = validarCarga();
                  if (e) { setError(e); return; }
                  setError("");
                  setPantalla("detalle");
                }}
              >
                Continuar
              </button>
            </div>
            {error && <p className="tmg-err">{error}</p>}
          </>
        )}

        {pantalla === "detalle" && (
          <>
            <Header
              kicker="Paso 2 · Detrás del número"
              titulo="Ahora, para qué"
              lead="Un objetivo es una fecha y un monto, pero también es algo que querés que pase en tu vida. Estas dos preguntas son las que después sostienen la disciplina cuando el mercado se pone incómodo."
              atras="carga"
            />
            <div style={{ marginTop: 26 }}>
              {objetivos.map((o, i) => (
                <div className="tmg-card" key={o.id}>
                  <div style={{ marginBottom: 15 }}>
                    <span className="tmg-kicker">Objetivo {i + 1}</span>
                    <h2 className="tmg-h2" style={{ marginTop: 7 }}>{o.nombre}</h2>
                    <p className="tmg-note" style={{ marginTop: 5 }}>
                      USD {fmt(Number(o.monto) || 0)} · {o.mes} {o.anio}
                    </p>
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">¿Qué pasa si no lo lográs en esa fecha?</label>
                    <textarea
                      className="tmg-textarea"
                      value={o.siNo}
                      placeholder="No pasa nada grave, lo corro seis meses / Pierdo la seña / Se me complica el laburo"
                      onChange={(e) => set(o.id, "siNo", e.target.value)}
                    />
                  </div>

                  <div className="tmg-field">
                    <label className="tmg-label">¿Qué cambia en tu vida el día que lo tengas?</label>
                    <textarea
                      className="tmg-textarea"
                      value={o.cambio}
                      placeholder="Dejo de pagar alquiler / Puedo viajar sin pedir permiso / Me saco un peso de encima"
                      onChange={(e) => set(o.id, "cambio", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="tmg-actions">
              <button
                className="tmg-btn"
                onClick={() => {
                  const e = validarDetalle();
                  if (e) { setError(e); return; }
                  setError("");
                  setPantalla("prioridad");
                }}
              >
                Continuar
              </button>
            </div>
            {error && <p className="tmg-err">{error}</p>}
          </>
        )}

        {pantalla === "prioridad" && (
          <>
            <Header
              kicker="Paso 3 · El orden"
              titulo="Ordenalos. Sin empates."
              lead="Si tenés cinco objetivos, hay un primero y hay un último. Decidir cuál va último es la mitad del ejercicio. Después marcá como innegociables los que no se tocan: máximo dos."
              atras="detalle"
            />
            <div style={{ marginTop: 26 }}>
              {objetivos.map((o, i) => {
                const h = horizonte(mesesHasta(o.mes, o.anio));
                return (
                  <div className="tmg-item" key={o.id}>
                    <div className="tmg-rank">{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 className="tmg-h2" style={{ fontSize: 18 }}>{o.nombre}</h2>
                      <p className="tmg-note" style={{ marginTop: 5 }}>
                        USD {fmt(Number(o.monto) || 0)} · {o.mes} {o.anio}
                        {h && <> · <span style={{ color: GOLD_DARK }}>{h.label}</span></>}
                      </p>
                      <label className="tmg-chk" style={{ marginTop: 11 }}>
                        <input
                          type="checkbox"
                          checked={o.innegociable}
                          onChange={() => toggleInneg(o.id)}
                        />
                        Innegociable
                      </label>
                    </div>
                    <div className="tmg-move">
                      <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">▲</button>
                      <button onClick={() => mover(i, 1)} disabled={i === objetivos.length - 1} aria-label="Bajar">▼</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="tmg-actions">
              <button className="tmg-btn" onClick={() => { setError(""); setPantalla("resumen"); }}>
                Ver el resumen
              </button>
            </div>
            {error && <p className="tmg-err">{error}</p>}
          </>
        )}

        {pantalla === "resumen" && (
          <>
            <Header
              kicker="Paso 4 · El resumen"
              titulo="Esto es lo que querés"
              atras="prioridad"
            />

            <div className="tmg-total">
              <div className="tmg-kicker">Total de todo lo que querés lograr</div>
              <div className="n" style={{ marginTop: 12 }}>USD {fmt(totales.total)}</div>
              <p className="tmg-note" style={{ marginTop: 14 }}>
                Es un número grande y está bien que lo sea. No es lo que necesitás mañana: es la suma
                de cosas repartidas en el tiempo. Cómo se financia cada una lo vemos en la sesión.
              </p>
            </div>

            <div className="tmg-card" style={{ marginTop: 14 }}>
              <div className="tmg-stat">
                <span className="k">Ya tenés asignado</span>
                <span className="v">USD {fmt(totales.asignado)}</span>
              </div>
              <div className="tmg-stat">
                <span className="k">Te falta reunir</span>
                <span className="v">USD {fmt(totales.falta)}</span>
              </div>
              {totales.inneg > 0 && (
                <div className="tmg-stat">
                  <span className="k">Suma de los innegociables</span>
                  <span className="v">USD {fmt(totales.inneg)}</span>
                </div>
              )}
              {totales.masCercano && (
                <div className="tmg-stat">
                  <span className="k">Objetivo más cercano en el tiempo</span>
                  <span className="v">
                    {totales.masCercano.o.nombre} · {totales.masCercano.o.mes} {totales.masCercano.o.anio}
                  </span>
                </div>
              )}
            </div>

            {totales.masCercano && (
              <div className="tmg-card" style={{ marginTop: 14, borderLeft: `3px solid ${GOLD}` }}>
                <div className="tmg-kicker">Prestá atención a esto</div>
                <p className="tmg-note" style={{ marginTop: 9 }}>
                  Tu objetivo más cercano es <strong style={{ color: OFF }}>{totales.masCercano.o.nombre}</strong>, y
                  es el que más condiciona todo lo demás. Cuanto menos plazo tiene un objetivo, menos
                  riesgo tolera — y eso limita dónde puede estar invertida esa plata, sin importar
                  cuánto riesgo estés dispuesto a asumir en el resto de la cartera.
                </p>
              </div>
            )}

            <div style={{ marginTop: 30 }}>
              <div className="tmg-kicker">Tus objetivos, en orden</div>
              <div style={{ marginTop: 14 }}>
                {objetivos.map((o, i) => {
                  const h = horizonte(mesesHasta(o.mes, o.anio));
                  return (
                    <div className="tmg-item" key={o.id}>
                      <div className="tmg-rank">{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 className="tmg-h2" style={{ fontSize: 18 }}>{o.nombre}</h2>
                        <p className="tmg-note" style={{ marginTop: 5 }}>
                          USD {fmt(Number(o.monto) || 0)} · {o.mes} {o.anio}
                        </p>
                        <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
                          {h && <span className={`tmg-tag t-${h.tono}`}>{h.label}</span>}
                          <span className={`tmg-tag ${o.innegociable ? "t-corto" : "t-largo"}`}>
                            {o.innegociable ? "Innegociable" : "Deseable"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tmg-card" style={{ marginTop: 30 }}>
              <div className="tmg-kicker">Último paso</div>
              <h2 className="tmg-h2" style={{ marginTop: 8 }}>Copialo y pegalo en tu Ficha de Inicio</h2>
              <p className="tmg-note" style={{ marginTop: 9 }}>
                Va en el paso de objetivos. Con esto en mano preparo tu sesión: ahí definimos cuánto
                va a cada uno y cómo se financia.
              </p>
              <div className="tmg-actions" style={{ marginTop: 18 }}>
                <button className="tmg-btn" onClick={copiar}>
                  {copiado ? "Copiado ✓" : "Copiar resultado para la ficha"}
                </button>
              </div>
              <div className="tmg-copybox">{texto}</div>
              <textarea
                ref={textoRef}
                readOnly
                value={texto}
                style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <p className="tmg-foot">
              Este planificador es una herramienta de ordenamiento personal. No constituye asesoramiento
              financiero. Los montos y plazos son los que vos definiste.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
