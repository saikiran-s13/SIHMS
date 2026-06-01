import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const STRUCTURES = [
  { id: 1, name: "Rajiv Gandhi Bridge",    type: "Bridge",    location: "NH-44, Delhi",        health: 87, status: "Healthy",      age: 18, lastInspection: "2026-03-15", risk: "Low"    },
  { id: 2, name: "Tech Hub Tower B",       type: "Building",  location: "Sector 62, Noida",    health: 43, status: "Critical",     age: 31, lastInspection: "2025-11-02", risk: "High"   },
  { id: 3, name: "Outer Ring Flyover",     type: "Flyover",   location: "Bangalore South",     health: 72, status: "Minor Damage", age: 12, lastInspection: "2026-01-28", risk: "Medium" },
  { id: 4, name: "Industrial Warehouse C", type: "Building",  location: "Pune MIDC",           health: 91, status: "Healthy",      age:  6, lastInspection: "2026-04-10", risk: "Low"    },
  { id: 5, name: "Metro Viaduct Sec-18",   type: "Viaduct",   location: "Noida Metro Line",    health: 58, status: "Minor Damage", age:  9, lastInspection: "2026-02-05", risk: "Medium" },
  { id: 6, name: "Old Town Reservoir Dam", type: "Dam",       location: "Nashik District",     health: 35, status: "Critical",     age: 54, lastInspection: "2025-09-20", risk: "High"   },
];

const generateSensorData = (base, variance, points = 20) =>
  Array.from({ length: points }, (_, i) => ({
    time: `${String(Math.floor(i * 1.2)).padStart(2, "0")}:${String((i * 3) % 60).padStart(2, "0")}`,
    value: +(base + (Math.random() - 0.5) * variance * 2).toFixed(2),
  }));

const statusColor = (s) => ({ Healthy: "#00e5a0", "Minor Damage": "#f5a623", Critical: "#ff3b5c" }[s] || "#aaa");
const healthColor = (h) => h >= 75 ? "#00e5a0" : h >= 50 ? "#f5a623" : "#ff3b5c";
const riskBg   = (r) => ({ Low: "rgba(0,229,160,0.12)", Medium: "rgba(245,166,35,0.12)", High: "rgba(255,59,92,0.12)" }[r]);
const riskText = (r) => ({ Low: "#00e5a0", Medium: "#f5a623", High: "#ff3b5c" }[r]);

const ALERT_LOG = [
  { time: "14:32", structure: "Tech Hub Tower B",       msg: "Strain gauge SG-04 exceeds threshold (420 µε)",          level: "Critical" },
  { time: "13:58", structure: "Old Town Reservoir Dam", msg: "Settlement rate 3.2mm/month — accelerating",             level: "Critical" },
  { time: "12:10", structure: "Outer Ring Flyover",     msg: "Vibration frequency shift detected on Span 3",           level: "Warning"  },
  { time: "11:44", structure: "Metro Viaduct Sec-18",   msg: "Corrosion index elevated — Schedule inspection",         level: "Warning"  },
  { time: "09:15", structure: "Rajiv Gandhi Bridge",    msg: "All sensors nominal. Health report generated.",          level: "Info"     },
];

export default function SIHMSDashboard() {
  const [selected, setSelected]         = useState(STRUCTURES[1]);
  const [tab, setTab]                   = useState("overview");
  const [sensorData, setSensorData]     = useState({
    vibration:   generateSensorData(2.4, 1.8),
    strain:      generateSensorData(180, 60),
    temperature: generateSensorData(34, 4),
    tilt:        generateSensorData(0.8, 0.5),
  });
  const [aiResult, setAiResult]         = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone]     = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        vibration:   generateSensorData(selected.health < 50 ? 5.2 : 2.1, 2.0),
        strain:      generateSensorData(selected.health < 50 ? 380 : 160, 70),
        temperature: generateSensorData(34, 3),
        tilt:        generateSensorData(selected.health < 50 ? 2.1 : 0.6, 0.4),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  const runAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    const avg = (arr) => arr.slice(-5).reduce((a, b) => a + b.value, 0) / 5 | 0;
    const prompt = `You are an AI structural health monitoring engine. Analyze the following data for "${selected.name}" (${selected.type}, ${selected.age} years old):
- Health Score: ${selected.health}/100
- Status: ${selected.status}
- Risk Level: ${selected.risk}
- Vibration (avg): ${avg(sensorData.vibration)} mm/s
- Strain (avg): ${avg(sensorData.strain)} µε
- Tilt (avg): ${avg(sensorData.tilt)}°

Respond in JSON only, no markdown, no extra text:
{
  "damageClass": "Healthy|Minor Damage|Critical",
  "rul": "<estimated remaining useful life in years>",
  "maintenancePriority": "Low|Medium|High|Immediate",
  "recommendation": "<2-3 sentence engineering recommendation>",
  "estimatedCost": "<cost range in INR lakhs>"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content.map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      setAiResult(JSON.parse(clean));
    } catch (e) {
      setAiResult({
        damageClass: "Error", rul: "—", maintenancePriority: "—",
        recommendation: "AI engine unavailable. Check API connection.",
        estimatedCost: "—"
      });
    }
    setAiLoading(false);
  };

  const generateReport = () => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setReportDone(true);
      setTimeout(() => setReportDone(false), 3000);
    }, 2000);
  };

  const critical  = STRUCTURES.filter((s) => s.status === "Critical").length;
  const warning   = STRUCTURES.filter((s) => s.status === "Minor Damage").length;
  const healthy   = STRUCTURES.filter((s) => s.status === "Healthy").length;
  const avgHealth = Math.round(STRUCTURES.reduce((a, s) => a + s.health, 0) / STRUCTURES.length);

  // ── TOOLTIP STYLE ──────────────────────────────────────────────────────────
  const ttStyle = { background: "#1e1108", border: "1px solid #3d2510", borderRadius: 4, fontSize: 11, color: "#d4b896" };

  return (
    <div style={{
      minHeight: "100vh", background: "#1a0f09", color: "#f0e0c8",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1e1108; }
        ::-webkit-scrollbar-thumb { background: #5c3418; border-radius: 2px; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .fadein { animation: fadein 0.4s ease; }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .card { background: #1e1108; border: 1px solid #3d2510; border-radius: 8px; transition: border-color 0.2s; }
        .card:hover { border-color: #7a4e28; }
        .btn { cursor: pointer; border: none; border-radius: 6px; font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.18s; }
        .str-row { cursor: pointer; border-radius: 6px; padding: 10px 12px; transition: background 0.15s; margin-bottom: 4px; }
        .str-row:hover { background: #2a1a0e; }
        .tab { cursor: pointer; padding: 6px 16px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.15s; }
      `}</style>

      {/* TOP NAV */}
      <div style={{
        background: "#150c07", borderBottom: "1px solid #3d2510", padding: "0 24px",
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn" onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "#3d2510", color: "#c8a882", padding: "6px 10px" }}>☰</button>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#c8a882", letterSpacing: "0.04em" }}>SIHMS</span>
          <span style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.12em" }}>STRUCTURAL HEALTH MONITORING SYSTEM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#00e5a0" }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e5a0", display: "inline-block" }} />
            LIVE · {new Date().toLocaleTimeString()}
          </div>
          <div style={{ fontSize: 11, color: "#a07850" }}>v2.4.1 · 6 structures monitored</div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR */}
        {sidebarOpen && (
          <div style={{
            width: 260, background: "#150c07", borderRight: "1px solid #3d2510",
            padding: "16px 12px", overflowY: "auto", flexShrink: 0
          }}>
            <div style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.14em", marginBottom: 10, padding: "0 4px" }}>
              MONITORED STRUCTURES
            </div>
            {STRUCTURES.map((s) => (
              <div key={s.id} className="str-row"
                onClick={() => { setSelected(s); setAiResult(null); setTab("overview"); }}
                style={{
                  background: selected.id === s.id ? "#2a1a0e" : "transparent",
                  border: selected.id === s.id ? "1px solid #5c3418" : "1px solid transparent"
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected.id === s.id ? "#c8a882" : "#d4b896", lineHeight: 1.3 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#a07850", marginTop: 2 }}>{s.type} · {s.age}yrs</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: healthColor(s.health) }}>{s.health}%</div>
                    <div style={{ fontSize: 9, color: statusColor(s.status), fontWeight: 600 }}>{s.status.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ marginTop: 6, height: 3, background: "#3d2510", borderRadius: 2 }}>
                  <div style={{ width: `${s.health}%`, height: "100%", background: healthColor(s.health), borderRadius: 2, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, fontSize: 10, color: "#a07850", letterSpacing: "0.14em", marginBottom: 10, padding: "0 4px" }}>
              LIVE ALERTS
            </div>
            {ALERT_LOG.slice(0, 3).map((a, i) => (
              <div key={i} style={{
                background: "#1e1108",
                border: `1px solid ${a.level === "Critical" ? "#3d1510" : a.level === "Warning" ? "#3d2808" : "#3d2510"}`,
                borderRadius: 6, padding: "8px 10px", marginBottom: 6
              }}>
                <div style={{ fontSize: 10, color: a.level === "Critical" ? "#ff3b5c" : a.level === "Warning" ? "#f5a623" : "#a07850", fontWeight: 600 }}>
                  {a.level.toUpperCase()} · {a.time}
                </div>
                <div style={{ fontSize: 10, color: "#d4b896", marginTop: 2, lineHeight: 1.4 }}>{a.msg}</div>
              </div>
            ))}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>

          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Critical Structures", val: critical,          color: "#ff3b5c",            icon: "⚠️" },
              { label: "Minor Damage",         val: warning,           color: "#f5a623",            icon: "◈"  },
              { label: "Healthy",              val: healthy,           color: "#00e5a0",            icon: "✓"  },
              { label: "Avg Health Score",     val: `${avgHealth}%`,  color: healthColor(avgHealth), icon: "◉" },
            ].map((c) => (
              <div key={c.label} className="card fadein" style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: c.color, fontFamily: "'Syne',sans-serif" }}>{c.val}</div>
                <div style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.1em", marginTop: 2 }}>{c.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* SELECTED STRUCTURE HEADER */}
          <div className="card fadein" style={{
            padding: "18px 22px", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#f5e6d0" }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "#a07850", marginTop: 3 }}>
                {selected.type} · {selected.location} · Age: {selected.age} years · Last Inspection: {selected.lastInspection}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: healthColor(selected.health), fontFamily: "'Syne',sans-serif" }}>
                  {selected.health}<span style={{ fontSize: 14 }}>%</span>
                </div>
                <div style={{ fontSize: 9, color: "#a07850", letterSpacing: "0.12em" }}>HEALTH INDEX</div>
              </div>
              <div style={{
                padding: "6px 14px", background: riskBg(selected.risk),
                border: `1px solid ${riskText(selected.risk)}33`, borderRadius: 6
              }}>
                <div style={{ fontSize: 9, color: "#a07850", letterSpacing: "0.12em" }}>RISK</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: riskText(selected.risk) }}>{selected.risk.toUpperCase()}</div>
              </div>
              <div style={{
                padding: "6px 14px",
                background: `${statusColor(selected.status)}15`,
                border: `1px solid ${statusColor(selected.status)}44`,
                borderRadius: 6
              }}>
                <div style={{ fontSize: 9, color: "#a07850", letterSpacing: "0.12em" }}>STATUS</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: statusColor(selected.status) }}>{selected.status.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["overview", "sensors", "ai analysis", "alerts"].map((t) => (
              <button key={t} className="tab" onClick={() => setTab(t)} style={{
                background: tab === t ? "#4a2e14" : "#1e1108",
                color:      tab === t ? "#c8a882" : "#a07850",
                border:     `1px solid ${tab === t ? "#7a5030" : "#3d2510"}`
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <div className="fadein">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {/* Vibration chart */}
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "#a07850", letterSpacing: "0.1em", marginBottom: 12 }}>VIBRATION (mm/s) — LIVE</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={sensorData.vibration}>
                      <defs>
                        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#c8a882" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#c8a882" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3d2510" />
                      <XAxis dataKey="time" tick={{ fill: "#a07850", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#a07850", fontSize: 9 }} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area type="monotone" dataKey="value" stroke="#c8a882" fill="url(#vg)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Strain chart */}
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "#a07850", letterSpacing: "0.1em", marginBottom: 12 }}>STRAIN GAUGE (µε) — LIVE</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={sensorData.strain}>
                      <defs>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={selected.health < 50 ? "#ff3b5c" : "#00e5a0"} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={selected.health < 50 ? "#ff3b5c" : "#00e5a0"} stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3d2510" />
                      <XAxis dataKey="time" tick={{ fill: "#a07850", fontSize: 9 }} />
                      <YAxis tick={{ fill: "#a07850", fontSize: 9 }} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area
                        type="monotone" dataKey="value"
                        stroke={selected.health < 50 ? "#ff3b5c" : "#00e5a0"}
                        fill="url(#sg)" strokeWidth={2} dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metric cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Natural Frequency", val: selected.health < 50 ? "2.18 Hz"  : "3.42 Hz",  note: selected.health < 50 ? "↓ Degraded"       : "Nominal",        color: selected.health < 50 ? "#ff3b5c" : "#00e5a0" },
                  { label: "Max Deflection",    val: selected.health < 50 ? "L/312"    : "L/820",    note: selected.health < 50 ? "↑ Exceeds limit"   : "Within IS:456",  color: selected.health < 50 ? "#f5a623" : "#00e5a0" },
                  { label: "Corrosion Index",   val: selected.health < 50 ? "CI 4.1"   : "CI 1.2",   note: selected.health < 50 ? "High"              : "Acceptable",     color: selected.health < 50 ? "#ff3b5c" : "#c8a882" },
                ].map((m) => (
                  <div key={m.label} className="card" style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.1em" }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: "'Syne',sans-serif", margin: "6px 0 2px" }}>{m.val}</div>
                    <div style={{ fontSize: 10, color: m.color }}>{m.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SENSORS TAB ── */}
          {tab === "sensors" && (
            <div className="fadein">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "VIBRATION SENSOR (mm/s)", key: "vibration",   color: "#c8a882",                                         unit: "mm/s" },
                  { label: "STRAIN GAUGE (µε)",        key: "strain",      color: selected.health < 50 ? "#ff3b5c" : "#00e5a0",     unit: "µε"   },
                  { label: "TEMPERATURE (°C)",          key: "temperature", color: "#f5a623",                                         unit: "°C"   },
                  { label: "TILT SENSOR (°)",           key: "tilt",        color: "#d4956a",                                         unit: "°"    },
                ].map((s) => (
                  <div key={s.key} className="card" style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: "#a07850", letterSpacing: "0.1em" }}>{s.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                        <span style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>
                          {sensorData[s.key].slice(-1)[0]?.value} {s.unit}
                        </span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={sensorData[s.key]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3d2510" />
                        <XAxis dataKey="time" tick={{ fill: "#a07850", fontSize: 9 }} />
                        <YAxis tick={{ fill: "#a07850", fontSize: 9 }} />
                        <Tooltip contentStyle={ttStyle} />
                        <Line type="monotone" dataKey="value" stroke={s.color} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI ANALYSIS TAB ── */}
          {tab === "ai analysis" && (
            <div className="fadein">
              <div className="card" style={{ padding: "24px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "#a07850", marginBottom: 8 }}>
                  AI-powered structural damage classification using real-time sensor data
                </div>
                <div style={{ fontSize: 11, color: "#7a4e28", marginBottom: 20 }}>
                  Model: Random Forest + LSTM · Dataset: ASCE SHM Benchmark
                </div>
                <button className="btn" onClick={runAI} disabled={aiLoading} style={{
                  background: aiLoading ? "#3d2510" : "linear-gradient(135deg,#1a4a7a,#0a6a9a)",
                  color: aiLoading ? "#a07850" : "#c8a882",
                  padding: "12px 32px", fontSize: 12, letterSpacing: "0.12em"
                }}>
                  {aiLoading ? "⟳ ANALYZING SENSOR DATA..." : "▶️  RUN AI DAMAGE ANALYSIS"}
                </button>
                {aiLoading && (
                  <div style={{ fontSize: 11, color: "#a07850", marginTop: 12 }}>
                    Processing vibration frequencies · Running LSTM model · Classifying damage state<span className="blink">_</span>
                  </div>
                )}
              </div>

              {aiResult && (
                <div className="fadein" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Damage Classification", val: aiResult.damageClass,      color: statusColor(aiResult.damageClass) },
                    { label: "Remaining Useful Life",  val: `${aiResult.rul} years`,  color: "#c8a882" },
                    { label: "Maintenance Priority",   val: aiResult.maintenancePriority,
                      color: riskText(aiResult.maintenancePriority === "Immediate" || aiResult.maintenancePriority === "High" ? "High" : aiResult.maintenancePriority === "Medium" ? "Medium" : "Low") },
                    { label: "Estimated Repair Cost",  val: `₹${aiResult.estimatedCost}`, color: "#f5a623" },
                  ].map((r) => (
                    <div key={r.label} className="card" style={{ padding: "18px", background: "#150c07" }}>
                      <div style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.12em" }}>{r.label.toUpperCase()}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: r.color, fontFamily: "'Syne',sans-serif", marginTop: 8 }}>{r.val}</div>
                    </div>
                  ))}
                  <div className="card" style={{ padding: "18px", gridColumn: "1/-1", background: "#150c07" }}>
                    <div style={{ fontSize: 10, color: "#a07850", letterSpacing: "0.12em", marginBottom: 10 }}>AI ENGINEERING RECOMMENDATION</div>
                    <div style={{ fontSize: 13, color: "#d4b896", lineHeight: 1.7 }}>{aiResult.recommendation}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ALERTS TAB ── */}
          {tab === "alerts" && (
            <div className="fadein">
              {ALERT_LOG.map((a, i) => (
                <div key={i} className="card" style={{
                  padding: "14px 18px", marginBottom: 10,
                  borderLeft: `3px solid ${a.level === "Critical" ? "#ff3b5c" : a.level === "Warning" ? "#f5a623" : "#a07850"}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                          color: a.level === "Critical" ? "#ff3b5c" : a.level === "Warning" ? "#f5a623" : "#a07850"
                        }}>{a.level.toUpperCase()}</span>
                        <span style={{ fontSize: 10, color: "#a07850" }}>· {a.structure}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#d4b896" }}>{a.msg}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#a07850", flexShrink: 0, marginLeft: 16 }}>{a.time}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <button className="btn" onClick={generateReport} disabled={reportLoading} style={{
                  background: reportLoading ? "#3d2510" : "#0d2a1a",
                  color: reportLoading ? "#a07850" : "#00e5a0",
                  border: "1px solid #00e5a044", padding: "10px 24px"
                }}>
                  {reportLoading ? "⟳ GENERATING REPORT..." : reportDone ? "✓ REPORT READY" : "⬇️ GENERATE PDF INSPECTION REPORT"}
                </button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div style={{
            marginTop: 32, padding: "16px 0", borderTop: "1px solid #3d2510",
            display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a07850"
          }}>
            <span>SIHMS v2.4.1 · Smart Infrastructure Health Monitoring System</span>
            <span>Built with React · FastAPI · TensorFlow · IS:1893 / IRC:6 Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
