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
  "Corax II",
  "Corax I",
  "Griffin VII",
  "Griffin VI",
  "Griffin V",
  "Wyvern",
  "Warregal",
  "Jago",
  "Epic Monster Hunter",
  "Royal Lion II",
  "Royal Lion I",
  "Vulture VII",
  "Vulture VI",
  "Vulture V",
  "Fire Phoenix II",
  "Fire Phoenix I",
  "Manticore",
  "Ariel",
  "Josephine II",
  "Josephine I",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Catapult IV",
];

const TROOPS_WITHOUT_M8_RAW = [
  "Corax I",
  "Punisher I",
  "Griffin VII",
  "Heavy Halberdier VII",
  "Griffin VI",
  "Heavy Halberdier VI",
  "Griffin V",
  "Spearmen V",
  "Royal Lion I",
  "Duelist I",
  "Vulture VII",
  "Heavy Knight VII",
  "Vulture VI",
  "Heavy Knight VI",
  "Vulture V",
  "Swordsmen V",
  "Wyvern",
  "Warregal",
  "Jago",
  "Epic Monster Hunter",
  "Ariel",
  "Josephine I",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Catapult IV",
  "Manticore",
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


function renderTroopWithIcon(name, theme) {
  const src = iconSrcForTroop(name);
  if (!src) return name;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img
        src={src}
        alt={name}
        width={18}
        height={18}
        style={{ borderRadius: 4, display: "block" }}
        loading="lazy"
      />
      <span style={{ color: theme.text }}>{name}</span>
    </span>
  );
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
    pageBg: isDark ? "#0f1115" : "#fafafa",
    cardBg: isDark ? "#161a22" : "#ffffff",
    border: isDark ? "#2a2f3a" : "#e6e6e6",
    borderSoft: isDark ? "#222834" : "#f0f0f0",
    text: isDark ? "#eaeaea" : "#111111",
    subtext: isDark ? "#a6b0bf" : "#666666",
    inputBg: isDark ? "#0f1115" : "#ffffff",
    inputBorder: isDark ? "#3a4252" : "#dddddd",
    btnBg: isDark ? "#1f6feb" : "#111111",
    btnText: "#ffffff",
    btnGhostBg: isDark ? "#0f1115" : "#ffffff",
    btnGhostBorder: isDark ? "#3a4252" : "#dddddd",
    overlay: "rgba(0,0,0,0.45)",
    bottomBarBg: isDark ? "rgba(22,26,34,0.92)" : "rgba(250,250,250,0.92)",
  };
}

function Card({ title, children, theme }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 12,
        background: theme.cardBg,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 10, color: theme.text }}>
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
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext }}>{label}</span>

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
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {value ? (
            iconSrcForTroop(value) ? (
              <img
                src={iconSrcForTroop(value)}
                alt={value}
                width={34}
                height={34}
                style={{ borderRadius: 7, flexShrink: 0 }}
                loading="lazy"
              />
            ) : null
          ) : null}

          <span
            style={{
              color: theme.text,
              fontWeight: 800,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {display}
          </span>
        </span>

        <span style={{ color: theme.subtext, fontWeight: 900, flexShrink: 0 }}>▾</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme}>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? "—" : opt;
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
                  padding: "10px 10px",
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: theme.cardBg,
                  color: theme.text,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img
                    src={iconSrcForTroop(opt)}
                    alt={opt}
                    width={34}
                    height={34}
                    style={{ borderRadius: 7, flexShrink: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 7, flexShrink: 0 }} />
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


function Row({ label, value, theme }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        alignItems: "center",
        width: "100%",
        padding: "4px 0",
      }}
    >
      <div style={{ color: theme.subtext, overflowWrap: "anywhere" }}>
        {label}
      </div>
      <div style={{ fontWeight: 900, color: theme.text, whiteSpace: "nowrap" }}>
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
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 12,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: theme.cardBg,
          color: theme.text,
          borderRadius: 18,
          border: `1px solid ${theme.border}`,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: `1px solid ${theme.btnGhostBorder}`,
              background: theme.btnGhostBg,
              color: theme.text,
              borderRadius: 12,
              padding: "8px 10px",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: 12,
            paddingTop: 0,
            maxHeight: "70vh",
            overflowY: "auto",
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
      padding: 10,
      borderRadius: 12,
      border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.text,
      outline: "none",
      width: "100%",
      boxSizing: "border-box",

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
      }}
    >

      <style>{`
        /* Force full-width layout on mobile + consistent container sizing */
        html, body, #root { width: 100%; max-width: 100%; margin: 0; padding: 0; }
        #root { display: block; }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding: 12,
          fontFamily: "system-ui, Arial",
        }}
      >
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
        Citadel Calculator by GM
      </div>

      <div style={{ display: "grid", gap: 10, paddingBottom: 130 }}>
        <Card title="Setup" theme={theme}>
          <button
            onClick={() => setHelpOpen(true)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.btnBg,
              color: theme.btnText,
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            Help
          </button>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: theme.subtext }}>Do you have M8/M9 troops?</span>
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value)}
                style={inputStyle}
              >
                <option value={MODE_WITHOUT}>No</option>
                <option value={MODE_WITH}>Yes</option>
              </select>
            </label>

            <button
              onClick={resetSelections}
              style={{
                width: "100%",
                padding: "12px 12px",
                borderRadius: 14,
                border: `1px solid ${theme.btnGhostBorder}`,
                background: theme.btnGhostBg,
                color: "#c63636",
                fontWeight: 900,
              }}
            >
              Reset Troops selection
            </button>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: theme.subtext }}>Citadel Level</span>
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
          </div>
        </Card>

        <Card title="Wall Killer" theme={theme}>
          <div style={{ display: "grid", gap: 10 }}>
            <TroopPicker
              label="Troops"
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

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: theme.subtext }}>Strength Bonus (%)</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={wallKillerBonusPct}
                onChange={(e) => {
                  setWallKillerBonusPct(e.target.value);
                  setCalcOutput(null);
                  setResultsOpen(false);
                }}
                style={inputStyle}
              />
            </label>

            <Row label="Effective Bonus" value={`${fmtInt(wallKiller.effBonus)}%`} theme={theme} />
            <Row label="Required Troops" value={fmtInt(wallKiller.requiredTroops)} theme={theme} />
          </div>
        </Card>

        {perStriker.map((s) => {
          const idx = s.idx;
          const isFirst = idx === 0;
          const opts = optionsForIdx(idx);

          return (
            <Card key={idx} title={`${idx + 1}. ${s.label}`} theme={theme}>
              <div style={{ display: "grid", gap: 10 }}>
                <TroopPicker
                  label="Troops"
                  value={strikerTroops[idx]}
                  options={opts}
                  onChange={(v) => handleTroopChange(idx, v)}
                  theme={theme}
                  inputStyle={inputStyle}
                />

                {isFirst && (
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ color: theme.subtext }}>Health Bonus (%)</span>
                    <input
                      type="number"
                step="any"
                inputMode="decimal"
                      value={firstHealthBonusPct}
                      onChange={(e) => {
                        setFirstHealthBonusPct(e.target.value);
                        setCalcOutput(null);
                        setResultsOpen(false);
                      }}
                      style={inputStyle}
                    />
                  </label>
                )}

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: theme.subtext }}>Strength Bonus (%)</span>
                  <input
                    type="number"
                step="any"
                inputMode="decimal"
                    value={strikerBonusPct[idx]}
                    onChange={(e) => setBonusAt(idx, e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <Row label="Effective Bonus" value={`${fmtInt(s.effBonus)}%`} theme={theme} />
                <Row label="Required Troops" value={fmtInt(s.requiredTroops)} theme={theme} />

                {isFirst && (
                  <div style={{ marginTop: 6, paddingTop: 8, borderTop: `1px solid ${theme.borderSoft}` }}>
                    <Row label="Losses if citadel strikes first" value={fmtInt(firstDeaths)} theme={theme} />
                  </div>
                )}
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
          paddingTop: 10,
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
          paddingLeft: 0,
          paddingRight: 0,
          background: theme.bottomBarBg,
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${theme.border}`,
          zIndex: 999,
        }}
      >
        <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "0 12px" }}>
          <button
            onClick={showResults}
            style={{
              width: "100%",
              padding: "14px 12px",
              borderRadius: 16,
              border: "none",
              background: theme.btnBg,
              color: theme.btnText,
              fontWeight: 900,
              letterSpacing: 0.4,
              fontSize: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            }}
          >
            CALCULATE
          </button>
        </div>
      </div>
      {/* Warning popup */}
      <Modal
        open={!!warningMsg}
        title="Invalid striker order"
        onClose={() => setWarningMsg("")}
        theme={theme}
      >
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, color: theme.text }}>
          {warningMsg}
        </div>
        <button
          onClick={() => setWarningMsg("")}
          style={{
            width: "100%",
            marginTop: 12,
            padding: "12px",
            borderRadius: 14,
            border: `1px solid ${theme.btnGhostBorder}`,
            background: theme.btnGhostBg,
            color: theme.text,
            fontWeight: 900,
          }}
        >
          OK
        </button>
      </Modal>



            {/* Help popup */}
      <Modal
        open={helpOpen}
        title="Help"
        onClose={() => setHelpOpen(false)}
        theme={theme}
      >
        <div style={{ color: theme.text, lineHeight: 1.45, fontSize: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Most important</div>
          <div style={{ color: theme.subtext, marginBottom: 12 }}>
            The priority is to increase <b style={{ color: theme.text }}>First Striker Health</b>. In a proper attack, the First Striker is the only troop group that should take losses.
          </div>

          <div style={{ fontWeight: 900, marginBottom: 6 }}>First Striker</div>
          <div style={{ color: theme.subtext, marginBottom: 12 }}>
            First Striker should be the strongest <b style={{ color: theme.text }}>flying Guardsmen</b>:
            <b style={{ color: theme.text }}> Corax</b> or <b style={{ color: theme.text }}> Griffin</b>.
          </div>

          <div style={{ fontWeight: 900, marginBottom: 6 }}>Captains</div>
          <div style={{ color: theme.subtext, marginBottom: 12 }}>
            Best captains: <b style={{ color: theme.text }}>Wu Zetian</b>, <b style={{ color: theme.text }}>Brunhild</b>, <b style={{ color: theme.text }}>Skadi</b>,
            <b style={{ color: theme.text }}>Beowulf</b>, <b style={{ color: theme.text }}>Aydae</b>, <b style={{ color: theme.text }}>Ramses</b>, <b style={{ color: theme.text }}>Sofia</b>.
          </div>

          <div style={{ fontWeight: 900, marginBottom: 6 }}>Artifacts</div>
          <div style={{ color: theme.subtext, marginBottom: 12 }}>
            Use artifacts that increase Health for <b style={{ color: theme.text }}>Flying</b>, <b style={{ color: theme.text }}>Guardsmen</b>, or the <b style={{ color: theme.text }}>Army</b>.
            Best options include <b style={{ color: theme.text }}>Valkyrie Diadem</b>, <b style={{ color: theme.text }}>Medallion</b>, <b style={{ color: theme.text }}>Belt</b>, <b style={{ color: theme.text }}>Flask</b>.
          </div>

          <div style={{ fontWeight: 900, marginBottom: 6 }}>Recalculate after changes</div>
          <div style={{ color: theme.subtext }}>
            After any change in Strength/Health (e.g. captain level up, new artifact/equipment), run <b style={{ color: theme.text }}>Calculate</b> again.
          </div>
        </div>
      </Modal>

{/* Results popup */}
      <Modal
        open={resultsOpen}
        title="Calculated List"
        onClose={() => setResultsOpen(false)}
        theme={theme}
      >
        {calcOutput ? (
          <>
            <button
              onClick={async () => {
                const list = (calcOutput.lines || calcOutput.troops || [])
                  .map((t) => `${t.troop} - ${fmtInt(t.required)}`)
                  .join("\n");
                const ok = await copyToClipboard(list);
                setCopyNotice(ok ? "Copied!" : "Copy failed");
                window.setTimeout(() => setCopyNotice(""), 1200);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                border: `1px solid ${theme.border}`,
                background: theme.btnBg,
                color: theme.btnText,
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              Copy list
            </button>
            {copyNotice ? (
              <div style={{ marginBottom: 8, color: theme.subtext, fontWeight: 700 }}>
                {copyNotice}
              </div>
            ) : null}

            <Row label="Mode" value={calcOutput.modeLabel} theme={theme} />
            <Row label="Citadel" value={calcOutput.citadelLabel} theme={theme} />
            <div style={{ height: 10 }} />
            {calcOutput.troops.map((l, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 0",
                  borderTop: `1px solid ${i === 0 ? theme.borderSoft : (isDark ? "#1f2531" : "#f6f6f6")}`,
                }}
              >
                
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: theme.text }}>
                  {iconSrcForTroop(l.troop) ? (
                    <img
                      src={iconSrcForTroop(l.troop)}
                      alt={l.troop}
                      width={34}
                      height={34}
                      style={{ borderRadius: 7, flexShrink: 0 }}
                      loading="lazy"
                    />
                  ) : null}
                  <span style={{ fontWeight: 900, color: theme.text }}>{l.troop}</span>
                  <span style={{ fontWeight: 900, color: theme.text }}>- {fmtInt(l.required)}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: theme.subtext }}>No results yet.</div>
        )}
      </Modal>
      </div>
    </div>
  );
}
