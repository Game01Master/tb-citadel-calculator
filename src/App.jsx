import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

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

// Display order for Calculate results ONLY
const RESULT_ORDER = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Fire Phoenix II",
  "Fire Phoenix I",
  "Manticore",
  "Corax II",
  "Royal Lion II",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Punisher I",
  "Duelist I",
  "Catapult V",
  "Vulture VII",
  "Heavy Halberdier VII",
  "Heavy Knight VII",
  "Catapult IV",
  "Vulture VI",
  "Heavy Halberdier VI",
  "Heavy Knight VI",
  "Spearmen V",
  "Swordsmen V",
  "Vulture V"
];


// Troop pools (corrected: Royal Lion I)
const TROOPS_WITH_M8_RAW = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Fire Phoenix II",
  "Fire Phoenix I",
  "Manticore",
  "Corax II",
  "Royal Lion II",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Vulture VII",
  "Catapult IV",
  "Vulture VI",
  "Vulture V",
];

const TROOPS_WITHOUT_M8_RAW = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Manticore",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Punisher I",
  "Duelist I",
  "Catapult V",
  "Vulture VII",
  "Heavy Halberdier VII",
  "Heavy Knight VII",
  "Catapult IV",
  "Vulture VI",
  "Heavy Halberdier VI",
  "Heavy Knight VI",
  "Spearmen V",
  "Swordsmen V",
  "Vulture V"
];

// Wall killer troops: only these, and they must not appear anywhere else.
const WALL_KILLER_NAMES_RAW = [
  "Ariel",
  "Josephine II",
  "Josephine I",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Catapult IV",
];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Math.floor(n)
  );
}
function normName(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Troop icons (PNG files must exist in /public/icons with EXACT names)
const ICON_FILE_MAP = {
  "Corax II": "Corax II.png",
  "Corax I": "Corax I.png",
  "Griffin VII": "Griffin VII.png",
  "Griffin VI": "Griffin VI.png",
  "Griffin V": "Griffin V.png",
  "Wyvern": "Wyvern.png",
  "Warregal": "Warregal.png",
  "Jago": "Jago.png",
  "Epic Monster Hunter": "Epic Monster Hunter.png",
  "Royal Lion II": "Royal Lion II.png",
  "Royal Lion I": "Royal Lion I.png",
  "Vulture VII": "Vulture VII.png",
  "Vulture VI": "Vulture VI.png",
  "Vulture V": "Vulture V.png",
  "Fire Phoenix II": "Fire Phoenix II.png",
  "Fire Phoenix I": "Fire Phoenix I.png",
  "Manticore": "Manticore.png",
  "Ariel": "Ariel.png",
  "Josephine II": "Josephine II.png",
  "Josephine I": "Josephine I.png",
  "Siege Ballistae VII": "Siege Ballistae VII.png",
  "Siege Ballistae VI": "Siege Ballistae VI.png",
  "Catapult V": "Catapult V.png",
  "Catapult IV": "Catapult IV.png",
  "Punisher I": "Punisher I.png",
  "Heavy Halberdier VII": "Heavy Halberdier VII.png",
  "Heavy Halberdier VI": "Heavy Halberdier VI.png",
  "Spearmen V": "Spearmen V.png",
  "Duelist I": "Duelist I.png",
  "Heavy Knight VII": "Heavy Knight VII.png",
  "Heavy Knight VI": "Heavy Knight VI.png",
  "Swordsmen V": "Swordsmen V.png",
};

const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  // Ensure it works on GitHub Pages sub-paths + handles spaces
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
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }
}


/* =========================
   AUTO DARK/LIGHT THEME
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

    // modern + fallback
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
  return {
    pageBg: isDark ? "#121212" : "#f5f7fa", // Softer dark, cleaner light
    cardBg: isDark ? "#1e1e1e" : "#ffffff",
    border: isDark ? "#333333" : "#e0e4e8",
    borderSoft: isDark ? "#2c2c2c" : "#ebeff3",
    text: isDark ? "#e0e0e0" : "#2d3748", // Softer white, darker gray
    subtext: isDark ? "#a0aec0" : "#718096",
    inputBg: isDark ? "#2d2d2d" : "#edf2f7",
    inputBorder: isDark ? "#4a4a4a" : "#cbd5e0",
    btnBg: isDark ? "#4a90e2" : "#3182ce", // A nice blue
    btnText: "#ffffff",
    btnGhostBg: isDark ? "#2d2d2d" : "#edf2f7",
    btnGhostBorder: isDark ? "#4a4a4a" : "#cbd5e0",
    overlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
    bottomBarBg: isDark ? "rgba(30,30,30,0.95)" : "rgba(255,255,255,0.95)",
    accent: isDark ? "#63b3ed" : "#4299e1",
    danger: "#e53e3e",
    shadow: isDark ? "0 4px 6px rgba(0,0,0,0.4)" : "0 4px 6px rgba(0,0,0,0.1)",
    cardShadow: isDark ? "0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.2)" : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  };
}

function Card({ title, children, theme }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 20, // More rounded
        padding: 20, // More padding
        background: theme.cardBg,
        boxShadow: theme.cardShadow,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.shadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.cardShadow;
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, color: theme.text }}>
        {title}
      </div>
      {children}
    </div>
  );
}


function TroopPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);

  const display = value ? value : "—";

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>{label}</span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          ...inputStyle,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {value ? (
            iconSrcForTroop(value) ? (
              <img
                src={iconSrcForTroop(value)}
                alt={value}
                width={40} // Larger icon
                height={40}
                style={{ borderRadius: 10, flexShrink: 0, boxShadow: theme.shadow }}
                loading="lazy"
              />
            ) : null
          ) : null}

          <span
            style={{
              color: theme.text,
              fontWeight: 600,
              fontSize: 16,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {display}
          </span>
        </span>

        <span style={{ color: theme.subtext, fontSize: 20, flexShrink: 0 }}>▾</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme}>
        <div style={{ display: "grid", gap: 10, padding: "8px 0" }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? "—" : opt;
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
                  padding: "12px",
                  borderRadius: 16,
                  border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                  background: isSelected ? `${theme.accent}20` : theme.cardBg, // Subtle highlight
                  color: theme.text,
                  fontWeight: 600,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = theme.inputBg; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = theme.cardBg; }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img
                    src={iconSrcForTroop(opt)}
                    alt={opt}
                    width={40}
                    height={40}
                    style={{ borderRadius: 10, flexShrink: 0, boxShadow: theme.shadow }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, border: `1px dashed ${theme.border}` }} />
                )}

                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
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
      <div style={{ color: theme.subtext, fontSize: 14, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: accent ? theme.accent : theme.text, whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}


function Modal({ open, title, onClose, children, theme }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme.overlay,
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500, // Slightly narrower
          background: theme.cardBg,
          color: theme.text,
          borderRadius: 24,
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          maxHeight: "85vh", // More height
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
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 20 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: theme.subtext,
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.inputBg; e.currentTarget.style.color = theme.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.subtext; }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: 20,
            overflowY: "auto",
            flex: 1, // Allow content to stretch
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

  // Canonical mapping: normalized -> exact TB.troops name
  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    // alias safety
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

  // selections (blank allowed except second striker)
  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");

  // Warning popup (e.g., invalid striker order)
  const [warningMsg, setWarningMsg] = useState("");

  // Group-synced strength bonuses (shared across cards)
  const GROUP_KEYS = useMemo(() => (["CORAX","PHOENIX","PHH_SPEAR","DUEL_HK_SW","VULTURE","ROYAL_LION","GRIFFIN"]), []);
  const [groupBonusPct, setGroupBonusPct] = useState(() => ({
    CORAX: "",
    PHOENIX: "",
    PHH_SPEAR: "",
    DUEL_HK_SW: "",
    VULTURE: "",
    ROYAL_LION: "",
    GRIFFIN: "",
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
    const v =
      t?.baseStrength ??
      t?.base_strength ??
      t?.strength ??
      t?.base ??
      0;
    return Number(v) || 0;
  };

  const getBaseHealth = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v =
      t?.baseHealth ??
      t?.base_health ??
      t?.health ??
      t?.hp ??
      0;
    return Number(v) || 0;
  };

  const isFirstStrikerTroop = (troopName) => {
    if (!troopName) return false;
    const exact = canon.get(normName(troopName)) || troopName;
    const list = mode === MODE_WITH ? (firstStrikerAllowed.WITH || []) : (firstStrikerAllowed.WITHOUT || []);
    // normalize list entries via canon too, to be safe with typos/aliases
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
      padding: "12px 16px",
      borderRadius: 12,
      border: `2px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.text,
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      fontSize: 16,
      fontWeight: 500,
      transition: "border-color 0.2s, box-shadow 0.2s",
      "&:focus": {
        borderColor: theme.accent,
        boxShadow: `0 0 0 3px ${theme.accent}30`,
      }
    }),
    [theme]
  );

  // Pool (canonical) based on mode - ONLY troops in the given list, AND only if they exist in TB.troops
  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    const out = [];
    for (const r of raw) {
      const c = canon.get(normName(r));
      if (c) out.push(c);
    }
    // de-dup
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

  // Second striker strict by mode
  const secondAllowed = useMemo(() => {
    const manticore = canon.get(normName("Manticore"));
    const fp1 = canon.get(normName("Fire Phoenix I"));
    const fp2 = canon.get(normName("Fire Phoenix II"));

    if (mode === MODE_WITHOUT) return manticore ? [manticore] : [];
    return [fp2, fp1].filter(Boolean); // prefer II then I
  }, [mode, canon]);

  // Wall killer troops must not appear anywhere else
  const nonWallPool = useMemo(() => {
    const wallSet = new Set(wallKillerPool.map(normName));
    return poolAll.filter((n) => !wallSet.has(normName(n)));
  }, [poolAll, wallKillerPool]);

  // First striker pool: use TB.firstStrikerAllowed lists (mode-specific), and filter to nonWallPool + existence
  const firstAllowed = useMemo(() => {
    const rawList =
      mode === MODE_WITH
        ? firstStrikerAllowed.WITH ?? []
        : firstStrikerAllowed.WITHOUT ?? [];
    const allowedSet = new Set(nonWallPool.map(normName));

    const out = [];
    for (const r of rawList) {
      const c = canon.get(normName(r));
      if (!c) continue;
      if (allowedSet.has(normName(c))) out.push(c);
    }
    // de-dup
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [mode, firstStrikerAllowed, nonWallPool, canon]);

  // --- Normalize selections: second always set; no duplicates; others can be blank ---
  const normalize = (current) => {
    const next = [...current];

    // enforce second striker
    const secFallback = secondAllowed[0] ?? "";
    next[1] = secondAllowed.includes(next[1]) ? next[1] : secFallback;

    // validate first: must be from firstAllowed (or blank)
    if (next[0] && !firstAllowed.map(normName).includes(normName(next[0])))
      next[0] = "";

    // validate others
    for (let i = 2; i < 9; i++) {
      if (next[i] && !nonWallPool.map(normName).includes(normName(next[i])))
        next[i] = "";
    }

    // remove duplicates across all 9
    const seen = new Set();
    for (let i = 0; i < 9; i++) {
      const v = next[i];
      if (!v) continue;
      const k = normName(v);
      if (seen.has(k)) next[i] = "";
      else seen.add(k);
    }

    // hard enforcement: wall killer troops never appear in strikers
    const wallSet = new Set(wallKillerPool.map(normName));
    for (let i = 0; i < 9; i++) {
      if (next[i] && wallSet.has(normName(next[i])))
        next[i] = i === 1 ? next[i] : "";
    }

    return next;
  };

  // Wall killer selection
  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");

  useEffect(() => {
    if (!wallKillerTroop) setWallKillerTroop(wallKillerPool[0] ?? "");
  }, [wallKillerTroop, wallKillerPool]);

  // Mode change: clear ALL selections except second striker (so you clearly see different pools)
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStrikerTroops((prev) => normalize(["", prev[1], "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({
      CORAX: "",
      PHOENIX: "",
      PHH_SPEAR: "",
      DUEL_HK_SW: "",
      VULTURE: "",
      ROYAL_LION: "",
      GRIFFIN: "",
    });
    setCalcOutput(null);
    setResultsOpen(false);
  };

  // Keep second valid on mode/citadel change
  useEffect(() => {
    setStrikerTroops((prev) => normalize(prev));
    setCalcOutput(null);
    setResultsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, citadelLevel, poolAll.join("|"), wallKillerPool.join("|"), firstAllowed.join("|")]);

  // Options per card (blank allowed except second)
  const optionsForIdx = (idx) => {
    const taken = new Set(
      strikerTroops
        .filter((_, i) => i !== idx)
        .filter(Boolean)
        .map(normName)
    );

    let pool;
    if (idx === 0) pool = firstAllowed; // FIRST STRIKER restricted list
    else if (idx === 1) pool = secondAllowed; // SECOND STRIKER restricted list
    else pool = nonWallPool; // OTHER STRIKERS

    const filtered = pool.filter((n) => !taken.has(normName(n)));
    if (idx !== 1) return ["", ...filtered];
    return filtered;
  };

  const setTroopAt = (idx, name) => {
    setStrikerTroops((prev) => normalize(prev.map((v, i) => (i === idx ? name : v))));
    // If this troop belongs to a synced group, apply the group bonus to this card immediately
    const g = getBonusGroup(name);
    if (g) {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = groupBonusPct[g] ?? "";
        return next;
      });
    } else if (!name) {
      // cleared selection -> clear this card bonus input
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = "";
        return next;
      });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const handleTroopChange = (idx, picked) => {
    // Guard: for Third Striker and all Cleanup strikers (idx >= 2)
    // Show warning ONLY if the picked troop is on the First Striker allowed list (mode dependent)
    // and it has higher BASE strength OR higher BASE health than the selected First Striker.
    if (idx >= 2) {
      const first = strikerTroops[0];
      if (first && picked && isFirstStrikerTroop(picked)) {
        const firstS = getBaseStrength(first);
        const firstH = getBaseHealth(first);
        const pickedS = getBaseStrength(picked);
        const pickedH = getBaseHealth(picked);

        if (pickedS > firstS || pickedH > firstH) {
          const label = STRIKER_LABELS[idx] || "Striker";
          setWarningMsg(
            `${label} (${picked}) has higher BASE strength (${fmtInt(pickedS)}) and BASE health (${fmtInt(pickedH)}) than your First striker (${first}, ${fmtInt(firstS)} / ${fmtInt(firstH)}).\n\nChoose a stronger First striker troops!!`
          );
          // prevent invalid selection
          setTroopAt(idx, "");
          // clear only this slot's bonus input (do NOT change group bonus)
          setStrikerBonusPct((prev) => {
            const next = [...prev];
            next[idx] = "";
            return next;
          });
          return;
        }
      }
    }
    setTroopAt(idx, picked);
  };

  const setBonusAt = (idx, v) => {
    const raw = v; // keep as string so inputs can stay blank and allow decimals
    const troopName = strikerTroops[idx];
    const g = getBonusGroup(troopName);

    // If the troop is in a synced group, update the group bonus and propagate to all selected troops in that group
    if (g) {
      setGroupBonusPct((prev) => ({ ...prev, [g]: raw }));
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        for (let i = 0; i < strikerTroops.length; i++) {
          if (getBonusGroup(strikerTroops[i]) === g) next[i] = raw;
        }
        return next;
      });
    } else {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = raw;
        return next;
      });
    }

    setCalcOutput(null);
    setResultsOpen(false);
  };

  // Reset: clear ALL troops except second striker troop; reset bonuses everywhere.
  const resetSelections = () => {
    const current = normalize(strikerTroops);
    const keepSecond = current[1];
    setStrikerTroops(() => normalize(["", keepSecond, "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({
      CORAX: "",
      PHOENIX: "",
      PHH_SPEAR: "",
      DUEL_HK_SW: "",
      VULTURE: "",
      ROYAL_LION: "",
      GRIFFIN: "",
    });

    setWallKillerTroop(wallKillerPool[0] ?? "");
    setWallKillerBonusPct("");

    setCalcOutput(null);
    setResultsOpen(false);
  };

  // First striker deaths (shown only in first card)
  const firstDeaths = useMemo(() => {
    if (!cit) return 0;
    const troop = troopByName.get(strikerTroops[0]);
    const baseHealth = troop ? toNum(troop.health) : 0;
    const effHealth = baseHealth * (1 + toNum(firstHealthBonusPct) / 100);
    const dmg = toNum(cit.firstStrikeDamage);
    if (effHealth <= 0) return 0;
    return Math.floor(dmg / effHealth);
  }, [cit, troopByName, strikerTroops, firstHealthBonusPct]);

  // Wall killer (ceil) + IMPORTANT: strength x 20 AFTER bonuses
  const wallKiller = useMemo(() => {
    if (!cit) return { effBonus: 0, requiredTroops: 0 };
    const troop = troopByName.get(wallKillerTroop);
    const baseStrength = troop ? toNum(troop.strength) : 0;
    const fort =
      troop?.fortBonus !== undefined && troop?.fortBonus !== null
        ? toNum(troop.fortBonus)
        : 0;

    const effBonus = toNum(wallKillerBonusPct) + fort;

    // APPLY BONUS THEN ×20
    const dmgPerTroop = baseStrength * (1 + effBonus / 100) * 20;

    const wallHP = toNum(cit.wallHP);
    const requiredTroops = dmgPerTroop > 0 ? Math.ceil(wallHP / dmgPerTroop) : 0;
    return { effBonus, requiredTroops };
  }, [cit, wallKillerTroop, wallKillerBonusPct, troopByName]);

  // Striker calculation
  const perStriker = useMemo(() => {
    if (!cit || !targets || targets.length !== 9) return [];

    return STRIKER_LABELS.map((label, idx) => {
      const troopName = strikerTroops[idx];
      const troop = troopByName.get(troopName);

      let effBonus = toNum(strikerBonusPct[idx]);
      if (troopName && additionalBonus[troopName] !== undefined)
        effBonus += toNum(additionalBonus[troopName]);

      if (
        troopName &&
        mode === MODE_WITH &&
        idx === 1 &&
        phoenixExtra[troopName] !== undefined
      ) {
        effBonus += toNum(phoenixExtra[troopName]);
      }

      const baseStrength = troop ? toNum(troop.strength) : 0;
      const dmgPerTroop = baseStrength * (1 + effBonus / 100);

      const targetHP = toNum(targets[idx]);
      let required = dmgPerTroop > 0 ? Math.floor(targetHP / dmgPerTroop) : 0;
      if (idx === 0 && dmgPerTroop > 0) required += firstDeaths;

      return { idx, label, troopName, effBonus, requiredTroops: required };
    });
  }, [
    cit,
    targets,
    strikerTroops,
    strikerBonusPct,
    troopByName,
    additionalBonus,
    phoenixExtra,
    mode,
    firstDeaths,
  ]);

  const showResults = () => {
    // use existing calculation results, only change DISPLAY order/content
    const counts = new Map();

    const add = (name, n) => {
      if (!name || !Number.isFinite(n)) return;
      const k = normName(name);
      counts.set(k, (counts.get(k) || 0) + Math.floor(n));
    };

    // wall killer
    if (wallKillerTroop && wallKiller?.requiredTroops) {
      add(wallKillerTroop, wallKiller.requiredTroops);
    }

    // strikers
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
        color: theme.text,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >

      <style>{`
        /* Force full-width layout on mobile + consistent container sizing */
        html, body, #root { width: 100%; max-width: 100%; margin: 0; padding: 0; }
        #root { display: block; }
        *, *::before, *::after { box-sizing: border-box; }
        
        /* Custom Scrollbar for modal */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme.border}; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.subtext}; 
        }
        
        /* Input focus styles */
        input:focus, select:focus, button:focus {
          outline: none;
        }
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding: "20px 16px",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
      <div style={{ 
        fontWeight: 800, 
        fontSize: 28, 
        marginBottom: 24, 
        textAlign: "center",
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.text})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        Citadel Calculator by GM
      </div>

      <div style={{ display: "grid", gap: 16, paddingBottom: 100 }}>
        <Card title="⚙️ Setup" theme={theme}>
          <button
            onClick={() => setHelpOpen(true)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: `2px solid ${theme.btnGhostBorder}`,
              background: theme.btnGhostBg,
              color: theme.text,
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.btnGhostBorder; e.currentTarget.style.color = theme.text; }}
          >
            <span>ℹ️</span> Instructions
          </button>

          <div style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>Do you have M8/M9 troops?</span>
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
                style={inputStyle}
              >
                <option value={MODE_WITHOUT}>No</option>
                <option value={MODE_WITH}>Yes</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>Citadel Level</span>
              <select
                value={citadelLevel}
                onChange={(e) => {
                  setCitadelLevel(e.target.value);
                  setCalcOutput(null);
                  setResultsOpen(false);
                }}
                style={inputStyle}
              >
                {citadelKeys.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Elven {lvl}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={resetSelections}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: `2px solid ${theme.danger}40`,
                background: `${theme.danger}10`,
                color: theme.danger,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.danger}20`; e.currentTarget.style.borderColor = theme.danger; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${theme.danger}10`; e.currentTarget.style.borderColor = `${theme.danger}40`; }}
            >
              Reset Troops Selection
            </button>
          </div>
        </Card>

        <Card title="🛡️ Wall Killer" theme={theme}>
          <div style={{ display: "grid", gap: 16 }}>
            <TroopPicker
              label="Select Troop"
              value={wallKillerTroop}
              options={wallKillerPool}
              onChange={(v) => {
                setWallKillerTroop(v);
                setCalcOutput(null);
                setResultsOpen(false);
              }}
              theme={theme}
              inputStyle={inputStyle}
            />

            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>Strength Bonus (%)</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={wallKillerBonusPct}
                onChange={(e) => {
                  setWallKillerBonusPct(e.target.value);
                  setCalcOutput(null);
                  setResultsOpen(false);
                }}
                style={inputStyle}
                onFocus={(e) => e.target.select()}
              />
            </label>

            <div style={{ background: theme.inputBg, padding: "12px 16px", borderRadius: 12 }}>
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
                  label="Select Troop"
                  value={strikerTroops[idx]}
                  options={opts}
                  onChange={(v) => handleTroopChange(idx, v)}
                  theme={theme}
                  inputStyle={inputStyle}
                />

                {isFirst && (
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>Health Bonus (%)</span>
                    <input
                      type="number"
                step="any"
                inputMode="decimal"
                      placeholder="0"
                      value={firstHealthBonusPct}
                      onChange={(e) => {
                        setFirstHealthBonusPct(e.target.value);
                        setCalcOutput(null);
                        setResultsOpen(false);
                      }}
                      style={inputStyle}
                      onFocus={(e) => e.target.select()}
                    />
                  </label>
                )}

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 14 }}>Strength Bonus (%)</span>
                  <input
                    type="number"
                step="any"
                inputMode="decimal"
                    placeholder="0"
                    value={strikerBonusPct[idx]}
                    onChange={(e) => setBonusAt(idx, e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => e.target.select()}
                  />
                </label>

                <div style={{ background: theme.inputBg, padding: "12px 16px", borderRadius: 12 }}>
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

      {/* Bottom mobile bar with CALCULATE button */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          background: theme.bottomBarBg,
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${theme.border}`,
          zIndex: 99,
          boxShadow: `0 -4px 10px ${theme.shadow}`,
        }}
      >
        <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
          <button
            onClick={showResults}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.btnBg})`,
              color: theme.btnText,
              fontWeight: 800,
              letterSpacing: 1,
              fontSize: 18,
              boxShadow: `0 8px 20px -4px ${theme.accent}60`,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 24px -4px ${theme.accent}80`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 20px -4px ${theme.accent}60`;
            }}
          >
            CALCULATE
          </button>
        </div>
      </div>
      {/* Warning popup */}
      <Modal
        open={!!warningMsg}
        title="⚠️ Invalid Striker Order"
        onClose={() => setWarningMsg("")}
        theme={theme}
      >
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.text, fontSize: 16 }}>
          {warningMsg}
        </div>
        <button
          onClick={() => setWarningMsg("")}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "14px",
            borderRadius: 16,
            border: "none",
            background: theme.accent,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </Modal>



{/* Help popup */}
<Modal
  open={helpOpen}
  title="ℹ️ Instructions & Help"
  onClose={() => setHelpOpen(false)}
  theme={theme}
>
  <div style={{ color: theme.text, lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🎯 Goal</div>
        <div style={{ color: theme.subtext }}>
        Use the correct troops and bonuses to minimize losses when attacking a Citadel.
        I took care of the proper troops selection.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.danger }}>❗ Most Important Rule</div>
        <div style={{ color: theme.subtext, borderLeft: `4px solid ${theme.danger}`, paddingLeft: 12 }}>
        Maximize <b style={{ color: theme.text }}>First Striker Health</b>.
        In a proper attack, the First Striker is the only troop group that should take losses.
        If you are losing other troops, check your bonuses or troop counts.
        <br /><br />
        The number of <b style={{ color: theme.text }}>FIRST STRIKER</b> troops
        <b style={{ color: theme.text }}> CAN</b> be higher than calculated.
        All other troops <b style={{ color: theme.text }}>MUST</b> be used in the exact number
        as calculated.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🦅 First Striker</div>
        <div style={{ color: theme.subtext }}>
        Must be the strongest <b style={{ color: theme.text }}>flying Guardsmen</b>:
        <b style={{ color: theme.text }}> Corax</b> or <b style={{ color: theme.text }}> Griffin</b>.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>⚔️ Captains</div>
        <div style={{ color: theme.subtext }}>
        Recommended:
        <b style={{ color: theme.text }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>✨ Artifacts</div>
        <div style={{ color: theme.subtext }}>
        Use artifacts that increase Health for
        <b style={{ color: theme.text }}> Flying</b>,
        <b style={{ color: theme.text }}> Guardsmen</b>,
        or the <b style={{ color: theme.text }}> Army</b>.
        (e.g., <b style={{ color: theme.text }}>Valkyrie Diadem, Medallion, Belt, Flask</b>).
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>🔄 Recalculate</div>
        <div style={{ color: theme.subtext }}>
        After ANY strength bonus change, enter new bonuses and press
        <b style={{ color: theme.text }}> Calculate</b> again. Small changes matter!
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>❓ How to find bonuses?</div>
        <div style={{ color: theme.subtext }}>
        Attack a level 10 Citadel with <b style={{ color: theme.text }}>10 of each selected troop type</b>.
        Copy the bonuses from the attack report into the calculator.
        </div>
    </div>
  </div>
</Modal>

{/* Results popup */}
      <Modal
        open={resultsOpen}
        title="📋 Calculated Results"
        onClose={() => setResultsOpen(false)}
        theme={theme}
      >
        {calcOutput ? (
          <>
            <div style={{ background: theme.inputBg, padding: 16, borderRadius: 16, marginBottom: 20 }}>
                <Row label="Mode" value={calcOutput.modeLabel} theme={theme} />
                <Row label="Citadel" value={calcOutput.citadelLabel} theme={theme} />
            </div>

            <button
              onClick={async () => {
                const list = (calcOutput.lines || calcOutput.troops || [])
                  .map((t) => `${t.troop} - ${fmtInt(t.required)}`)
                  .join("\n");
                const ok = await copyToClipboard(list);
                setCopyNotice(ok ? "✅ Copied!" : "❌ Copy failed");
                window.setTimeout(() => setCopyNotice(""), 1500);
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 16,
                border: "none",
                background: theme.accent,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.btnBg}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.accent}
            >
              <span>📄</span> Copy List to Clipboard
            </button>
            {copyNotice ? (
              <div style={{ textAlign: "center", marginBottom: 16, color: theme.accent, fontWeight: 700 }}>
                {copyNotice}
              </div>
            ) : null}
            
            <div style={{ display: "grid", gap: 8 }}>
            {calcOutput.troops.map((l, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  background: theme.cardBg,
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: theme.shadow,
                }}
              >
                
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {iconSrcForTroop(l.troop) ? (
                    <img
                      src={iconSrcForTroop(l.troop)}
                      alt={l.troop}
                      width={44}
                      height={44}
                      style={{ borderRadius: 10, flexShrink: 0 }}
                      loading="lazy"
                    />
                  ) : null}
                  <span style={{ fontWeight: 700, color: theme.text, fontSize: 16 }}>{l.troop}</span>
                </div>
                <span style={{ fontWeight: 800, color: theme.accent, fontSize: 20 }}>{fmtInt(l.required)}</span>
              </div>
            ))}
            </div>
          </>
        ) : (
          <div style={{ color: theme.subtext, textAlign: "center", padding: 20 }}>No results to display.</div>
        )}
      </Modal>
      </div>
    </div>
  );
}
