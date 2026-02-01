import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

// --- GAMING FONTOVI ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Inter:wght@300;400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

const STRIKER_LABELS = [
  "First Striker",
  "Second Striker",
  "Third Striker",
  "Cleanup 1",
  "Cleanup 2",
  "Cleanup 3",
  "Cleanup 4",
  "Cleanup 5",
  "Cleanup 6",
];

const RESULT_ORDER = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II",
  "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I",
  "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I",
  "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I",
  "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII",
  "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI",
  "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const TROOPS_WITH_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II",
  "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I",
  "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I",
  "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V",
  "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V",
];

const TROOPS_WITHOUT_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore",
  "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI",
  "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI",
  "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII",
  "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI",
  "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const WALL_KILLER_NAMES_RAW = [
  "Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII",
  "Siege Ballistae VI", "Catapult V", "Catapult IV",
];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n));
}
function normName(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

const ICON_FILE_MAP = {
  "Corax II": "Corax II.png", "Corax I": "Corax I.png", "Griffin VII": "Griffin VII.png",
  "Griffin VI": "Griffin VI.png", "Griffin V": "Griffin V.png", "Wyvern": "Wyvern.png",
  "Warregal": "Warregal.png", "Jago": "Jago.png", "Epic Monster Hunter": "Epic Monster Hunter.png",
  "Royal Lion II": "Royal Lion II.png", "Royal Lion I": "Royal Lion I.png", "Vulture VII": "Vulture VII.png",
  "Vulture VI": "Vulture VI.png", "Vulture V": "Vulture V.png", "Fire Phoenix II": "Fire Phoenix II.png",
  "Fire Phoenix I": "Fire Phoenix I.png", "Manticore": "Manticore.png", "Ariel": "Ariel.png",
  "Josephine II": "Josephine II.png", "Josephine I": "Josephine I.png", "Siege Ballistae VII": "Siege Ballistae VII.png",
  "Siege Ballistae VI": "Siege Ballistae VI.png", "Catapult V": "Catapult V.png", "Catapult IV": "Catapult IV.png",
  "Punisher I": "Punisher I.png", "Heavy Halberdier VII": "Heavy Halberdier VII.png", "Heavy Halberdier VI": "Heavy Halberdier VI.png",
  "Spearmen V": "Spearmen V.png", "Duelist I": "Duelist I.png", "Heavy Knight VII": "Heavy Knight VII.png",
  "Heavy Knight VI": "Heavy Knight VI.png", "Swordsmen V": "Swordsmen V.png",
};

const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `${ICON_BASE}icons/${encodeURIComponent(file)}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch { return false; }
  }
}

/* =========================
   THEME SETUP (GAMING LOOK)
========================= */
function usePrefersDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(!!e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);
  return isDark;
}

function makeTheme(isDark) {
  // Prilagođena Gaming Tema
  return {
    pageBg: "#050505",
    // Tamna kartica + "pro" zlatni odsjaj
    cardBg: "linear-gradient(180deg, rgba(20,22,28,0.98) 0%, rgba(12,13,16,0.98) 100%)",
    // Jači zlatni obrub (tražio si da bude vidljiviji)
    border: "rgba(197, 160, 89, 0.75)",
    borderSoft: "rgba(255, 255, 255, 0.08)",
    text: "#ececec",
    subtext: "#a0a0a0",
    inputBg: "linear-gradient(180deg, rgba(15,16,18,0.92) 0%, rgba(8,8,9,0.92) 100%)",
    inputBorder: "rgba(197, 160, 89, 0.55)",
    // Zlatni gumb
    btnBg: "linear-gradient(135deg, #c5a059 0%, #9a7b3a 100%)",
    btnText: "#000000",
    btnGhostBg: "rgba(255, 255, 255, 0.05)",
    btnGhostBorder: "rgba(197, 160, 89, 0.55)",
    overlay: "rgba(0,0,0,0.45)",
    bottomBarBg: "rgba(10, 10, 12, 0.98)",
    accent: "#c5a059", // Glavna zlatna boja
    danger: "#ff4d4d",
    shadow: "0 10px 30px rgba(0,0,0,0.7)",
    cardShadow: "0 10px 28px rgba(0,0,0,0.6)",
    goldGlow: "0 0 0 1px rgba(197,160,89,0.25), 0 0 18px rgba(197,160,89,0.12)",
    goldGlowStrong: "0 0 0 1px rgba(197,160,89,0.35), 0 0 26px rgba(197,160,89,0.18)",
  };
}

// 🛡️ CARD - Gaming stil
function Card({ title, children, theme }) {
  return (
    <div
      style={{
        border: `1.5px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        background: theme.cardBg,
        boxShadow: `${theme.cardShadow}, ${theme.goldGlow}`,
        marginBottom: 16,
        // Osiguravamo da dropdown može izaći van ako treba (ali ovdje koristimo Modal pa je ok)
        // Ali za svaki slučaj, kod gaming UI-a često želimo oštrije rubove ili glow
        position: "relative",
      }}
    >
      {/* Ukrasna linija lijevo */}
      <div style={{position: "absolute", left: 0, top: 16, bottom: 16, width: 3, background: theme.accent, borderRadius: "0 2px 2px 0"}}></div>
      
      <div style={{ 
        fontWeight: 700, 
        fontSize: 16, 
        marginBottom: 16, 
        color: theme.accent, // Zlatni naslov
        fontFamily: "'Cinzel', serif", 
        letterSpacing: "1px",
        textTransform: "uppercase",
        paddingLeft: 12 // Mjesto za liniju
      }}>
        {title}
      </div>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

// 🛡️ PICKER - Izgleda kao dropdown gumb
function TroopPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const display = value ? value : "— Select —";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: "pointer",
          background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)",
          boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)`
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {value ? (
            iconSrcForTroop(value) ? (
              <img
                src={iconSrcForTroop(value)}
                alt={value}
                width={36}
                height={36}
                style={{ borderRadius: 6, flexShrink: 0, border: "1px solid #333" }}
                loading="lazy"
              />
            ) : null
          ) : (
             // Placeholder ikona
             <div style={{width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px dashed #444"}}></div>
          )}

          <span
            style={{
              color: value ? theme.text : theme.subtext,
              fontWeight: 700,
              fontSize: 15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {display}
          </span>
        </span>

        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>

      {/* Modal koji glumi Dropdown - Z Position FIX: Z-index 2000 */}
      <Modal open={open} title={`Select ${label}`} onClose={() => setOpen(false)} theme={theme} isDropdown={true}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? "— None —" : opt;
            const isSelected = opt === value;
            return (
              <button
                key={opt || "__blank__"}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent",
                  background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? theme.accent : theme.text,
                  fontWeight: 600,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img
                    src={iconSrcForTroop(opt)}
                    alt={opt}
                    width={40}
                    height={40}
                    style={{ borderRadius: 6, flexShrink: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: 40, height: 40 }} />
                )}

                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

// 🛡️ OPTION PICKER - isti modal stil kao TroopPicker (za Android native select problem)
function OptionPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : "— Select —";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: "pointer",
          background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)",
          boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)`,
        }}
      >
        <span
          style={{
            color: selected ? theme.text : theme.subtext,
            fontWeight: 800,
            fontSize: 15,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {display}
        </span>

        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme} isDropdown={true}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 12px",
                  borderRadius: 10,
                  border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent",
                  background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? theme.accent : theme.text,
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, theme, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "8px 0",
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}
    >
      <div style={{ color: theme.subtext, fontSize: 13, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, color: accent ? theme.accent : theme.text, fontFamily: "'Inter', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

// 🛡️ MODAL - Popravljen Z-Index i izgled
function Modal({ open, title, onClose, children, theme, isDropdown }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: isDropdown ? "center" : "center", // Dropdown na sredini radi lakseg klika
        justifyContent: "center",
        padding: 20,
        zIndex: 9999, // <--- CRITICAL Z-INDEX FIX
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          background: "linear-gradient(180deg, rgba(24,26,32,0.82) 0%, rgba(14,15,18,0.82) 100%)",
          color: theme.text,
          borderRadius: 16,
          border: `1px solid ${theme.accent}`, // Zlatni okvir
          boxShadow: `0 0 30px rgba(197, 160, 89, 0.18), ${theme.goldGlowStrong}`,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "rgba(197, 160, 89, 0.05)",
            borderBottom: `1px solid ${theme.borderSoft}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Cinzel', serif", color: theme.accent, textTransform: "uppercase" }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: theme.text,
              width: 32,
              height: 32,
              fontSize: 24,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: 16,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];

  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I")))
      m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
    return m;
  }, [troops]);

  const troopByName = useMemo(
    () => new Map(troops.map((t) => [t.name, t])),
    [troops]
  );

  const additionalBonus = TB.additionalBonusNormal ?? {};
  const phoenixExtra = TB.phoenixExtra ?? {};
  const firstStrikerAllowed = TB.firstStrikerAllowed ?? {};

  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState(MODE_WITHOUT);

  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");

  const [warningMsg, setWarningMsg] = useState("");

  const GROUP_KEYS = useMemo(() => (["CORAX","PHOENIX","PHH_SPEAR","DUEL_HK_SW","VULTURE","ROYAL_LION","GRIFFIN"]), []);
  const [groupBonusPct, setGroupBonusPct] = useState(() => ({
    CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "",
  }));

  const getBonusGroup = (troopName) => {
    if (!troopName) return null;
    const n = normName(troopName);
    if (n === "jago") return "ROYAL_LION";
    if (n === "warregal" || n === "warregel") return "GRIFFIN";
    if (n.startsWith("corax")) return "CORAX";
    if (n.startsWith("fire phoenix")) return "PHOENIX";
    if (n.startsWith("vulture")) return "VULTURE";
    if (n.startsWith("royal lion")) return "ROYAL_LION";
    if (n.startsWith("griffin")) return "GRIFFIN";
    if (n.startsWith("punisher") || n.startsWith("heavy halberdier") || n.startsWith("spearmen"))
      return "PHH_SPEAR";
    if (n.startsWith("duelist") || n.startsWith("heavy knight") || n.startsWith("swordsmen"))
      return "DUEL_HK_SW";
    return null;
  };

  const getBaseStrength = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseStrength ?? t?.base_strength ?? t?.strength ?? t?.base ?? 0;
    return Number(v) || 0;
  };

  const getBaseHealth = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseHealth ?? t?.base_health ?? t?.health ?? t?.hp ?? 0;
    return Number(v) || 0;
  };

  const isFirstStrikerTroop = (troopName) => {
    if (!troopName) return false;
    const exact = canon.get(normName(troopName)) || troopName;
    const list = mode === MODE_WITH ? (firstStrikerAllowed.WITH || []) : (firstStrikerAllowed.WITHOUT || []);
    for (const n of list) {
      const nn = canon.get(normName(n)) || n;
      if (nn === exact) return true;
    }
    return false;
  };

  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);
  const [copyNotice, setCopyNotice] = useState("");

  const cit = TB.citadels?.[citadelLevel];
  const targets = useMemo(() => {
    if (!cit) return null;
    return mode === MODE_WITH ? cit.m8m9Targets : cit.normalTargets;
  }, [cit, mode]);

  const inputStyle = useMemo(
    () => ({
      padding: "12px 14px",
      borderRadius: 10,
      border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.text,
      outline: "none",
      WebkitAppearance: "none",
      appearance: "none",
      width: "100%",
      boxSizing: "border-box", // 🛡️ Fix za širinu
      fontSize: 16,
      fontWeight: 500,
      fontFamily: "'Inter', sans-serif",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }),
    [theme]
  );

  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    const out = [];
    for (const r of raw) {
      const c = canon.get(normName(r));
      if (c) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [mode, canon]);

  const wallKillerPool = useMemo(() => {
    const out = [];
    for (const r of WALL_KILLER_NAMES_RAW) {
      const c = canon.get(normName(r));
      if (c) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [canon]);

  const secondAllowed = useMemo(() => {
    const manticore = canon.get(normName("Manticore"));
    const fp1 = canon.get(normName("Fire Phoenix I"));
    const fp2 = canon.get(normName("Fire Phoenix II"));
    if (mode === MODE_WITHOUT) return manticore ? [manticore] : [];
    return [fp2, fp1].filter(Boolean);
  }, [mode, canon]);

  const nonWallPool = useMemo(() => {
    const wallSet = new Set(wallKillerPool.map(normName));
    return poolAll.filter((n) => !wallSet.has(normName(n)));
  }, [poolAll, wallKillerPool]);

  const firstAllowed = useMemo(() => {
    const rawList = mode === MODE_WITH ? firstStrikerAllowed.WITH ?? [] : firstStrikerAllowed.WITHOUT ?? [];
    const allowedSet = new Set(nonWallPool.map(normName));
    const out = [];
    for (const r of rawList) {
      const c = canon.get(normName(r));
      if (!c) continue;
      if (allowedSet.has(normName(c))) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [mode, firstStrikerAllowed, nonWallPool, canon]);

  const normalize = (current) => {
    const next = [...current];
    const secFallback = secondAllowed[0] ?? "";
    next[1] = secondAllowed.includes(next[1]) ? next[1] : secFallback;
    if (next[0] && !firstAllowed.map(normName).includes(normName(next[0]))) next[0] = "";
    for (let i = 2; i < 9; i++) {
      if (next[i] && !nonWallPool.map(normName).includes(normName(next[i]))) next[i] = "";
    }
    const seen = new Set();
    for (let i = 0; i < 9; i++) {
      const v = next[i]; if (!v) continue; const k = normName(v);
      if (seen.has(k)) next[i] = ""; else seen.add(k);
    }
    const wallSet = new Set(wallKillerPool.map(normName));
    for (let i = 0; i < 9; i++) {
      if (next[i] && wallSet.has(normName(next[i]))) next[i] = i === 1 ? next[i] : "";
    }
    return next;
  };

  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");

  useEffect(() => {
    if (!wallKillerTroop) setWallKillerTroop(wallKillerPool[0] ?? "");
  }, [wallKillerTroop, wallKillerPool]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStrikerTroops((prev) => normalize(["", prev[1], "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({ CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "" });
    setCalcOutput(null);
    setResultsOpen(false);
  };

  useEffect(() => {
    setStrikerTroops((prev) => normalize(prev));
    setCalcOutput(null);
    setResultsOpen(false);
  }, [mode, citadelLevel, poolAll.join("|"), wallKillerPool.join("|"), firstAllowed.join("|")]);

  const optionsForIdx = (idx) => {
    const taken = new Set(strikerTroops.filter((_, i) => i !== idx).filter(Boolean).map(normName));
    let pool;
    if (idx === 0) pool = firstAllowed;
    else if (idx === 1) pool = secondAllowed;
    else pool = nonWallPool;
    const filtered = pool.filter((n) => !taken.has(normName(n)));
    if (idx !== 1) return ["", ...filtered];
    return filtered;
  };

  const setTroopAt = (idx, name) => {
    setStrikerTroops((prev) => normalize(prev.map((v, i) => (i === idx ? name : v))));
    const g = getBonusGroup(name);
    if (g) {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = groupBonusPct[g] ?? "";
        return next;
      });
    } else if (!name) {
      setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = ""; return next; });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const handleTroopChange = (idx, picked) => {
    if (idx >= 2) {
      const first = strikerTroops[0];
      if (first && picked && isFirstStrikerTroop(picked)) {
        const firstS = getBaseStrength(first); const firstH = getBaseHealth(first);
        const pickedS = getBaseStrength(picked); const pickedH = getBaseHealth(picked);
        if (pickedS > firstS || pickedH > firstH) {
          const label = STRIKER_LABELS[idx] || "Striker";
          setWarningMsg(`${label} (${picked}) has higher BASE strength (${fmtInt(pickedS)}) and BASE health (${fmtInt(pickedH)}) than your First striker (${first}, ${fmtInt(firstS)} / ${fmtInt(firstH)}).\n\nChoose a stronger First striker troops!!`);
          setTroopAt(idx, "");
          setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = ""; return next; });
          return;
        }
      }
    }
    setTroopAt(idx, picked);
  };

  const setBonusAt = (idx, v) => {
    const raw = v;
    const troopName = strikerTroops[idx];
    const g = getBonusGroup(troopName);
    if (g) {
      setGroupBonusPct((prev) => ({ ...prev, [g]: raw }));
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        for (let i = 0; i < strikerTroops.length; i++) { if (getBonusGroup(strikerTroops[i]) === g) next[i] = raw; }
        return next;
      });
    } else {
      setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = raw; return next; });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const resetSelections = () => {
    const current = normalize(strikerTroops);
    const keepSecond = current[1];
    setStrikerTroops(() => normalize(["", keepSecond, "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({ CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "" });
    setWallKillerTroop(wallKillerPool[0] ?? "");
    setWallKillerBonusPct("");
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const firstDeaths = useMemo(() => {
    if (!cit) return 0;
    const troop = troopByName.get(strikerTroops[0]);
    const baseHealth = troop ? toNum(troop.health) : 0;
    const effHealth = baseHealth * (1 + toNum(firstHealthBonusPct) / 100);
    const dmg = toNum(cit.firstStrikeDamage);
    if (effHealth <= 0) return 0;
    return Math.floor(dmg / effHealth);
  }, [cit, troopByName, strikerTroops, firstHealthBonusPct]);

  const wallKiller = useMemo(() => {
    if (!cit) return { effBonus: 0, requiredTroops: 0 };
    const troop = troopByName.get(wallKillerTroop);
    const baseStrength = troop ? toNum(troop.strength) : 0;
    const fort = troop?.fortBonus !== undefined && troop?.fortBonus !== null ? toNum(troop.fortBonus) : 0;
    const effBonus = toNum(wallKillerBonusPct) + fort;
    const dmgPerTroop = baseStrength * (1 + effBonus / 100) * 20;
    const wallHP = toNum(cit.wallHP);
    const requiredTroops = dmgPerTroop > 0 ? Math.ceil(wallHP / dmgPerTroop) : 0;
    return { effBonus, requiredTroops };
  }, [cit, wallKillerTroop, wallKillerBonusPct, troopByName]);

  const perStriker = useMemo(() => {
    if (!cit || !targets || targets.length !== 9) return [];
    return STRIKER_LABELS.map((label, idx) => {
      const troopName = strikerTroops[idx];
      const troop = troopByName.get(troopName);
      let effBonus = toNum(strikerBonusPct[idx]);
      if (troopName && additionalBonus[troopName] !== undefined) effBonus += toNum(additionalBonus[troopName]);
      if (troopName && mode === MODE_WITH && idx === 1 && phoenixExtra[troopName] !== undefined) effBonus += toNum(phoenixExtra[troopName]);
      const baseStrength = troop ? toNum(troop.strength) : 0;
      const dmgPerTroop = baseStrength * (1 + effBonus / 100);
      const targetHP = toNum(targets[idx]);
      let required = dmgPerTroop > 0 ? Math.floor(targetHP / dmgPerTroop) : 0;
      if (idx === 0 && dmgPerTroop > 0) required += firstDeaths;
      return { idx, label, troopName, effBonus, requiredTroops: required };
    });
  }, [cit, targets, strikerTroops, strikerBonusPct, troopByName, additionalBonus, phoenixExtra, mode, firstDeaths]);

  const showResults = () => {
    const counts = new Map();
    const add = (name, n) => {
      if (!name || !Number.isFinite(n)) return;
      const k = normName(name);
      counts.set(k, (counts.get(k) || 0) + Math.floor(n));
    };
    if (wallKillerTroop && wallKiller?.requiredTroops) {
      add(wallKillerTroop, wallKiller.requiredTroops);
    }
    for (const s of perStriker) {
      if (s?.troopName && s?.requiredTroops) {
        add(s.troopName, s.requiredTroops);
      }
    }
    const ordered = [];
    for (const name of RESULT_ORDER) {
      const k = normName(name);
      if (counts.has(k)) {
        ordered.push({ troop: name, required: counts.get(k) });
      }
    }
    setCalcOutput({
      modeLabel: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9",
      citadelLabel: `Elven ${citadelLevel}`,
      troops: ordered,
    });
    setResultsOpen(true);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: theme.pageBg,
        // DODANA POZADINA
        backgroundImage: "url('./bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: theme.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Overlay za čitljivost */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0, pointerEvents: "none" }} />

      <style>{`
        html, body, #root { width: 100%; max-width: 100%; margin: 0; padding: 0; }
        #root { display: block; }
        *, *::before, *::after { box-sizing: border-box; }
        :root { color-scheme: dark; }

        /* Pro-gaming gold focus ring */
        input:focus, select:focus, button:focus {
          outline: none !important;
          border-color: rgba(197,160,89,0.85) !important;
          box-shadow: 0 0 0 2px rgba(197,160,89,0.35), 0 0 22px rgba(197,160,89,0.12) !important;
        }

        /* Gold-styled selects (Android-friendly) */
        .gm-select {
          -webkit-appearance: none;
          appearance: none;
          padding-right: 44px !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%23c5a059' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 18px;
        }
        .gm-select option {
          background: #0d0e10;
          color: #ececec;
        }

        /* Scrollbar styles for modals */
        /* Scrollbar styles for modals */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ 
            fontWeight: 800, fontSize: 32, textAlign: "center", 
            background: `linear-gradient(to bottom, #fff, ${theme.accent})`, 
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily: "'Cinzel', serif", textTransform: "uppercase", letterSpacing: 2,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          }}>
            Citadel Calculator
          </div>
          <div style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: theme.subtext,
            opacity: 0.75,
            fontFamily: "'Inter', sans-serif",
          }}>
            by GM
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, paddingBottom: 100 }}>
          <Card title="⚙️ Setup" theme={theme}>
            <button
              onClick={() => setHelpOpen(true)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                border: `1px solid ${theme.border}`, background: theme.btnGhostBg,
                color: theme.text, fontWeight: 700, fontSize: 15, marginBottom: 16,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <span>ℹ️</span> Instructions
            </button>

            <div style={{ display: "grid", gap: 16 }}>
              {/* Koristi custom modal picker da Setup izgleda identično kao ostale kartice (i da izbjegnemo Android native popup) */}
              <OptionPicker
                label="Do you have M8/M9 troops?"
                value={mode}
                options={[
                  { value: MODE_WITHOUT, label: "No" },
                  { value: MODE_WITH, label: "Yes" },
                ]}
                onChange={(v) => handleModeChange(v)}
                theme={theme}
                inputStyle={inputStyle}
              />

              <OptionPicker
                label="Citadel Level"
                value={citadelLevel}
                options={citadelKeys.map((lvl) => ({ value: lvl, label: `Elven ${lvl}` }))}
                onChange={(v) => {
                  setCitadelLevel(v);
                  setCalcOutput(null);
                  setResultsOpen(false);
                }}
                theme={theme}
                inputStyle={inputStyle}
              />

              <button onClick={resetSelections}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${theme.danger}`, background: "rgba(255, 77, 77, 0.15)",
                  color: "#ff6b6b", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8,
                }}
              >
                Reset Troops Selection
              </button>
            </div>
          </Card>

          <Card title="🛡️ Wall Killer" theme={theme}>
            <div style={{ display: "grid", gap: 16 }}>
              <TroopPicker
                label="Select Troop" value={wallKillerTroop} options={wallKillerPool}
                onChange={(v) => { setWallKillerTroop(v); setCalcOutput(null); setResultsOpen(false); }}
                theme={theme} inputStyle={inputStyle}
              />
              <label style={{ display: "grid", gap: 8 }}>
                <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Strength Bonus (%)</span>
                <input type="number" step="any" inputMode="decimal" placeholder="0" value={wallKillerBonusPct}
                  onChange={(e) => { setWallKillerBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }}
                  style={inputStyle} onFocus={(e) => e.target.select()}
                />
              </label>
              <div style={{ background: "rgba(0,0,0,0.42)", padding: "12px 16px", borderRadius: 10, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                  <Row label="Effective Bonus" value={`${fmtInt(wallKiller.effBonus)}%`} theme={theme} accent />
                  <Row label="Required Troops" value={fmtInt(wallKiller.requiredTroops)} theme={theme} accent />
              </div>
            </div>
          </Card>

          {perStriker.map((s) => {
            const idx = s.idx;
            const isFirst = idx === 0;
            const opts = optionsForIdx(idx);

            return (
              <Card key={idx} title={`${idx + 1}. ${s.label}`} theme={theme}>
                <div style={{ display: "grid", gap: 16 }}>
                  <TroopPicker
                    label="Select Troop" value={strikerTroops[idx]} options={opts}
                    onChange={(v) => handleTroopChange(idx, v)} theme={theme} inputStyle={inputStyle}
                  />

                  {isFirst && (
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ color: "#ff8a8a", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>Health Bonus (%)</span>
                      <input type="number" step="any" inputMode="decimal" placeholder="0" value={firstHealthBonusPct}
                        onChange={(e) => { setFirstHealthBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }}
                        style={{...inputStyle, borderColor: "rgba(255, 138, 138, 0.4)"}} onFocus={(e) => e.target.select()}
                      />
                    </label>
                  )}

                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ color: "#80d8ff", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>Strength Bonus (%)</span>
                    <input type="number" step="any" inputMode="decimal" placeholder="0" value={strikerBonusPct[idx]}
                      onChange={(e) => setBonusAt(idx, e.target.value)}
                      style={{...inputStyle, borderColor: "rgba(128, 216, 255, 0.4)"}} onFocus={(e) => e.target.select()}
                    />
                  </label>

                  <div style={{ background: "rgba(0,0,0,0.42)", padding: "12px 16px", borderRadius: 10, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                      <Row label="Effective Bonus" value={`${fmtInt(s.effBonus)}%`} theme={theme} accent />
                      <Row label="Required Troops" value={fmtInt(s.requiredTroops)} theme={theme} accent />
                      {isFirst && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.borderSoft}` }}>
                          <Row label="Citadel First Strike Losses" value={fmtInt(firstDeaths)} theme={theme} />
                      </div>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{
            position: "fixed", left: 0, right: 0, bottom: 0, padding: 16,
            background: "transparent", borderTop: "none", backdropFilter: "none", zIndex: 99
          }}>
          <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <button onClick={showResults} style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: theme.btnBg, color: theme.btnText,
                fontWeight: 900, letterSpacing: 1, fontSize: 18, fontFamily: "'Cinzel', serif",
                boxShadow: `0 0 20px rgba(197, 160, 89, 0.4)`, cursor: "pointer",
              }}
            >
              CALCULATE
            </button>
          </div>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title="⚠️ Invalid Striker Order" onClose={() => setWarningMsg("")} theme={theme}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.text, fontSize: 16 }}>{warningMsg}</div>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
        </Modal>

        <Modal open={helpOpen} title="ℹ️ Instructions & Help" onClose={() => setHelpOpen(false)} theme={theme}>
          <div style={{ color: theme.text, lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🎯 Goal</div><div style={{ color: theme.subtext }}>Use the correct troops and bonuses to minimize losses when attacking a Citadel. I took care of the proper troops selection.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.danger }}>❗ Most Important Rule</div><div style={{ color: theme.subtext, borderLeft: `4px solid ${theme.danger}`, paddingLeft: 12 }}>Maximize <b style={{ color: theme.text }}>First Striker Health</b>. In a proper attack, the First Striker is the only troop group that should take losses.<br /><br />The number of <b style={{ color: theme.text }}>FIRST STRIKER</b> troops <b style={{ color: theme.text }}> CAN</b> be higher than calculated. All other troops <b style={{ color: theme.text }}>MUST</b> be used in the exact number as calculated.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🦅 First Striker</div><div style={{ color: theme.subtext }}>Must be the strongest <b style={{ color: theme.text }}>flying Guardsmen</b>: <b style={{ color: theme.text }}> Corax</b> or <b style={{ color: theme.text }}> Griffin</b>.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>⚔️ Captains</div><div style={{ color: theme.subtext }}>Recommended: <b style={{ color: theme.text }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>✨ Artifacts</div><div style={{ color: theme.subtext }}>Use artifacts that increase Health for <b style={{ color: theme.text }}> Flying</b>, <b style={{ color: theme.text }}> Guardsmen</b>, or the <b style={{ color: theme.text }}> Army</b>.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🔄 Recalculate</div><div style={{ color: theme.subtext }}>After ANY strength bonus change, enter new bonuses and press <b style={{ color: theme.text }}> Calculate</b> again. Small changes matter!</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>❓ How to find bonuses?</div><div style={{ color: theme.subtext }}>Attack a level 10 Citadel with <b style={{ color: theme.text }}>10 of each selected troop type</b>. Copy the bonuses from the attack report into the calculator.</div></div>
          </div>
        </Modal>

        <Modal open={resultsOpen} title="📋 Calculated Results" onClose={() => setResultsOpen(false)} theme={theme}>
          {calcOutput ? (
            <>
              <div style={{ background: "rgba(0,0,0,0.32)", padding: 16, borderRadius: 12, marginBottom: 20, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                  <Row label="Mode" value={calcOutput.modeLabel} theme={theme} accent />
                  <Row label="Citadel" value={calcOutput.citadelLabel} theme={theme} accent />
              </div>
              <button onClick={async () => {
                  const list = (calcOutput.lines || calcOutput.troops || []).map((t) => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
                  const ok = await copyToClipboard(list);
                  setCopyNotice(ok ? "✅ Copied!" : "❌ Copy failed");
                  window.setTimeout(() => setCopyNotice(""), 1500);
                }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: theme.accent, color: "#000", fontWeight: 800, fontSize: 16, marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <span>📄</span> Copy List to Clipboard
              </button>
              {copyNotice ? <div style={{ textAlign: "center", marginBottom: 16, color: theme.accent, fontWeight: 700 }}>{copyNotice}</div> : null}
              
              <div style={{ display: "grid", gap: 8 }}>
              {calcOutput.troops.map((l, i) => (
                <div key={i} style={{ padding: "12px 16px", background: theme.cardBg, borderRadius: 12, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `${theme.shadow}, ${theme.goldGlow}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {iconSrcForTroop(l.troop) ? <img src={iconSrcForTroop(l.troop)} alt={l.troop} width={44} height={44} style={{ borderRadius: 8, flexShrink: 0, border: "1px solid #333" }} loading="lazy" /> : null}
                    <span style={{ fontWeight: 700, color: theme.text, fontSize: 16 }}>{l.troop}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: theme.accent, fontSize: 20 }}>{fmtInt(l.required)}</span>
                </div>
              ))}
              </div>
            </>
          ) : (<div style={{ color: theme.subtext, textAlign: "center", padding: 20 }}>No results to display.</div>)}
        </Modal>
      </div>
    </div>
  );
}
