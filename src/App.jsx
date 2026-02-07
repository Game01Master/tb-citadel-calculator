import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import TB from "./tb_data.json";

// --- GAMING FONTOVI ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Inter:wght@300;400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

// Konstanta za petlju
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

// --- LANGUAGES CONFIG ---
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' }
];

// --- TRANSLATIONS / PRIJEVODI ---
const TRANSLATIONS = {
  en: {
    language: "Language",
    setup: "⚙️ Setup",
    instructions_btn: "ℹ️ Instructions",
    m8_question: "Do you have M8/M9 troops?",
    yes: "Yes",
    no: "No",
    citadel_level: "Citadel Level",
    reset_btn: "Reset Troops Selection",
    calculate_btn: "CALCULATE",
    wall_killer: "🛡️ Wall Killer",
    select_troop: "Select Troop",
    select_placeholder: "— Select —",
    none: "— None —",
    strength_bonus: "Strength Bonus (%)",
    health_bonus: "Health Bonus (%)",
    eff_bonus: "Effective Bonus",
    req_troops: "Required Troops",
    citadel_losses: "Citadel First Strike Losses",
    action_required: "⛔ Action Required",
    select_first_striker_msg: "You must select the First Striker before selecting other troops.",
    invalid_order: "⚠️ Invalid Striker Order",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} has higher BASE stats (Str: ${str1}, HP: ${hp1}) than First Striker (${name2} - Str: ${str2}, HP: ${hp2}).\n\nChoose a stronger First striker!`,
    results_title: "📋 Calculated Results",
    mode_label: "Mode",
    citadel_label: "Citadel",
    copy_btn: "📄 Copy List",
    copy_success: "✅ Copied!",
    copy_fail: "❌ Copy failed",
    no_results: "No results to display.",
    strikers: ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"],
    help_goal_title: "🎯 Goal",
    help_goal_text: "Use the correct troops and bonuses to minimize losses when attacking a Citadel. I took care of the proper troops selection.",
    help_rule_title: "❗ Most Important Rule",
    help_rule_text: "Maximize First Striker Health. In a proper attack, the First Striker is the only troop group that should take losses. The number of FIRST STRIKER troops CAN be higher than calculated. All other troops MUST be used in the exact number as calculated.",
    help_first_title: "🦅 First Striker",
    help_first_text: "Must be the strongest flying Guardsmen: Corax or Griffin.",
    help_captains_title: "⚔️ Captains",
    help_captains_text: "Recommended: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artifacts",
    help_arti_text: "Use artifacts that increase Health for Flying, Guardsmen, or the Army.",
    help_recalc_title: "🔄 Recalculate",
    help_recalc_text: "After ANY strength bonus change, enter new bonuses and press Calculate again. Small changes matter!",
    help_bonus_title: "❓ How to find bonuses?",
    help_bonus_text1: "Attack a level 10 Citadel with 10 of each selected troop type. Copy the bonuses from the attack report into the calculator.",
    help_bonus_text2: "Or select the captains, equipment, and artifacts. Send the hero and dragon to the fort and copy the bonuses from the barracks."
  },
  de: {
    language: "Sprache",
    setup: "⚙️ Einstellungen",
    instructions_btn: "ℹ️ Anleitung",
    m8_question: "Hast du M8/M9 Truppen?",
    yes: "Ja",
    no: "Nein",
    citadel_level: "Zitadellen-Level",
    reset_btn: "Auswahl zurücksetzen",
    calculate_btn: "BERECHNEN",
    wall_killer: "🛡️ Mauerbrecher",
    select_troop: "Truppe wählen",
    select_placeholder: "— Wählen —",
    none: "— Keine —",
    strength_bonus: "Stärke Bonus (%)",
    health_bonus: "Leben Bonus (%)",
    eff_bonus: "Effektiver Bonus",
    req_troops: "Benötigte Truppen",
    citadel_losses: "Verluste beim Erstschlag",
    action_required: "⛔ Aktion erforderlich",
    select_first_striker_msg: "Du musst zuerst den Ersten Angreifer auswählen.",
    invalid_order: "⚠️ Ungültige Reihenfolge",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} hat höhere BASIS-Werte (Str: ${str1}, HP: ${hp1}) als der Erste Angreifer (${name2} - Str: ${str2}, HP: ${hp2}).\n\nWähle einen stärkeren Ersten Angreifer!`,
    results_title: "📋 Ergebnisse",
    mode_label: "Modus",
    citadel_label: "Zitadelle",
    copy_btn: "📄 Liste kopieren",
    copy_success: "✅ Kopiert!",
    copy_fail: "❌ Fehler beim Kopieren",
    no_results: "Keine Ergebnisse.",
    strikers: ["Erster Angreifer", "Zweiter Angreifer", "Dritter Angreifer", "Aufräumer 1", "Aufräumer 2", "Aufräumer 3", "Aufräumer 4", "Aufräumer 5", "Aufräumer 6"],
    help_goal_title: "🎯 Ziel",
    help_goal_text: "Verwende die richtigen Truppen und Boni, um Verluste zu minimieren. Die Truppenauswahl habe ich bereits optimiert.",
    help_rule_title: "❗ Wichtigste Regel",
    help_rule_text: "Maximiere das Leben des Ersten Angreifers. Bei einem korrekten Angriff sollte nur diese Gruppe Verluste erleiden. Die Anzahl der TRUPPEN DES ERSTEN ANGREIFERS KANN höher sein als berechnet. Alle anderen Truppen MÜSSEN exakt wie berechnet verwendet werden.",
    help_first_title: "🦅 Erster Angreifer",
    help_first_text: "Muss die stärkste fliegende Garde sein: Corax oder Greif.",
    help_captains_title: "⚔️ Hauptmänner",
    help_captains_text: "Empfohlen: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artefakte",
    help_arti_text: "Verwende Artefakte, die das Leben für Fliegende, Gardisten oder die Armee erhöhen.",
    help_recalc_title: "🔄 Neu berechnen",
    help_recalc_text: "Nach JEDER Änderung des Stärkebonus neu berechnen. Kleine Änderungen sind wichtig!",
    help_bonus_title: "❓ Wie finde ich Boni?",
    help_bonus_text1: "Greife eine Zitadelle Level 10 mit je 10 Einheiten der gewählten Truppen an. Kopiere die Boni aus dem Bericht.",
    help_bonus_text2: "Oder wähle Hauptmänner, Ausrüstung und Artefakte. Sende Held und Drache zur Festung und kopiere die Boni aus der Kaserne."
  },
  fr: {
    language: "Langue",
    setup: "⚙️ Config",
    instructions_btn: "ℹ️ Instructions",
    m8_question: "Avez-vous des troupes M8/M9 ?",
    yes: "Oui",
    no: "Non",
    citadel_level: "Niveau Citadelle",
    reset_btn: "Réinitialiser",
    calculate_btn: "CALCULER",
    wall_killer: "🛡️ Briseur de Mur",
    select_troop: "Choisir Troupe",
    select_placeholder: "— Choisir —",
    none: "— Aucun —",
    strength_bonus: "Bonus Force (%)",
    health_bonus: "Bonus Vie (%)",
    eff_bonus: "Bonus Effectif",
    req_troops: "Troupes Requises",
    citadel_losses: "Pertes Première Frappe",
    action_required: "⛔ Action Requise",
    select_first_striker_msg: "Vous devez sélectionner le Premier Frappeur avant les autres.",
    invalid_order: "⚠️ Ordre Invalide",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} a des stats DE BASE plus élevées (Str: ${str1}, HP: ${hp1}) que le Premier Frappeur (${name2} - Str: ${str2}, HP: ${hp2}).\n\nChoisissez un Premier Frappeur plus fort !`,
    results_title: "📋 Résultats",
    mode_label: "Mode",
    citadel_label: "Citadelle",
    copy_btn: "📄 Copier la liste",
    copy_success: "✅ Copié !",
    copy_fail: "❌ Échec",
    no_results: "Aucun résultat.",
    strikers: ["Premier Frappeur", "Deuxième Frappeur", "Troisième Frappeur", "Nettoyeur 1", "Nettoyeur 2", "Nettoyeur 3", "Nettoyeur 4", "Nettoyeur 5", "Nettoyeur 6"],
    help_goal_title: "🎯 Objectif",
    help_goal_text: "Utilisez les bonnes troupes et bonus pour minimiser les pertes. La sélection des troupes est gérée par l'app.",
    help_rule_title: "❗ Règle Importante",
    help_rule_text: "Maximisez la Vie du Premier Frappeur. C'est le seul groupe qui doit subir des pertes. Le nombre de troupes du PREMIER FRAPPEUR PEUT être supérieur au calcul. Les autres troupes DOIVENT être exactes.",
    help_first_title: "🦅 Premier Frappeur",
    help_first_text: "Doit être la Garde Volante la plus forte : Corax ou Griffon.",
    help_captains_title: "⚔️ Capitaines",
    help_captains_text: "Recommandés : Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artefacts",
    help_arti_text: "Utilisez des artefacts augmentant la Vie (Volants, Gardes ou Armée).",
    help_recalc_title: "🔄 Recalculer",
    help_recalc_text: "Après CHAQUE changement de bonus, recalculez.",
    help_bonus_title: "❓ Trouver les bonus ?",
    help_bonus_text1: "Attaquez une Citadelle niv. 10 avec 10 unités de chaque type. Copiez les bonus du rapport.",
    help_bonus_text2: "Ou sélectionnez capitaines et artefacts, envoyez le héros au fort et copiez les bonus de la caserne."
  },
  es: {
    language: "Idioma",
    setup: "⚙️ Configuración",
    instructions_btn: "ℹ️ Instrucciones",
    m8_question: "¿Tienes tropas M8/M9?",
    yes: "Sí",
    no: "No",
    citadel_level: "Nivel Ciudadela",
    reset_btn: "Reiniciar Selección",
    calculate_btn: "CALCULAR",
    wall_killer: "🛡️ Rompemuros",
    select_troop: "Elegir Tropa",
    select_placeholder: "— Elegir —",
    none: "— Ninguno —",
    strength_bonus: "Bono Fuerza (%)",
    health_bonus: "Bono Salud (%)",
    eff_bonus: "Bono Efectivo",
    req_troops: "Tropas Req.",
    citadel_losses: "Pérdidas Primer Golpe",
    action_required: "⛔ Acción Requerida",
    select_first_striker_msg: "Debes seleccionar el Primer Atacante antes que los demás.",
    invalid_order: "⚠️ Orden Inválido",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} tiene estadísticas BASE más altas (Fue: ${str1}, Sal: ${hp1}) que el Primer Atacante (${name2} - Fue: ${str2}, Sal: ${hp2}).\n\n¡Elige un Primer Atacante más fuerte!`,
    results_title: "📋 Resultados",
    mode_label: "Modo",
    citadel_label: "Ciudadela",
    copy_btn: "📄 Copiar Lista",
    copy_success: "✅ ¡Copiado!",
    copy_fail: "❌ Fallo al copiar",
    no_results: "Sin resultados.",
    strikers: ["Primer Atacante", "Segundo Atacante", "Tercer Atacante", "Limpieza 1", "Limpieza 2", "Limpieza 3", "Limpieza 4", "Limpieza 5", "Limpieza 6"],
    help_goal_title: "🎯 Objetivo",
    help_goal_text: "Usa las tropas y bonos correctos para minimizar pérdidas.",
    help_rule_title: "❗ Regla Importante",
    help_rule_text: "Maximiza la Salud del Primer Atacante. Es el único grupo que debe sufrir bajas. La cantidad de tropas del PRIMER ATACANTE PUEDE ser mayor a la calculada. Las demás deben ser exactas.",
    help_first_title: "🦅 Primer Atacante",
    help_first_text: "Debe ser la Guardia Voladora más fuerte: Corax o Grifo.",
    help_captains_title: "⚔️ Capitanes",
    help_captains_text: "Recomendados: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artefactos",
    help_arti_text: "Usa artefactos que aumenten la Salud (Voladores, Guardias o Ejército).",
    help_recalc_title: "🔄 Recalcular",
    help_recalc_text: "Tras CUALQUIER cambio en bonos, calcula de nuevo.",
    help_bonus_title: "❓ ¿Cómo ver los bonos?",
    help_bonus_text1: "Ataca una Ciudadela nv. 10 con 10 unidades de cada tipo. Copia los bonos del informe.",
    help_bonus_text2: "O selecciona capitanes y artefactos, envía al héroe al fuerte y copia los bonos del cuartel."
  },
  it: {
    language: "Lingua",
    setup: "⚙️ Setup",
    instructions_btn: "ℹ️ Istruzioni",
    m8_question: "Hai truppe M8/M9?",
    yes: "Sì",
    no: "No",
    citadel_level: "Livello Cittadella",
    reset_btn: "Resetta Truppe",
    calculate_btn: "CALCOLA",
    wall_killer: "🛡️ Distruggi Mura",
    select_troop: "Seleziona Truppa",
    select_placeholder: "— Seleziona —",
    none: "— Nessuno —",
    strength_bonus: "Bonus Forza (%)",
    health_bonus: "Bonus Salute (%)",
    eff_bonus: "Bonus Effettivo",
    req_troops: "Truppe Richieste",
    citadel_losses: "Perdite Primo Colpo",
    action_required: "⛔ Azione Richiesta",
    select_first_striker_msg: "Devi selezionare il Primo Attaccante prima degli altri.",
    invalid_order: "⚠️ Ordine Non Valido",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} ha statistiche BASE più alte (Str: ${str1}, HP: ${hp1}) del Primo Attaccante (${name2} - Str: ${str2}, HP: ${hp2}).\n\nScegli un Primo Attaccante più forte!`,
    results_title: "📋 Risultati",
    mode_label: "Modalità",
    citadel_label: "Cittadella",
    copy_btn: "📄 Copia Lista",
    copy_success: "✅ Copiato!",
    copy_fail: "❌ Errore copia",
    no_results: "Nessun risultato.",
    strikers: ["Primo Attaccante", "Secondo Attaccante", "Terzo Attaccante", "Pulizia 1", "Pulizia 2", "Pulizia 3", "Pulizia 4", "Pulizia 5", "Pulizia 6"],
    help_goal_title: "🎯 Obiettivo",
    help_goal_text: "Usa truppe e bonus corretti per minimizzare le perdite.",
    help_rule_title: "❗ Regola Importante",
    help_rule_text: "Massimizza la Salute del Primo Attaccante. È l'unico gruppo che dovrebbe subire perdite. Il numero di truppe del PRIMO ATTACCANTE PUÒ essere maggiore del calcolato. Le altre devono essere esatte.",
    help_first_title: "🦅 Primo Attaccante",
    help_first_text: "Deve essere la Guardia Volante più forte: Corax o Grifone.",
    help_captains_title: "⚔️ Capitani",
    help_captains_text: "Consigliati: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artefatti",
    help_arti_text: "Usa artefatti che aumentano la Salute (Volanti, Guardie o Esercito).",
    help_recalc_title: "🔄 Ricalcola",
    help_recalc_text: "Dopo QUALSIASI cambio di bonus, ricalcola.",
    help_bonus_title: "❓ Come trovare i bonus?",
    help_bonus_text1: "Attacca una Cittadella liv. 10 con 10 unità per tipo. Copia i bonus dal report.",
    help_bonus_text2: "Oppure seleziona capitani e artefatti, invia l'eroe al forte e copia i bonus dalla caserma."
  },
  pl: {
    language: "Język",
    setup: "⚙️ Ustawienia",
    instructions_btn: "ℹ️ Instrukcja",
    m8_question: "Masz jednostki M8/M9?",
    yes: "Tak",
    no: "Nie",
    citadel_level: "Poziom Cytadeli",
    reset_btn: "Resetuj Wybór",
    calculate_btn: "OBLICZ",
    wall_killer: "🛡️ Niszczyciel Murów",
    select_troop: "Wybierz Jednostkę",
    select_placeholder: "— Wybierz —",
    none: "— Brak —",
    strength_bonus: "Bonus Siły (%)",
    health_bonus: "Bonus Życia (%)",
    eff_bonus: "Efektywny Bonus",
    req_troops: "Wymagane",
    citadel_losses: "Straty (Pierwsze Uderzenie)",
    action_required: "⛔ Wymagana Akcja",
    select_first_striker_msg: "Musisz wybrać Pierwszego Atakującego przed innymi.",
    invalid_order: "⚠️ Zła Kolejność",
    base_stats_warning: (name1, str1, hp1, name2, str2, hp2) => `${name1} ma wyższe statystyki BAZOWE (Siła: ${str1}, Życie: ${hp1}) niż Pierwszy Atakujący (${name2} - Siła: ${str2}, Życie: ${hp2}).\n\nWybierz silniejszego Pierwszego Atakującego!`,
    results_title: "📋 Wyniki",
    mode_label: "Tryb",
    citadel_label: "Cytadela",
    copy_btn: "📄 Kopiuj Listę",
    copy_success: "✅ Skopiowano!",
    copy_fail: "❌ Błąd kopiowania",
    no_results: "Brak wyników.",
    strikers: ["Pierwszy Atak", "Drugi Atak", "Trzeci Atak", "Czyszczenie 1", "Czyszczenie 2", "Czyszczenie 3", "Czyszczenie 4", "Czyszczenie 5", "Czyszczenie 6"],
    help_goal_title: "🎯 Cel",
    help_goal_text: "Użyj odpowiednich jednostek i bonusów, aby zminimalizować straty.",
    help_rule_title: "❗ Najważniejsza Zasada",
    help_rule_text: "Zmaksymalizuj Życie Pierwszego Atakującego. To jedyna grupa, która powinna ponieść straty. Liczba jednostek PIERWSZEGO ATAKUJĄCEGO MOŻE być wyższa niż obliczona. Pozostałe muszą być dokładne.",
    help_first_title: "🦅 Pierwszy Atakujący",
    help_first_text: "Musi być najsilniejszą latającą Gwardią: Corax lub Gryf.",
    help_captains_title: "⚔️ Kapitanowie",
    help_captains_text: "Zalecani: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.",
    help_arti_title: "✨ Artefakty",
    help_arti_text: "Używaj artefaktów zwiększających Życie (Latające, Gwardia lub Armia).",
    help_recalc_title: "🔄 Przelicz",
    help_recalc_text: "Po KAŻDEJ zmianie bonusu siły, oblicz ponownie.",
    help_bonus_title: "❓ Jak znaleźć bonusy?",
    help_bonus_text1: "Zaatakuj Cytadelę poz. 10 używając po 10 jednostek każdego typu. Skopiuj bonusy z raportu.",
    help_bonus_text2: "Lub wybierz kapitanów i artefakty, wyślij bohatera do fortu i skopiuj bonusy z koszar."
  }
};

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
  return {
    pageBg: "#050505",
    cardBg: "linear-gradient(180deg, rgba(20,22,28,0.95) 0%, rgba(12,13,16,0.98) 100%)",
    border: "rgba(197, 160, 89, 0.75)",
    borderSoft: "rgba(255, 255, 255, 0.08)",
    text: "#ececec",
    subtext: "#a0a0a0",
    inputBg: "linear-gradient(180deg, rgba(15,16,18,0.92) 0%, rgba(8,8,9,0.92) 100%)",
    inputBorder: "rgba(197, 160, 89, 0.55)",
    btnBg: "linear-gradient(135deg, #c5a059 0%, #9a7b3a 100%)",
    btnText: "#000000",
    btnGhostBg: "rgba(255, 255, 255, 0.05)",
    btnGhostBorder: "rgba(197, 160, 89, 0.55)",
    overlay: "rgba(0,0,0,0.45)",
    accent: "#c5a059",
    danger: "#ff4d4d",
    shadow: "0 10px 30px rgba(0,0,0,0.7)",
    cardShadow: "0 10px 28px rgba(0,0,0,0.6)",
    goldGlow: "0 0 0 1px rgba(197,160,89,0.25), 0 0 18px rgba(197,160,89,0.12)",
    goldGlowStrong: "0 0 0 1px rgba(197,160,89,0.35), 0 0 26px rgba(197,160,89,0.18)",
  };
}

// 🛡️ CARD
function Card({ title, children, theme, className }) {
  return (
    <div
      className={className}
      style={{
        border: `1.5px solid ${theme.border}`,
        borderRadius: 12,
        padding: 16,
        background: theme.cardBg,
        boxShadow: `${theme.cardShadow}, ${theme.goldGlow}`,
        position: "relative",
        height: "100%", 
      }}
    >
      <div style={{position: "absolute", left: 0, top: 16, bottom: 16, width: 3, background: theme.accent, borderRadius: "0 2px 2px 0"}}></div>
      <div style={{ 
        fontWeight: 700, fontSize: 16, marginBottom: 16, color: theme.accent, 
        fontFamily: "'Cinzel', serif", letterSpacing: "1px", textTransform: "uppercase", paddingLeft: 12 
      }}>
        {title}
      </div>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

// 🛡️ PICKER (TROOPS - POPUP CENTERED)
function TroopPicker({ label, value, options, onChange, theme, inputStyle, locked, onLockedClick, t }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const buttonRef = useRef(null);
  const display = value ? value : t('select_placeholder');

  const handleClick = () => {
    if (locked) {
      if (onLockedClick) onLockedClick();
    } else {
      if (buttonRef.current) {
        setAnchorRect(buttonRef.current.getBoundingClientRect());
      }
      setOpen((v) => !v);
    }
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        style={{
          ...inputStyle,
          textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, 
          cursor: "pointer",
          background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)",
          boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)`
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {value ? (
            iconSrcForTroop(value) ? (
              <img src={iconSrcForTroop(value)} alt={value} width={36} height={36} style={{ borderRadius: 6, flexShrink: 0, border: "1px solid #333" }} loading="lazy" />
            ) : null
          ) : (
             <div style={{width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px dashed #444"}}></div>
          )}
          <span style={{ color: value ? theme.text : theme.subtext, fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
            {display}
          </span>
        </span>
        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>
      
      {/* MODE = TROOP (Centrirano vertikalno, poravnato horizontalno) */}
      <Modal open={open} title={`${t('select_troop')}`} onClose={() => setOpen(false)} theme={theme} mode="troop" anchorRect={anchorRect}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? t('none') : opt;
            const isSelected = opt === value;
            return (
              <button
                key={opt || "__blank__"}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8,
                  border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent",
                  background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? theme.accent : theme.text,
                  fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.1s",
                }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img src={iconSrcForTroop(opt)} alt={opt} width={40} height={40} style={{ borderRadius: 6, flexShrink: 0 }} loading="lazy" />
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

// 🛡️ OPTION PICKER (SETUP - DROPDOWN STYLE)
function OptionPicker({ label, value, options, onChange, theme, inputStyle, t }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const buttonRef = useRef(null);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : t('select_placeholder');

  const handleClick = () => {
    if (buttonRef.current) {
        setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen((v) => !v);
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick} 
        style={{
          ...inputStyle,
          textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer",
          background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)",
          boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)`,
        }}
      >
        <span style={{ color: selected ? theme.text : theme.subtext, fontWeight: 800, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {display}
        </span>
        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>

      {/* MODE = DROPDOWN (Ispod gumba) */}
      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme} mode="dropdown" anchorRect={anchorRect}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 12px", borderRadius: 10,
                  border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent",
                  background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? theme.accent : theme.text,
                  fontWeight: 800, fontSize: 18, cursor: "pointer",
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

// 🛡️ LANGUAGE PICKER (NOVA KOMPONENTA)
function LanguagePicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const buttonRef = useRef(null);
  const selected = options.find((o) => o.code === value);
  const display = selected ? `${selected.flag} ${selected.label}` : "— Select —";

  const handleClick = () => {
    if (buttonRef.current) {
        setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen((v) => !v);
  };

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick} 
        style={{
          ...inputStyle,
          textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer",
          background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)",
          boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)`,
        }}
      >
        <span style={{ color: theme.text, fontWeight: 800, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {display}
        </span>
        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme} mode="dropdown" anchorRect={anchorRect}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isSelected = opt.code === value;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => { onChange(opt.code); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 12px", borderRadius: 10,
                  border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent",
                  background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: isSelected ? theme.accent : theme.text,
                  fontWeight: 800, fontSize: 18, cursor: "pointer",
                }}
              >
                {opt.flag} {opt.label}
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 0", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <div style={{ color: theme.subtext, fontSize: 13, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 16, color: accent ? theme.accent : theme.text, fontFamily: "'Inter', sans-serif" }}>{value}</div>
    </div>
  );
}

// 🛡️ MODAL - UNIVERZALNI (3 NAČINA RADA)
function Modal({ open, title, onClose, children, theme, mode, anchorRect }) {
  if (!open) return null;
  
  let popoverStyle = {};

  if (mode === "dropdown" && anchorRect) {
      popoverStyle = { position: "fixed", top: anchorRect.bottom + 6, left: anchorRect.left, width: anchorRect.width, minWidth: "200px", maxHeight: "350px", zIndex: 99999, margin: 0 };
  } else if (mode === "troop" && anchorRect) {
      popoverStyle = { position: "fixed", top: "50%", left: anchorRect.left, width: anchorRect.width, minWidth: "250px", maxWidth: "400px", transform: "translateY(-50%)", maxHeight: "80vh", zIndex: 99999, margin: 0 };
  } else {
      popoverStyle = { position: "relative", width: "100%", maxWidth: 500, maxHeight: "80vh" };
  }

  const isOverlay = !mode; 

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, 
        background: isOverlay ? "rgba(0,0,0,0.7)" : "transparent",
        display: isOverlay ? "flex" : "block", alignItems: "center", justifyContent: "center",
        padding: isOverlay ? 20 : 0, zIndex: 99990, backdropFilter: isOverlay ? "blur(5px)" : "none",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...popoverStyle,
          background: "linear-gradient(180deg, rgba(28,30,36,0.99) 0%, rgba(14,15,18,0.99) 100%)",
          color: theme.text, borderRadius: 12,
          border: `1px solid ${theme.accent}`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.8), ${theme.goldGlowStrong}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {mode !== "dropdown" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "rgba(197, 160, 89, 0.05)", borderBottom: `1px solid ${theme.borderSoft}` }}>
            <div style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Cinzel', serif", color: theme.accent, textTransform: "uppercase" }}>{title}</div>
            <button onClick={onClose} style={{ border: "none", background: "transparent", color: theme.text, width: 32, height: 32, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
        )}
        <div style={{ padding: mode === "dropdown" ? 6 : 16, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);
  const [lang, setLang] = useState("en"); // State za jezik

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"][key] || key;

  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    const timer = setTimeout(() => { setIntroFinished(true); }, 1200); 
    return () => clearTimeout(timer);
  }, []);

  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];

  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I"))) m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
    return m;
  }, [troops]);

  const troopByName = useMemo(() => new Map(troops.map((t) => [t.name, t])), [troops]);
  const additionalBonus = TB.additionalBonusNormal ?? {};
  const phoenixExtra = TB.phoenixExtra ?? {};
  const firstStrikerAllowed = TB.firstStrikerAllowed ?? {};

  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState(MODE_WITHOUT);
  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [orderWarningMsg, setOrderWarningMsg] = useState(false);

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
    if (n.startsWith("punisher") || n.startsWith("heavy halberdier") || n.startsWith("spearmen")) return "PHH_SPEAR";
    if (n.startsWith("duelist") || n.startsWith("heavy knight") || n.startsWith("swordsmen")) return "DUEL_HK_SW";
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

  const inputStyle = useMemo(() => ({
      padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg, color: theme.text, outline: "none",
      WebkitAppearance: "none", appearance: "none", width: "100%", boxSizing: "border-box",
      fontSize: 16, fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s",
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

  // --- LOGIKA ZA FILTRIRANJE TRUPA PO POZICIJAMA ---
  const optionsForIdx = (idx) => {
    const taken = new Set(strikerTroops.filter((_, i) => i !== idx).filter(Boolean).map(normName));
    let pool;
    if (idx === 0) pool = firstAllowed;
    else if (idx === 1) pool = secondAllowed;
    else pool = nonWallPool;
    const filtered = pool.filter((n) => !taken.has(normName(n)));
    
    let result = filtered;

    // 1. ZABRANA: Epic Monster Hunter ne smije biti 1., 2. ili 3. napadač (indeksi 0, 1, 2)
    // Može se birati tek od Cleanup 1 (indeks 3) nadalje
    if (idx <= 2) {
       result = result.filter(n => normName(n) !== normName("Epic Monster Hunter"));
    }

    // 2. ZABRANA: U "With M8" modu Manticore ne smije biti 3. napadač (indeks 2)
    if (mode === MODE_WITH && idx === 2) {
       result = result.filter(n => normName(n) !== normName("Manticore"));
    }

    // 3. ZABRANA: U "Without M8" modu, određene pješačke jedinice ne smiju biti 3. napadač
    if (mode === MODE_WITHOUT && idx === 2) {
        const excluded = ["Punisher I", "Heavy Halberdier VII", "Heavy Halberdier VI", "Duelist I", "Heavy Knight VII", "Heavy Knight VI", "Spearmen V", "Swordsmen V"];
        result = result.filter(n => !excluded.some(e => normName(e) === normName(n)));
    }

    if (idx !== 1) return ["", ...result];
    return result;
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
          const strikerLabels = TRANSLATIONS[lang]?.strikers || TRANSLATIONS['en'].strikers;
          const label = strikerLabels[idx];
          
          const warningFn = TRANSLATIONS[lang]?.base_stats_warning || TRANSLATIONS['en'].base_stats_warning;
          setWarningMsg(warningFn(label, fmtInt(pickedS), fmtInt(pickedH), first, fmtInt(firstS), fmtInt(firstH)));
          
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
    const requiredTroops = dmgPerTroop > 0 ? (Math.ceil(wallHP / dmgPerTroop) + 2) : 0;
    return { effBonus, requiredTroops };
  }, [cit, wallKillerTroop, wallKillerBonusPct, troopByName]);

  const perStriker = useMemo(() => {
    if (!cit || !targets || targets.length !== 9) return [];
    
    // Get localized labels
    const labels = TRANSLATIONS[lang]?.strikers || TRANSLATIONS['en'].strikers;

    return STRIKER_LABELS.map((_, idx) => {
      const label = labels[idx];
      const troopName = strikerTroops[idx];
      const troop = troopByName.get(troopName);
      let effBonus = toNum(strikerBonusPct[idx]);
      if (troopName && additionalBonus[troopName] !== undefined) effBonus += toNum(additionalBonus[troopName]);
      if (troopName && mode === MODE_WITH && idx === 1 && phoenixExtra[troopName] !== undefined) effBonus += toNum(phoenixExtra[troopName]);
      const baseStrength = troop ? toNum(troop.strength) : 0;
      const dmgPerTroop = baseStrength * (1 + effBonus / 100);
      const targetHP = toNum(targets[idx]);
      let required = dmgPerTroop > 0 ? Math.floor(targetHP / dmgPerTroop) : 0;
      
      // LOGIKA ZA SMANJENJE EPIC MONSTER HUNTERA (Samo ako je cleanup > 2)
      // I ako je odabran (što je moguće samo na pozicijama 3+)
      if (idx > 2 && normName(troopName) === normName("Epic Monster Hunter")) {
         required = Math.max(0, required - 5);
      }

      if (idx === 0 && dmgPerTroop > 0) required += firstDeaths + 10;
      return { idx, label, troopName, effBonus, requiredTroops: required };
    });
  }, [cit, targets, strikerTroops, strikerBonusPct, troopByName, additionalBonus, phoenixExtra, mode, firstDeaths, lang]);

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
      modeLabel: mode === MODE_WITH ? t('yes') : t('no'),
      citadelLabel: `Elven ${citadelLevel}`,
      troops: ordered,
    });
    setResultsOpen(true);
  };

  // --- ENTER KEY HANDLER ---
  const handleEnter = (e, nextId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextElement = document.getElementById(nextId);
      if (nextElement) {
        nextElement.focus();
        if (nextElement.tagName === "INPUT") {
          nextElement.select(); // Oznacava tekst za lakse prepisivanje
        }
      }
    }
  };

  const handleInstructionsOpen = (e) => {
    setHelpOpen(true);
  };

  return (
    <div
      className={`app-background ${introFinished ? "app-loaded" : "app-loading"}`}
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: theme.pageBg,
        color: theme.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 0, pointerEvents: "none" }} />

      <style>{`
        html, body, #root { width: 100%; max-width: 100%; margin: 0; padding: 0; }
        #root { display: block; }
        *, *::before, *::after { box-sizing: border-box; }
        :root { color-scheme: dark; }

        html { overflow-y: scroll; }
        html, body { overflow-x: visible; }
        @media (max-width: 1099px) { html, body { overflow-x: hidden; } }

        .app-background {
          background-image: url('./bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          transition: background-image 0.3s ease-in-out;
        }
        @media (min-width: 768px) { .app-background { background-image: url('./bg-desktop.jpg'); } }

        .header-wrapper {
          transition: transform 2.0s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
          position: relative; z-index: 10;
        }
        .app-loading .header-wrapper { transform: translateY(40vh); }
        .app-loaded .header-wrapper { transform: translateY(0); }

        .content-wrapper { transition: opacity 1.8s ease 0.6s, transform 1.8s ease 0.6s; opacity: 1; transform: translateY(0); }
        .app-loading .content-wrapper { opacity: 0; transform: translateY(50px); pointer-events: none; }

        .mobile-bottom-bar { transition: opacity 1.8s ease 0.6s, transform 1.8s ease 0.6s; opacity: 1; transform: translateY(0); box-sizing: border-box; }
        .mobile-bottom-bar.hidden { opacity: 0; transform: translateY(20px); pointer-events: none; }

        .app-container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px 16px 100px 16px; position: relative; z-index: 1; }

        @media (min-width: 1100px) {
          .app-container { max-width: 1300px; padding-bottom: 40px; }
          .main-layout-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
          .layout-sidebar { position: sticky; top: 20px; align-self: start; z-index: 100; height: fit-content; max-height: calc(100vh - 40px); overflow-y: auto; padding-right: 4px; }
          .striker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
          .mobile-bottom-bar { display: none !important; }
          .desktop-calc-btn { display: block !important; }
        }

        @media (max-width: 1099px) {
          .main-layout-grid { display: flex; flex-direction: column; gap: 16px; }
          .striker-grid { display: flex; flex-direction: column; gap: 16px; }
          .desktop-calc-btn { display: none !important; }
        }

        input:focus, select:focus, button:focus { outline: none !important; border-color: rgba(197,160,89,0.85) !important; box-shadow: 0 0 0 2px rgba(197,160,89,0.35), 0 0 22px rgba(197,160,89,0.12) !important; }

        /* FOOTER STYLE - SA PADDING FIXOM */
        .app-footer { text-align: center; padding: 4px; font-size: 14px; color: ${theme.subtext}; opacity: 0.9; }
        @media (min-width: 1100px) { .app-footer { padding-bottom: 18px; } }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
      `}</style>

      <div className="app-container">
        
        {/* HEADER WRAPPER - BEZ SCALINGA */}
        <div className="header-wrapper">
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
              marginTop: 6, fontSize: 12, fontWeight: 800, letterSpacing: 3,
              textTransform: "uppercase", color: theme.accent, opacity: 1, textShadow: "0 2px 10px rgba(0,0,0,0.8)", fontFamily: "'Inter', sans-serif",
            }}>
              by GM
            </div>
          </div>
        </div>

        {/* CONTENT WRAPPER ZA FADE IN */}
        <div className="content-wrapper">
          {/* --- MAIN GRID LAYOUT START --- */}
          <div className="main-layout-grid">
            
            {/* LEFT SIDEBAR (Setup Only) - STICKY NA DESKTOPU */}
            <div className="layout-sidebar">
              <Card title={t('setup')} theme={theme}>
                
                {/* JEZIČNI PAD (DROPDOWN) */}
                <div style={{ marginBottom: 16 }}>
                  <LanguagePicker 
                    label={t('language')}
                    value={lang}
                    options={LANGUAGES}
                    onChange={setLang}
                    theme={theme}
                    inputStyle={inputStyle}
                  />
                </div>

                <button
                  onClick={handleInstructionsOpen}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 10,
                    border: `1px solid ${theme.border}`, background: theme.btnGhostBg,
                    color: theme.text, fontWeight: 700, fontSize: 15, marginBottom: 16,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <span>{t('instructions_btn')}</span>
                </button>

                <div style={{ display: "grid", gap: 16 }}>
                  <OptionPicker
                    label={t('m8_question')}
                    value={mode}
                    options={[{ value: MODE_WITHOUT, label: t('no') }, { value: MODE_WITH, label: t('yes') }]}
                    onChange={(v) => handleModeChange(v)}
                    theme={theme} inputStyle={inputStyle} t={t}
                  />
                  <OptionPicker
                    label={t('citadel_level')}
                    value={citadelLevel}
                    options={citadelKeys.map((lvl) => ({ value: lvl, label: `Elven ${lvl}` }))}
                    onChange={(v) => { setCitadelLevel(v); setCalcOutput(null); setResultsOpen(false); }}
                    theme={theme} inputStyle={inputStyle} t={t}
                  />
                  <button onClick={resetSelections}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${theme.danger}`, background: "rgba(255, 77, 77, 0.15)",
                      color: "#ff6b6b", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8,
                    }}
                  >
                    {t('reset_btn')}
                  </button>
                </div>
              </Card>

              {/* DESKTOP CALCULATE BUTTON - POPRAVLJEN SHADOW */}
              <button 
                id="btn-calculate-desktop"
                className="desktop-calc-btn" 
                onClick={showResults} 
                style={{
                  width: "100%", padding: "20px", borderRadius: 12, border: "none",
                  background: theme.btnBg, color: theme.btnText,
                  fontWeight: 900, letterSpacing: 1, fontSize: 20, fontFamily: "'Cinzel', serif",
                  // Smanjen shadow (bio je 25px, sad je 15px i ima mali offset) da ne izgleda kao blok
                  boxShadow: `0 4px 15px rgba(197, 160, 89, 0.4)`, 
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  marginTop: 16,
                }}
              >
                {t('calculate_btn')}
              </button>
            </div>

            {/* RIGHT CONTENT (Wall Killer + Striker Grid) */}
            <div className="striker-grid">
              
              {/* WALL KILLER */}
              <Card title={t('wall_killer')} theme={theme}>
                <div style={{ display: "grid", gap: 16 }}>
                  <TroopPicker
                    label={t('select_troop')} value={wallKillerTroop} options={wallKillerPool}
                    onChange={(v) => { setWallKillerTroop(v); setCalcOutput(null); setResultsOpen(false); }}
                    theme={theme} inputStyle={inputStyle} t={t}
                  />
                  <label style={{ display: "grid", gap: 8 }}>
                    <span style={{ color: theme.subtext, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>{t('strength_bonus')}</span>
                    <input 
                      id="bonus-wall"
                      type="number" step="any" inputMode="decimal" placeholder="0" value={wallKillerBonusPct}
                      onChange={(e) => { setWallKillerBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }}
                      onKeyDown={(e) => handleEnter(e, "bonus-health-0")}
                      style={inputStyle} onFocus={(e) => e.target.select()}
                    />
                  </label>
                  <div style={{ background: "rgba(0,0,0,0.42)", padding: "12px 16px", borderRadius: 10, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                      <Row label={t('eff_bonus')} value={`${fmtInt(wallKiller.effBonus)}%`} theme={theme} accent />
                      <Row label={t('req_troops')} value={fmtInt(wallKiller.requiredTroops)} theme={theme} accent />
                  </div>
                </div>
              </Card>

              {/* STRIKERS LOOP */}
              {perStriker.map((s) => {
                const idx = s.idx;
                const isFirst = idx === 0;
                const opts = optionsForIdx(idx);
                const nextInputId = idx < 8 ? `bonus-str-${idx + 1}` : "btn-calculate-desktop";

                // 🛡️ LOGIKA ZA LOCKED: Ako nije First Striker, a First Striker je prazan -> LOCKED
                const isFirstStrikerSelected = !!strikerTroops[0];
                const isLocked = !isFirst && !isFirstStrikerSelected;

                return (
                  <Card key={idx} title={`${idx + 1}. ${s.label}`} theme={theme}>
                    <div style={{ display: "grid", gap: 16 }}>
                      <TroopPicker
                        label={t('select_troop')} value={strikerTroops[idx]} options={opts}
                        onChange={(v) => handleTroopChange(idx, v)} theme={theme} inputStyle={inputStyle}
                        locked={isLocked} // <--- LOCKED UMJESTO DISABLED
                        onLockedClick={() => setOrderWarningMsg(true)} // <--- OTVORI POPUP
                        t={t}
                      />

                      {isFirst && (
                        <label style={{ display: "grid", gap: 8 }}>
                          <span style={{ color: "#ff8a8a", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{t('health_bonus')}</span>
                          <input 
                            id="bonus-health-0"
                            type="number" step="any" inputMode="decimal" placeholder="0" value={firstHealthBonusPct}
                            onChange={(e) => { setFirstHealthBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }}
                            onKeyDown={(e) => handleEnter(e, "bonus-str-0")}
                            style={{...inputStyle, borderColor: "rgba(255, 138, 138, 0.4)"}} onFocus={(e) => e.target.select()}
                          />
                        </label>
                      )}

                      <label style={{ display: "grid", gap: 8 }}>
                        <span style={{ color: "#80d8ff", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{t('strength_bonus')}</span>
                        <input 
                          id={`bonus-str-${idx}`}
                          type="number" step="any" inputMode="decimal" placeholder="0" value={strikerBonusPct[idx]}
                          onChange={(e) => setBonusAt(idx, e.target.value)}
                          onKeyDown={(e) => handleEnter(e, nextInputId)}
                          readOnly={isLocked} // <--- READONLY UMJESTO DISABLED
                          onClick={() => isLocked && setOrderWarningMsg(true)} // <--- KLIK OTVARA POPUP
                          style={{...inputStyle, borderColor: "rgba(128, 216, 255, 0.4)"}} onFocus={(e) => e.target.select()}
                        />
                      </label>

                      <div style={{ background: "rgba(0,0,0,0.42)", padding: "12px 16px", borderRadius: 10, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                          <Row label={t('eff_bonus')} value={`${fmtInt(s.effBonus)}%`} theme={theme} accent />
                          <Row label={t('req_troops')} value={fmtInt(s.requiredTroops)} theme={theme} accent />
                          {isFirst && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.borderSoft}` }}>
                              <Row label={t('citadel_losses')} value={fmtInt(firstDeaths)} theme={theme} />
                          </div>
                          )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {/* END RIGHT CONTENT */}
          </div>
          {/* --- MAIN GRID LAYOUT END --- */}
        </div>
        {/* END CONTENT WRAPPER */}

        {/* MOBILE BOTTOM BAR (Visible only on Mobile) - IZVUČEN IZVAN CONTENT WRAPPERA ZA FIX POZICIJU */}
        <div className={`mobile-bottom-bar ${introFinished ? "visible" : "hidden"}`} style={{
            position: "fixed", left: 0, width: "100%", bottom: 9, padding: 16, // FIX: width 100% instead of right:0
            background: "transparent", borderTop: "none", backdropFilter: "none", zIndex: 99
          }}>
          <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <button 
              id="btn-calculate-mobile"
              onClick={showResults} 
              style={{
                width: "100%", padding: "16px", borderRadius: 12, border: "none",
                background: theme.btnBg, color: theme.btnText,
                fontWeight: 900, letterSpacing: 1, fontSize: 18, fontFamily: "'Cinzel', serif",
                boxShadow: `0 0 20px rgba(197, 160, 89, 0.4)`, cursor: "pointer",
              }}
            >
              {t('calculate_btn')}
            </button>
          </div>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title={t('invalid_order')} onClose={() => setWarningMsg("")} theme={theme}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.text, fontSize: 16 }}>{warningMsg}</div>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
        </Modal>

        {/* --- NOVI POPUP ZA REDOSLIJED --- */}
        <Modal open={orderWarningMsg} title={t('action_required')} onClose={() => setOrderWarningMsg(false)} theme={theme}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.text, fontSize: 16 }}>
            {t('select_first_striker_msg')}
          </div>
          <button onClick={() => setOrderWarningMsg(false)} style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 10, border: "none", background: theme.accent, color: "#000", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>OK</button>
        </Modal>

        {/* --- INSTRUCTIONS MODAL (VRAĆEN NA STANDARD) --- */}
        <Modal open={helpOpen} title={t('instructions_btn')} onClose={() => setHelpOpen(false)} theme={theme}>
          <div style={{ color: theme.text, lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_goal_title')}</div><div style={{ color: theme.subtext }}>{t('help_goal_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.danger }}>{t('help_rule_title')}</div><div style={{ color: theme.subtext, borderLeft: `4px solid ${theme.danger}`, paddingLeft: 12 }}>{t('help_rule_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_first_title')}</div><div style={{ color: theme.subtext }}>{t('help_first_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_captains_title')}</div><div style={{ color: theme.subtext }}>{t('help_captains_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_arti_title')}</div><div style={{ color: theme.subtext }}>{t('help_arti_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_recalc_title')}</div><div style={{ color: theme.subtext }}>{t('help_recalc_text')}</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: theme.accent }}>{t('help_bonus_title')}</div><div style={{ color: theme.subtext }}>{t('help_bonus_text1')}<br /><br />{t('help_bonus_text2')}</div></div>
          </div>
        </Modal>

        <Modal open={resultsOpen} title={t('results_title')} onClose={() => setResultsOpen(false)} theme={theme}>
          {calcOutput ? (
            <>
              <div style={{ background: "rgba(0,0,0,0.32)", padding: 16, borderRadius: 12, marginBottom: 20, border: `1px solid ${theme.border}`, boxShadow: theme.goldGlow }}>
                  <Row label={t('mode_label')} value={calcOutput.modeLabel} theme={theme} accent />
                  <Row label={t('citadel_label')} value={calcOutput.citadelLabel} theme={theme} accent />
              </div>
              <button onClick={async () => {
                  const list = (calcOutput.lines || calcOutput.troops || []).map((t) => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
                  const ok = await copyToClipboard(list);
                  setCopyNotice(ok ? t('copy_success') : t('copy_fail'));
                  window.setTimeout(() => setCopyNotice(""), 1500);
                }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: theme.accent, color: "#000", fontWeight: 800, fontSize: 16, marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <span>📄</span> {t('copy_btn')}
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
          ) : (<div style={{ color: theme.subtext, textAlign: "center", padding: 20 }}>{t('no_results')}</div>)}
        </Modal>
      </div>
    
      <footer className="app-footer">
        © 2026 Game01Master · Non-commercial license
      </footer>
    </div>
  );
}
