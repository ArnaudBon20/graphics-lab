const REPORT_COLORS = {
  blue: "#284b8f",
  red: "#e35c50",
  grey: "#a7a7a2",
  paper: "#e9e6e2",
  grid: "#b7b4b0",
  text: "#22252b",
  muted: "#646b73",
  link: "#5d77a8",
};

const STORAGE_KEY = "graphics-lab-session-v4";
const PROJECTS_STORAGE_KEY = "graphics-lab-projects-v1";
const DEFAULT_CHART_TYPE = "annual-stacked";
const MIN_ROWS = 5;
const MAX_SERIES = 4;
const MAX_PROJECT_VERSIONS = 24;
const WORD_EXPORT_WIDTH_CM = 15.9;
const WORD_EXPORT_DPI = 300;
const EXPORT_FONT_FAMILY = '"League Spartan", "Helvetica Neue", Arial, sans-serif';
const DEFAULT_PREVIEW_VIEWPORT = "desktop";
const PREVIEW_VIEWPORTS = {
  mobile: { maxWidth: 420 },
  desktop: { maxWidth: 960 },
  wide: { maxWidth: 1320 },
};
const ANIMATION_DURATION_MS = 1800;
const VIDEO_HOLD_DURATION_MS = 500;
const VIDEO_FRAME_RATE = 30;
const VIDEO_BIT_RATE = 6_000_000;
const CRC32_TABLE = createCrc32Table();
const UI_LANGUAGE = (document.documentElement.lang || "fr").toLowerCase().startsWith("de")
  ? "de"
  : "fr";
const UI_TEXT = buildUiText(UI_LANGUAGE);
const CHART_CONFIGS = buildChartConfigs(UI_LANGUAGE);
const SAMPLE_STATES = buildSampleStates(UI_LANGUAGE, CHART_CONFIGS);

const form = document.querySelector("#editor-form");
const preview = document.querySelector("#chart-preview");
const previewStage = document.querySelector("#preview-stage");
const previewViewportButtons = Array.from(document.querySelectorAll("[data-preview-viewport]"));
const errorsList = document.querySelector("#errors-list");
const warningsList = document.querySelector("#warnings-list");
const qualityChip = document.querySelector("#quality-chip");
const previewMeta = document.querySelector("#preview-meta");
const dataRowsBody = document.querySelector("#data-rows");
const dataColumnsHead = document.querySelector("#data-columns");
const rowCountValue = document.querySelector("#row-count");
const seriesCountValue = document.querySelector("#series-count");
const totalValue = document.querySelector("#value-total");
const templateNote = document.querySelector("#template-note");
const seriesEditor = document.querySelector("#series-editor");
const addSeriesButton = document.querySelector("#add-series");
const projectStatus = document.querySelector("#project-status");
const projectVersionMeta = document.querySelector("#project-version-meta");
const projectHistory = document.querySelector("#project-history");
const playAnimationButton = document.querySelector("#play-animation");
const exportVideoButton = document.querySelector("#export-video");

const fields = {
  projectName: document.querySelector("#project-name"),
  title: document.querySelector("#title"),
  subtitle: document.querySelector("#subtitle"),
  chartType: document.querySelector("#chart-type"),
  locale: document.querySelector("#locale"),
  source: document.querySelector("#source"),
  owner: document.querySelector("#owner"),
  methodology: document.querySelector("#methodology"),
  altText: document.querySelector("#alt-text"),
  csvImport: document.querySelector("#csv-import"),
};

let currentChartType = DEFAULT_CHART_TYPE;
let seriesConfig = [];
let dataRows = [];
let currentProjectId = null;
let currentVersionId = null;
let currentPreviewViewport = DEFAULT_PREVIEW_VIEWPORT;
let isPreviewAnimating = false;
let isVideoExporting = false;

function buildUiText(language) {
  if (language === "de") {
    return {
      jsonCopied: "JSON kopiert",
      clipboardDenied: "Der Browser hat den Zugriff auf die Zwischenablage verweigert.",
      pngExportFailed: "PNG kann im Moment nicht exportiert werden.",
      noCsvData: "Im CSV wurden keine verwertbaren Daten gefunden.",
      importInvalidRows: ({ count }) =>
        `${count} Zeile(n) konnten nicht importiert werden, weil sie unvollstaendig oder ungueltig sind.`,
      unsavedProject: "Projekt nicht gespeichert",
      noLocalVersions: "Noch keine lokale Version vorhanden.",
      projectDraft: "Lokaler Entwurf laeuft. Speichere eine Version, um sie in die Historie aufzunehmen.",
      projectLoaded: ({ count, date }) => `${count} lokale Version(en). Geladene Version: ${date}.`,
      historyEmpty: "Speichere eine erste Version, um eine lokale Projektbibliothek aufzubauen.",
      historyKicker: "Historie",
      historyLast: "Neueste",
      historyProjectKicker: "Projekt",
      historyVersions: "Versionen",
      historyUpdatedAt: ({ date }) => `Aktualisiert am ${date}`,
      historyLoadLatest: "Neueste laden",
      deleteVersionAria: ({ date }) => `Version vom ${date} loeschen`,
      deleteVersionConfirm: ({ date }) => `Version vom ${date} loeschen?`,
      untitledProject: "Unbenanntes Projekt",
      titleRequired: "Der Titel ist obligatorisch.",
      sourceRequired: "Die Quelle ist obligatorisch.",
      minRows: "Es braucht mindestens zwei Datenzeilen.",
      invalidRows: ({ count }) => `${count} Datenzeile(n) enthalten einen ungueltigen Wert.`,
      minSeriesStacked: "Das gestapelte Template braucht mindestens zwei Serien.",
      altTextEmpty: "Der Alternativtext ist leer.",
      methodologyEmpty: "Die methodische Notiz ist leer.",
      ownerMissing: "Die verantwortliche Stelle ist nicht angegeben.",
      duplicateLabels: "Einige Beschriftungen sind doppelt.",
      longLabels: "Einige Beschriftungen sind lang und koennten das Layout sprengen.",
      columnTooManyRows: "Bei vertikalen Saeulen werden mehr als 8 Kategorien schnell schwer lesbar.",
      annualStackedTooManyRows:
        "Das gestapelte Jahrestemplate wird ab etwa 10 Kategorien schwer lesbar.",
      annualBalanceNeedsSigns:
        "Das +/- Template ist aussagekraeftiger, wenn es sowohl positive als auch negative Werte enthaelt.",
      tooManySeries: "Zu viele Serien koennen die Lesbarkeit beeintraechtigen.",
      noErrors: "Keine Blocker.",
      noWarnings: "Keine Warnungen.",
      qualityBlocked: "Blockiert",
      qualityWarning: "Bereit mit Vorbehalten",
      qualityReady: "Bereit fuer Pruefung",
      emptyStateFixBlocks: "Behebe die Blocker, um die Grafik anzuzeigen.",
      templateKicker: "Vorlage",
      seriesBalanceHelp:
        "Dieses Template faerbt positive Werte automatisch blau und negative rot.",
      remove: "Entfernen",
      seriesKicker: "Serien",
      seriesTitle: "Legende und Farben",
      colorLabel: "Farbe",
      seriesDescriptionMulti:
        "Lege die Serien fest, aus denen die gestapelten Saeulen bestehen.",
      seriesDescriptionSingle:
        "Einzelserien-Template. Der Name dient dem Payload und dem Lesen der Daten.",
      seriesName: ({ index }) => `Serie ${index}`,
      tableLabelHeader: "Beschriftung",
      tableLabelPlaceholder: "Beschriftung",
      removeRowAria: ({ index }) => `Zeile ${index} loeschen`,
      previewRowsWord: "Zeilen",
      previewViewportMobile: "Mobil",
      previewViewportDesktop: "Desktop",
      previewViewportWide: "Grosser Bildschirm",
      animationPreviewFailed: "Die Animation konnte nicht abgespielt werden.",
      videoExportFailed: "Das Video konnte im Moment nicht exportiert werden.",
      videoExportUnsupported: "Der Videoexport ist in diesem Browser nicht verfuegbar.",
      videoFallbackWebm: "MP4 wird in diesem Browser nicht unterstuetzt. Der Export erfolgt als WebM.",
      animationRunning: "Animation laeuft...",
      videoExportRunning: "Video wird exportiert...",
      sourceLabel: "Quelle",
      sourceUpper: "QUELLE",
      exportUnavailable: "Export nicht moeglich: Es ist kein SVG verfuegbar.",
      projectPrefix: "Projekt",
      newProjectFallback: "Neues Projekt",
      copyWordPattern: /\bkopie\b/i,
      copySuffix: "Kopie",
    };
  }

  return {
    jsonCopied: "JSON copié",
    clipboardDenied: "Le navigateur a refusé l'accès au presse-papiers.",
    pngExportFailed: "Impossible d'exporter le PNG pour le moment.",
    noCsvData: "Aucune donnée exploitable n'a été trouvée dans le CSV.",
    importInvalidRows: ({ count }) =>
      `${count} ligne(s) n'ont pas pu être importée(s) parce qu'elles étaient incomplètes ou invalides.`,
    unsavedProject: "Projet non sauvegardé",
    noLocalVersions: "Aucune version locale pour l'instant.",
    projectDraft:
      "Brouillon local en cours. Sauver une version pour l'ajouter à l'historique.",
    projectLoaded: ({ count, date }) => `${count} version(s) locale(s). Version chargée : ${date}.`,
    historyEmpty: "Sauve une première version pour commencer une bibliothèque de projets locale.",
    historyKicker: "Historique",
    historyLast: "Dernière",
    historyProjectKicker: "Projet",
    historyVersions: "Versions",
    historyUpdatedAt: ({ date }) => `Mis à jour le ${date}`,
    historyLoadLatest: "Charger la dernière",
    deleteVersionAria: ({ date }) => `Supprimer la version du ${date}`,
    deleteVersionConfirm: ({ date }) => `Supprimer la version du ${date} ?`,
    untitledProject: "Projet sans titre",
    titleRequired: "Le titre est obligatoire.",
    sourceRequired: "La source est obligatoire.",
    minRows: "Il faut au moins deux lignes de données.",
    invalidRows: ({ count }) => `${count} ligne(s) de données contiennent une valeur invalide.`,
    minSeriesStacked: "Le template empilé exige au moins deux séries.",
    altTextEmpty: "Le texte alternatif est vide.",
    methodologyEmpty: "La note méthodologique est vide.",
    ownerMissing: "Le service responsable n'est pas renseigné.",
    duplicateLabels: "Certaines étiquettes sont dupliquées.",
    longLabels: "Certaines étiquettes sont longues et peuvent casser la mise en page.",
    columnTooManyRows:
      "En colonnes verticales, plus de 8 catégories deviennent vite difficiles à lire.",
    annualStackedTooManyRows:
      "Le template annuel empilé devient plus difficile à lire au-delà d'environ 10 catégories.",
    annualBalanceNeedsSigns:
      "Le template +/- est plus parlant quand il contient à la fois des valeurs positives et négatives.",
    tooManySeries: "Trop de séries risquent de nuire à la lisibilité du graphique.",
    noErrors: "Aucun blocage.",
    noWarnings: "Aucun avertissement.",
    qualityBlocked: "Bloqué",
    qualityWarning: "Prêt avec réserves",
    qualityReady: "Prêt pour revue",
    emptyStateFixBlocks: "Corrige les blocages pour afficher le graphique.",
    templateKicker: "Template",
    seriesBalanceHelp:
      "Le template colore automatiquement les valeurs positives en bleu et les négatives en rouge.",
    remove: "Supprimer",
    seriesKicker: "Séries",
    seriesTitle: "Légende et couleurs",
    colorLabel: "Couleur",
    seriesDescriptionMulti:
      "Configure les séries qui composeront les colonnes empilées.",
    seriesDescriptionSingle:
      "Template mono-série. Le nom sert au payload et à la lecture des données.",
    seriesName: ({ index }) => `Série ${index}`,
    tableLabelHeader: "Libellé",
    tableLabelPlaceholder: "Libellé",
    removeRowAria: ({ index }) => `Supprimer la ligne ${index}`,
    previewRowsWord: "lignes",
    previewViewportMobile: "Mobile",
    previewViewportDesktop: "Desktop",
    previewViewportWide: "Écran large",
    animationPreviewFailed: "Impossible de lire l'animation pour le moment.",
    videoExportFailed: "Impossible d'exporter la vidéo pour le moment.",
    videoExportUnsupported: "L'export vidéo n'est pas disponible dans ce navigateur.",
    videoFallbackWebm: "Le MP4 n'est pas pris en charge par ce navigateur. L'export se fera en WebM.",
    animationRunning: "Animation en cours...",
    videoExportRunning: "Export vidéo en cours...",
    sourceLabel: "Source",
    sourceUpper: "SOURCE",
    exportUnavailable: "Impossible d'exporter : aucun SVG n'est disponible.",
    projectPrefix: "Projet",
    newProjectFallback: "Nouveau projet",
    copyWordPattern: /\bcopie\b/i,
    copySuffix: "copie",
  };
}

function buildChartConfigs(language) {
  if (language === "de") {
    return {
      "annual-stacked": {
        label: "Gestapelte Saeulen",
        previewLabel: "gestapelte saeulen",
        seriesMode: "multi",
        minSeries: 2,
        maxSeries: 4,
        allowSeriesEditing: true,
        editableColors: true,
        templateNote:
          "Template nahe am Jahresbericht: hellgrauer Hintergrund, gestapelte Saeulen, Totale oben und Legende unter dem Diagramm.",
        defaultSeries: [
          {
            id: "confederation_staff",
            label: "Mitarbeitende der Bundesverwaltung",
            color: REPORT_COLORS.grey,
          },
          {
            id: "external_staff",
            label: "Externe Personen der Bundesverwaltung",
            color: REPORT_COLORS.blue,
          },
          {
            id: "covid_alerts",
            label: "Meldungen mit Bezug zu COVID-19",
            color: REPORT_COLORS.red,
          },
        ],
      },
      "annual-balance": {
        label: "Saeulen +/-",
        previewLabel: "positive / negative saeulen",
        seriesMode: "single",
        minSeries: 1,
        maxSeries: 1,
        allowSeriesEditing: false,
        editableColors: false,
        templateNote:
          "Template fuer Ergebnisrechnungen: eine Serie, blau ueber null, rot darunter, mit Jahresraster und klarer Nulllinie.",
        defaultSeries: [
          {
            id: "value",
            label: "Wert",
            color: REPORT_COLORS.blue,
          },
        ],
      },
      bar: {
        label: "Horizontale Balken",
        previewLabel: "horizontale balken",
        seriesMode: "single",
        minSeries: 1,
        maxSeries: 1,
        allowSeriesEditing: false,
        editableColors: true,
        templateNote:
          "Einfaches Einzelserien-Template. Praktisch fuer einen schnellen Kategorienvergleich.",
        defaultSeries: [
          {
            id: "value",
            label: "Wert",
            color: REPORT_COLORS.blue,
          },
        ],
      },
      column: {
        label: "Vertikale Saeulen",
        previewLabel: "vertikale saeulen",
        seriesMode: "single",
        minSeries: 1,
        maxSeries: 1,
        allowSeriesEditing: false,
        editableColors: true,
        templateNote:
          "Einfaches Einzelserien-Template. Geeignet fuer kurze Jahres- oder Zeitvergleiche.",
        defaultSeries: [
          {
            id: "value",
            label: "Wert",
            color: REPORT_COLORS.blue,
          },
        ],
      },
      line: {
        label: "Linie",
        previewLabel: "linie",
        seriesMode: "single",
        minSeries: 1,
        maxSeries: 1,
        allowSeriesEditing: false,
        editableColors: true,
        templateNote:
          "Einfaches Einzelserien-Template. Ideal, um eine Entwicklung ueber die Zeit zu zeigen.",
        defaultSeries: [
          {
            id: "value",
            label: "Wert",
            color: REPORT_COLORS.blue,
          },
        ],
      },
    };
  }

  return {
    "annual-stacked": {
      label: "Colonnes empilées",
      previewLabel: "colonnes empilées",
      seriesMode: "multi",
      minSeries: 2,
      maxSeries: 4,
      allowSeriesEditing: true,
      editableColors: true,
      templateNote:
        "Template proche du rapport annuel : fond gris clair, colonnes empilées, total affiché au sommet et légende en pied de graphique.",
      defaultSeries: [
        {
          id: "confederation_staff",
          label: "Employés et employées de la Confédération",
          color: REPORT_COLORS.grey,
        },
        {
          id: "external_staff",
          label: "Personnes externes à l'administration fédérale",
          color: REPORT_COLORS.blue,
        },
        {
          id: "covid_alerts",
          label: "Annonces liées au COVID-19",
          color: REPORT_COLORS.red,
        },
      ],
    },
    "annual-balance": {
      label: "Colonnes +/-",
      previewLabel: "colonnes positives / negatives",
      seriesMode: "single",
      minSeries: 1,
      maxSeries: 1,
      allowSeriesEditing: false,
      editableColors: false,
      templateNote:
        "Template type compte de résultats : une seule série, bleu au-dessus de zéro, rouge en dessous, grille annuelle et ligne de base explicite.",
      defaultSeries: [
        {
          id: "value",
          label: "Valeur",
          color: REPORT_COLORS.blue,
        },
      ],
    },
    bar: {
      label: "Barres horizontales",
      previewLabel: "barres horizontales",
      seriesMode: "single",
      minSeries: 1,
      maxSeries: 1,
      allowSeriesEditing: false,
      editableColors: true,
      templateNote:
        "Template simple à une seule série. Pratique pour une comparaison de catégories rapide.",
      defaultSeries: [
        {
          id: "value",
          label: "Valeur",
          color: REPORT_COLORS.blue,
        },
      ],
    },
    column: {
      label: "Colonnes verticales",
      previewLabel: "colonnes verticales",
      seriesMode: "single",
      minSeries: 1,
      maxSeries: 1,
      allowSeriesEditing: false,
      editableColors: true,
      templateNote:
        "Template simple à une seule série. Convient bien aux comparaisons annuelles ou temporelles courtes.",
      defaultSeries: [
        {
          id: "value",
          label: "Valeur",
          color: REPORT_COLORS.blue,
        },
      ],
    },
    line: {
      label: "Courbe",
      previewLabel: "courbe",
      seriesMode: "single",
      minSeries: 1,
      maxSeries: 1,
      allowSeriesEditing: false,
      editableColors: true,
      templateNote:
        "Template simple à une seule série. Idéal pour montrer une évolution dans le temps.",
      defaultSeries: [
        {
          id: "value",
          label: "Valeur",
          color: REPORT_COLORS.blue,
        },
      ],
    },
  };
}

function buildSampleStates(language, configs) {
  if (language === "de") {
    return {
      "annual-stacked": {
        title: "Anzahl bearbeiteter Faelle bei Whistleblower-Meldungen 2015-2024",
        subtitle: "",
        chartType: "annual-stacked",
        locale: "de",
        source: "EFK",
        owner: "Jahresbericht",
        methodology:
          "Beispielstruktur nach dem Vorbild des Jahresberichts, um ein gestapeltes Mehrserien-Diagramm zu testen.",
        altText:
          "Die bearbeiteten Faelle nehmen ab 2020 stark zu, mit einem grossen Anteil von Mitarbeitenden, Externen und COVID-Bezuegen.",
        series: cloneData(configs["annual-stacked"].defaultSeries),
        rows: [
          { label: "2015", confederation_staff: "", external_staff: "42", covid_alerts: "19" },
          { label: "2016", confederation_staff: "", external_staff: "50", covid_alerts: "25" },
          { label: "2017", confederation_staff: "", external_staff: "70", covid_alerts: "52" },
          { label: "2018", confederation_staff: "", external_staff: "90", covid_alerts: "54" },
          { label: "2019", confederation_staff: "", external_staff: "108", covid_alerts: "79" },
          { label: "2020", confederation_staff: "311", external_staff: "96", covid_alerts: "77" },
          { label: "2021", confederation_staff: "230", external_staff: "95", covid_alerts: "77" },
          { label: "2022", confederation_staff: "47", external_staff: "133", covid_alerts: "99" },
          { label: "2023", confederation_staff: "22", external_staff: "223", covid_alerts: "127" },
          { label: "2024", confederation_staff: "10", external_staff: "252", covid_alerts: "113" },
        ],
      },
      "annual-balance": {
        title: "Saldo der Erfolgsrechnung des Bundes",
        subtitle: "IN MILLIONEN FRANKEN, 2008-2023",
        chartType: "annual-balance",
        locale: "de",
        source: "EFV. STAATSRECHNUNG, BAND 1, S. 19",
        owner: "Jahresbericht",
        methodology:
          "Beispielstruktur nach dem Vorbild des Jahresberichts, um ein Diagramm mit positiven und negativen Saeulen zu testen.",
        altText:
          "Der Saldo bleibt bis 2019 positiv, kippt ab 2020 ins Negative und wird 2023 wieder leicht positiv.",
        series: cloneData(configs["annual-balance"].defaultSeries),
        rows: [
          { label: "2008", value: "6273" },
          { label: "2009", value: "7291" },
          { label: "2010", value: "4139" },
          { label: "2011", value: "2094" },
          { label: "2012", value: "2443" },
          { label: "2013", value: "1108" },
          { label: "2014", value: "1193" },
          { label: "2015", value: "2025" },
          { label: "2016", value: "-66" },
          { label: "2017", value: "4403" },
          { label: "2018", value: "5701" },
          { label: "2019", value: "5953" },
          { label: "2020", value: "-16858" },
          { label: "2021", value: "-9716" },
          { label: "2022", value: "-2396" },
          { label: "2023", value: "877" },
        ],
      },
      bar: {
        title: "Beispiel fuer Kategorien",
        subtitle: "",
        chartType: "bar",
        locale: "de",
        source: "Prototyp",
        owner: "Graphics Lab",
        methodology: "Einfacher Datensatz zum Testen horizontaler Balken.",
        altText: "Das Diagramm vergleicht vier Beispielkategorien.",
        series: cloneData(configs.bar.defaultSeries),
        rows: [
          { label: "Digitale Pruefung", value: "18" },
          { label: "Subventionen", value: "11" },
          { label: "Oeffentliche Beschaffung", value: "9" },
          { label: "Governance", value: "14" },
        ],
      },
      column: {
        title: "Einfaches Jahresbeispiel",
        subtitle: "",
        chartType: "column",
        locale: "de",
        source: "Prototyp",
        owner: "Graphics Lab",
        methodology: "Einfacher Datensatz zum Testen vertikaler Saeulen.",
        altText: "Das Diagramm zeigt vier vertikale Beispielsaeulen.",
        series: cloneData(configs.column.defaultSeries),
        rows: [
          { label: "2021", value: "14" },
          { label: "2022", value: "18" },
          { label: "2023", value: "12" },
          { label: "2024", value: "22" },
        ],
      },
      line: {
        title: "Entwicklung ueber vier Jahre",
        subtitle: "",
        chartType: "line",
        locale: "de",
        source: "Prototyp",
        owner: "Graphics Lab",
        methodology: "Einfacher Datensatz zum Testen der Linie.",
        altText: "Das Diagramm zeigt eine Entwicklung mit kleinem Rueckgang und anschliessendem Anstieg.",
        series: cloneData(configs.line.defaultSeries),
        rows: [
          { label: "2021", value: "14" },
          { label: "2022", value: "18" },
          { label: "2023", value: "12" },
          { label: "2024", value: "22" },
        ],
      },
    };
  }

  return {
    "annual-stacked": {
      title: "Nombre de cas traités de lanceurs d'alerte 2015-2024",
      subtitle: "",
      chartType: "annual-stacked",
      locale: "fr",
      source: "CDF",
      owner: "Rapport annuel",
      methodology:
        "Exemple de structure inspirée du rapport annuel pour tester un graphique empilé multi-séries.",
      altText:
        "Les cas traités augmentent fortement à partir de 2020, avec un poids important des catégories employées, externes et COVID.",
      series: cloneData(configs["annual-stacked"].defaultSeries),
      rows: [
        { label: "2015", confederation_staff: "", external_staff: "42", covid_alerts: "19" },
        { label: "2016", confederation_staff: "", external_staff: "50", covid_alerts: "25" },
        { label: "2017", confederation_staff: "", external_staff: "70", covid_alerts: "52" },
        { label: "2018", confederation_staff: "", external_staff: "90", covid_alerts: "54" },
        { label: "2019", confederation_staff: "", external_staff: "108", covid_alerts: "79" },
        { label: "2020", confederation_staff: "311", external_staff: "96", covid_alerts: "77" },
        { label: "2021", confederation_staff: "230", external_staff: "95", covid_alerts: "77" },
        { label: "2022", confederation_staff: "47", external_staff: "133", covid_alerts: "99" },
        { label: "2023", confederation_staff: "22", external_staff: "223", covid_alerts: "127" },
        { label: "2024", confederation_staff: "10", external_staff: "252", covid_alerts: "113" },
      ],
    },
    "annual-balance": {
      title: "Solde du compte de résultats de la Confédération",
      subtitle: "EN MILLIONS DE FRANCS, 2008-2023",
      chartType: "annual-balance",
      locale: "fr",
      source: "AFF. COMPTE D'ÉTAT, TOME 1, p. 19",
      owner: "Rapport annuel",
      methodology:
        "Exemple de structure inspirée du rapport annuel pour tester un graphique à colonnes positives et négatives.",
      altText:
        "Le solde reste positif jusqu'en 2019, bascule en négatif dès 2020 puis revient légèrement en positif en 2023.",
      series: cloneData(configs["annual-balance"].defaultSeries),
      rows: [
        { label: "2008", value: "6273" },
        { label: "2009", value: "7291" },
        { label: "2010", value: "4139" },
        { label: "2011", value: "2094" },
        { label: "2012", value: "2443" },
        { label: "2013", value: "1108" },
        { label: "2014", value: "1193" },
        { label: "2015", value: "2025" },
        { label: "2016", value: "-66" },
        { label: "2017", value: "4403" },
        { label: "2018", value: "5701" },
        { label: "2019", value: "5953" },
        { label: "2020", value: "-16858" },
        { label: "2021", value: "-9716" },
        { label: "2022", value: "-2396" },
        { label: "2023", value: "877" },
      ],
    },
    bar: {
      title: "Exemple de catégories",
      subtitle: "",
      chartType: "bar",
      locale: "fr",
      source: "Prototype",
      owner: "Graphics Lab",
      methodology: "Jeu de données simple pour tester les barres horizontales.",
      altText: "Le graphique compare quatre catégories de démonstration.",
      series: cloneData(configs.bar.defaultSeries),
      rows: [
        { label: "Audit numérique", value: "18" },
        { label: "Subventions", value: "11" },
        { label: "Marchés publics", value: "9" },
        { label: "Gouvernance", value: "14" },
      ],
    },
    column: {
      title: "Exemple annuel simple",
      subtitle: "",
      chartType: "column",
      locale: "fr",
      source: "Prototype",
      owner: "Graphics Lab",
      methodology: "Jeu de données simple pour tester les colonnes verticales.",
      altText: "Le graphique montre quatre colonnes verticales de démonstration.",
      series: cloneData(configs.column.defaultSeries),
      rows: [
        { label: "2021", value: "14" },
        { label: "2022", value: "18" },
        { label: "2023", value: "12" },
        { label: "2024", value: "22" },
      ],
    },
    line: {
      title: "Évolution sur quatre ans",
      subtitle: "",
      chartType: "line",
      locale: "fr",
      source: "Prototype",
      owner: "Graphics Lab",
      methodology: "Jeu de données simple pour tester la courbe.",
      altText: "Le graphique montre une progression avec une légère baisse puis une hausse.",
      series: cloneData(configs.line.defaultSeries),
      rows: [
        { label: "2021", value: "14" },
        { label: "2022", value: "18" },
        { label: "2023", value: "12" },
        { label: "2024", value: "22" },
      ],
    },
  };
}

function getChartConfig(chartType) {
  return CHART_CONFIGS[chartType] || CHART_CONFIGS[DEFAULT_CHART_TYPE];
}

function getSelectedChartType() {
  const nextType = fields.chartType.value;
  return CHART_CONFIGS[nextType] ? nextType : currentChartType;
}

function normalizePreviewViewport(viewport) {
  return PREVIEW_VIEWPORTS[viewport] ? viewport : DEFAULT_PREVIEW_VIEWPORT;
}

function getPreviewViewportLabel() {
  if (currentPreviewViewport === "mobile") {
    return UI_TEXT.previewViewportMobile;
  }

  if (currentPreviewViewport === "wide") {
    return UI_TEXT.previewViewportWide;
  }

  return UI_TEXT.previewViewportDesktop;
}

document.querySelector("#load-sample").addEventListener("click", () => {
  const sampleType = getSelectedChartType();
  applySession({
    projectId: null,
    projectName: "",
    currentVersionId: null,
    previewViewport: currentPreviewViewport,
    state: getSampleState(sampleType),
  });
  render({ syncAll: true });
});

document.querySelector("#new-project").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  const blankType = getSelectedChartType();
  applySession({
    projectId: null,
    projectName: "",
    currentVersionId: null,
    previewViewport: currentPreviewViewport,
    state: createBlankState(blankType),
  });
  render({ syncAll: true });
});

document.querySelector("#fork-project").addEventListener("click", () => {
  createNewProjectFromCurrentState();
  render({ syncAll: true });
});

document.querySelector("#reset-form").addEventListener("click", () => {
  const blankType = getSelectedChartType();
  applySession({
    projectId: null,
    projectName: "",
    currentVersionId: null,
    previewViewport: currentPreviewViewport,
    state: createBlankState(blankType),
  });
  render({ syncAll: true });
});

document.querySelector("#save-project").addEventListener("click", () => {
  saveProjectVersion();
  render();
});

document.querySelector("#copy-config").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
    qualityChip.textContent = UI_TEXT.jsonCopied;
    setTimeout(() => render(), 500);
  } catch (error) {
    window.alert(UI_TEXT.clipboardDenied);
  }
});

document.querySelector("#export-svg").addEventListener("click", () => {
  exportCurrentChartAsSvg();
});

document.querySelector("#export-png").addEventListener("click", async () => {
  try {
    await exportCurrentChartAsPng();
  } catch (error) {
    console.error(error);
    window.alert(UI_TEXT.pngExportFailed);
  }
});

if (playAnimationButton) {
  playAnimationButton.addEventListener("click", async () => {
    try {
      await playCurrentChartAnimation();
    } catch (error) {
      console.error(error);
      window.alert(UI_TEXT.animationPreviewFailed);
    }
  });
}

if (exportVideoButton) {
  exportVideoButton.addEventListener("click", async () => {
    try {
      await exportCurrentChartAsVideo();
    } catch (error) {
      console.error(error);
      window.alert(UI_TEXT.videoExportFailed);
    }
  });
}

previewViewportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextViewport = normalizePreviewViewport(button.dataset.previewViewport);

    if (nextViewport === currentPreviewViewport) {
      return;
    }

    currentPreviewViewport = nextViewport;
    render();
  });
});

projectHistory.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-load-project]");
  const versionButton = event.target.closest("[data-load-version]");
  const deleteVersionButton = event.target.closest("[data-delete-version]");

  if (projectButton) {
    loadProject(projectButton.dataset.loadProject);
    return;
  }

  if (versionButton) {
    const [projectId, versionId] = (versionButton.dataset.loadVersion || "").split(":");
    if (projectId && versionId) {
      loadProjectVersion(projectId, versionId);
    }
    return;
  }

  if (deleteVersionButton) {
    const [projectId, versionId] = (deleteVersionButton.dataset.deleteVersion || "").split(":");
    if (projectId && versionId) {
      deleteProjectVersion(projectId, versionId);
    }
  }
});

fields.chartType.addEventListener("change", () => {
  handleChartTypeChange(fields.chartType.value);
});

fields.projectName.addEventListener("input", () => {
  render();
});

addSeriesButton.addEventListener("click", () => {
  const config = getChartConfig(currentChartType);

  if (!config.allowSeriesEditing || seriesConfig.length >= config.maxSeries) {
    return;
  }

  seriesConfig.push({
    id: buildSeriesId(`serie-${seriesConfig.length + 1}`, seriesConfig.length),
    label: UI_TEXT.seriesName({ index: seriesConfig.length + 1 }),
    color: pickSeriesColor(seriesConfig.length),
  });
  dataRows = dataRows.map((row) => ({
    ...row,
    [seriesConfig[seriesConfig.length - 1].id]: "",
  }));
  ensureMinimumRows();
  render({ syncAll: true });
});

document.querySelector("#add-row").addEventListener("click", () => {
  dataRows.push(createEmptyRow(seriesConfig));
  render({ syncTable: true, syncColumns: true });
});

document.querySelector("#clear-rows").addEventListener("click", () => {
  dataRows = Array.from({ length: MIN_ROWS }, () => createEmptyRow(seriesConfig));
  render({ syncTable: true, syncColumns: true });
});

document.querySelector("#import-csv").addEventListener("click", () => {
  const imported = parseCsv(fields.csvImport.value, currentChartType, seriesConfig);

  if (imported.rows.length === 0 && imported.invalidRows === 0) {
    window.alert(UI_TEXT.noCsvData);
    return;
  }

  seriesConfig = imported.series;
  dataRows = padRows(imported.rows, seriesConfig);
  render({ syncAll: true });

  if (imported.invalidRows > 0) {
    window.alert(UI_TEXT.importInvalidRows({ count: imported.invalidRows }));
  }
});

dataRowsBody.addEventListener("input", (event) => {
  const target = event.target;
  const index = Number.parseInt(target.dataset.index ?? "-1", 10);
  const field = target.dataset.field;

  if (!Number.isInteger(index) || !field || !dataRows[index]) {
    return;
  }

  dataRows[index][field] = target.value;
  render();
});

dataRowsBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-row]");

  if (!button) {
    return;
  }

  const index = Number.parseInt(button.dataset.removeRow ?? "-1", 10);

  if (!Number.isInteger(index) || !dataRows[index]) {
    return;
  }

  dataRows.splice(index, 1);
  ensureMinimumRows();
  render({ syncTable: true, syncColumns: true });
});

seriesEditor.addEventListener("input", (event) => {
  const target = event.target;
  const index = Number.parseInt(target.dataset.seriesIndex ?? "-1", 10);
  const field = target.dataset.seriesField;

  if (!Number.isInteger(index) || !field || !seriesConfig[index]) {
    return;
  }

  seriesConfig[index][field] = target.value;
  render({ syncColumns: field === "label" });
});

seriesEditor.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-series]");

  if (!button) {
    return;
  }

  const config = getChartConfig(currentChartType);
  const index = Number.parseInt(button.dataset.removeSeries ?? "-1", 10);

  if (
    !config.allowSeriesEditing ||
    !Number.isInteger(index) ||
    !seriesConfig[index] ||
    seriesConfig.length <= config.minSeries
  ) {
    return;
  }

  const removed = seriesConfig[index];
  seriesConfig.splice(index, 1);
  dataRows = dataRows.map((row) => {
    const nextRow = { ...row };
    delete nextRow[removed.id];
    return nextRow;
  });
  ensureMinimumRows();
  render({ syncAll: true });
});

form.addEventListener("input", (event) => {
  if (
    event.target === fields.csvImport ||
    event.target === fields.chartType ||
    event.target.closest("#data-rows") ||
    event.target.closest("#series-editor")
  ) {
    return;
  }

  render();
});

form.addEventListener("change", (event) => {
  if (
    event.target === fields.csvImport ||
    event.target === fields.chartType ||
    event.target.closest("#data-rows") ||
    event.target.closest("#series-editor")
  ) {
    return;
  }

  render();
});

boot();

function boot() {
  const savedSession = loadSavedSession();
  applySession(
    savedSession || {
      projectId: null,
      projectName: "",
      currentVersionId: null,
      state: getSampleState(DEFAULT_CHART_TYPE),
    },
  );
  render({ syncAll: true });
}

function loadSavedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (parsed && parsed.state) {
      return {
        projectId: parsed.projectId ?? null,
        projectName: parsed.projectName ?? "",
        currentVersionId: parsed.currentVersionId ?? null,
        previewViewport: parsed.previewViewport ?? DEFAULT_PREVIEW_VIEWPORT,
        state: parsed.state,
      };
    }

    return {
      projectId: null,
      projectName: "",
      currentVersionId: null,
      previewViewport: DEFAULT_PREVIEW_VIEWPORT,
      state: parsed,
    };
  } catch (error) {
    return null;
  }
}

function getSampleState(chartType) {
  return cloneData(SAMPLE_STATES[chartType] || SAMPLE_STATES[DEFAULT_CHART_TYPE]);
}

function createBlankState(chartType) {
  const config = getChartConfig(chartType);
  const series = cloneData(config.defaultSeries);

  return {
    title: "",
    subtitle: "",
    chartType,
    locale: "fr",
    source: "",
    owner: "",
    methodology: "",
    altText: "",
    csvImport: buildCsvPlaceholder(chartType),
    series,
    rows: Array.from({ length: MIN_ROWS }, () => createEmptyRow(series)),
  };
}

function applySession(session) {
  const normalized = normalizeState(session.state);

  currentChartType = normalized.chartType;
  seriesConfig = normalized.series;
  dataRows = normalized.rows;
  currentProjectId = session.projectId ?? null;
  currentVersionId = session.currentVersionId ?? null;
  currentPreviewViewport = normalizePreviewViewport(session.previewViewport);

  fields.projectName.value = session.projectName ?? "";
  fields.title.value = normalized.title;
  fields.subtitle.value = normalized.subtitle;
  fields.chartType.value = normalized.chartType;
  fields.locale.value = normalized.locale;
  fields.source.value = normalized.source;
  fields.owner.value = normalized.owner;
  fields.methodology.value = normalized.methodology;
  fields.altText.value = normalized.altText;
  fields.csvImport.value = normalized.csvImport;
}

function normalizeState(state) {
  const chartType = state.chartType && CHART_CONFIGS[state.chartType] ? state.chartType : DEFAULT_CHART_TYPE;
  const series = normalizeSeries(chartType, state.series);
  const rows = normalizeRows(state.rows, series);

  return {
    title: state.title ?? "",
    subtitle: state.subtitle ?? "",
    chartType,
    locale: state.locale ?? "fr",
    source: state.source ?? "",
    owner: state.owner ?? "",
    methodology: state.methodology ?? "",
    altText: state.altText ?? "",
    csvImport: state.csvImport ?? serializeRowsToCsv(rows, series),
    series,
    rows,
  };
}

function normalizeSeries(chartType, rawSeries) {
  const config = getChartConfig(chartType);
  const defaults = cloneData(config.defaultSeries);

  if (!Array.isArray(rawSeries) || rawSeries.length === 0) {
    return defaults;
  }

  if (config.seriesMode === "single") {
    const source = rawSeries[0] || defaults[0];
    return [
      {
        id: defaults[0].id,
        label: String(source.label ?? defaults[0].label),
        color: source.color || defaults[0].color,
      },
    ];
  }

  return rawSeries.slice(0, config.maxSeries).map((series, index) => ({
    id: series.id || defaults[index]?.id || buildSeriesId(series.label, index),
    label: String(series.label ?? defaults[index]?.label ?? UI_TEXT.seriesName({ index: index + 1 })),
    color: series.color || defaults[index]?.color || pickSeriesColor(index),
  }));
}

function normalizeRows(rawRows, series) {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return Array.from({ length: MIN_ROWS }, () => createEmptyRow(series));
  }

  return padRows(
    rawRows.map((row) => {
      const nextRow = { label: String(row.label ?? "") };

      series.forEach((seriesItem, index) => {
        const fallbackValue = index === 0 ? row.value : "";
        const value =
          row[seriesItem.id] ??
          row.values?.[seriesItem.id] ??
          fallbackValue ??
          "";
        nextRow[seriesItem.id] = String(value);
      });

      return nextRow;
    }),
    series,
  );
}

function getState() {
  return {
    title: fields.title.value.trim(),
    subtitle: fields.subtitle.value.trim(),
    chartType: currentChartType,
    locale: fields.locale.value,
    source: fields.source.value.trim(),
    owner: fields.owner.value.trim(),
    methodology: fields.methodology.value.trim(),
    altText: fields.altText.value.trim(),
    csvImport: fields.csvImport.value,
    series: cloneData(seriesConfig),
    rows: cloneData(dataRows),
  };
}

function getSessionSnapshot() {
  return {
    projectId: currentProjectId,
    projectName: fields.projectName.value.trim(),
    currentVersionId,
    previewViewport: currentPreviewViewport,
    state: getState(),
  };
}

function persistSession() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getSessionSnapshot()));
}

function handleChartTypeChange(nextType) {
  if (!CHART_CONFIGS[nextType] || nextType === currentChartType) {
    return;
  }

  const nextSeries = normalizeSeries(nextType, migrateSeries(nextType, seriesConfig));
  dataRows = migrateRows(nextType, dataRows, seriesConfig, nextSeries);
  seriesConfig = nextSeries;
  currentChartType = nextType;
  fields.csvImport.value = buildCsvPlaceholder(nextType);
  render({ syncAll: true });
}

function migrateSeries(nextType, currentSeries) {
  const nextConfig = getChartConfig(nextType);

  if (nextConfig.seriesMode === "single") {
    return cloneData(nextConfig.defaultSeries);
  }

  if (currentSeries.length > 1) {
    return currentSeries.slice(0, nextConfig.maxSeries).map((series, index) => ({
      id: buildSeriesId(series.id || series.label, index),
      label: series.label || UI_TEXT.seriesName({ index: index + 1 }),
      color: series.color || pickSeriesColor(index),
    }));
  }

  const defaults = cloneData(nextConfig.defaultSeries);

  return defaults.map((series, index) => ({
    ...series,
    label: index === 0 && currentSeries[0]?.label ? currentSeries[0].label : series.label,
  }));
}

function migrateRows(nextType, rows, previousSeries, nextSeries) {
  const nextConfig = getChartConfig(nextType);

  return padRows(
    rows.map((row) => {
      const nextRow = createEmptyRow(nextSeries);
      nextRow.label = String(row.label ?? "");

      const values = previousSeries.map((series) => parseNumeric(row[series.id]));
      const hasContent = nextRow.label || values.some((value) => value !== null);

      if (!hasContent) {
        return nextRow;
      }

      if (nextConfig.seriesMode === "single") {
        const total = values.reduce((sum, value) => sum + (value ?? 0), 0);
        nextRow[nextSeries[0].id] = total === 0 && values.every((value) => value === null) ? "" : String(total);
        return nextRow;
      }

      nextSeries.forEach((series, index) => {
        const sourceValue =
          previousSeries[index] && row[previousSeries[index].id] !== undefined
            ? row[previousSeries[index].id]
            : index === 0 && previousSeries[0]
              ? row[previousSeries[0].id]
              : "";
        nextRow[series.id] = String(sourceValue ?? "");
      });

      return nextRow;
    }),
    nextSeries,
  );
}

function buildPayload() {
  const state = getState();
  const parsed = parseTableRows(dataRows, seriesConfig);
  const exportProfile = getWordExportProfile();

  return {
    project: {
      name: fields.projectName.value.trim(),
      projectId: currentProjectId,
      currentVersionId,
    },
    metadata: {
      title: state.title,
      subtitle: state.subtitle,
      locale: state.locale,
      source: state.source,
      owner: state.owner,
      methodology: state.methodology,
      altText: state.altText,
    },
    presentation: {
      template: state.chartType,
      label: getChartConfig(state.chartType).label,
      exportTargets: ["web", "svg", "png-word"],
      exportProfile,
      series: cloneData(seriesConfig),
    },
    data: parsed.rows,
  };
}

function getCurrentChartRenderContext() {
  const state = getState();
  const parsed = parseTableRows(dataRows, seriesConfig);
  const checks = runChecks(state, parsed);

  return {
    state,
    parsed,
    checks,
    series: cloneData(seriesConfig),
  };
}

function render(options = {}) {
  const { syncAll = false, syncTable = false, syncColumns = false } = options;
  const state = getState();
  const parsed = parseTableRows(dataRows, seriesConfig);
  const checks = runChecks(state, parsed);

  if (syncAll) {
    renderTemplateNote();
    renderSeriesEditor();
    renderDataColumns();
    renderDataTable();
  } else {
    if (syncColumns) {
      renderDataColumns();
    }

    if (syncTable) {
      renderDataTable();
    }
  }

  syncAuxiliaryUi();
  renderProjectStatus();
  renderProjectLibrary();
  renderStats(parsed.rows);
  renderLists(checks);
  renderQuality(checks);
  renderPreviewMeta(parsed.rows.length, state.locale, state.chartType);
  renderPreviewViewport();
  persistSession();

  if (checks.errors.length > 0) {
    preview.innerHTML = `
      <div class="empty-state">
        <p>${escapeHtml(UI_TEXT.emptyStateFixBlocks)}</p>
      </div>
    `;
    return;
  }

  preview.innerHTML = renderSvgChart({
    title: state.title,
    subtitle: state.subtitle,
    source: state.source,
    chartType: state.chartType,
    rows: parsed.rows,
    series: seriesConfig,
  });
}

function renderTemplateNote() {
  const config = getChartConfig(currentChartType);
  templateNote.innerHTML = `
    <p class="section-kicker">${escapeHtml(UI_TEXT.templateKicker)}</p>
    <h3>${escapeHtml(config.label)}</h3>
    <p class="data-note">${escapeHtml(config.templateNote)}</p>
  `;
}

function renderSeriesEditor() {
  const config = getChartConfig(currentChartType);
  const cards = seriesConfig
    .map((series, index) => {
      const canRemove = config.allowSeriesEditing && seriesConfig.length > config.minSeries;
      const colorHelp =
        currentChartType === "annual-balance"
          ? `<p class="series-help">${escapeHtml(UI_TEXT.seriesBalanceHelp)}</p>`
          : "";

      return `
        <article class="series-card">
          <div class="series-card-head">
            <strong>${escapeHtml(UI_TEXT.seriesName({ index: index + 1 }))}</strong>
            ${
              canRemove
                ? `<button type="button" class="ghost compact" data-remove-series="${index}">${escapeHtml(UI_TEXT.remove)}</button>`
                : ""
            }
          </div>
          <label>
            ${escapeHtml(UI_TEXT.tableLabelHeader)}
            <input
              type="text"
              value="${escapeAttribute(series.label)}"
              data-series-index="${index}"
              data-series-field="label"
            />
          </label>
          <label>
            ${escapeHtml(UI_TEXT.colorLabel)}
            <input
              type="color"
              value="${escapeAttribute(series.color)}"
              data-series-index="${index}"
              data-series-field="color"
              ${config.editableColors ? "" : "disabled"}
            />
          </label>
          ${colorHelp}
        </article>
      `;
    })
    .join("");

  seriesEditor.innerHTML = `
    <div class="series-head">
      <div>
        <p class="section-kicker">${escapeHtml(UI_TEXT.seriesKicker)}</p>
        <h4>${escapeHtml(UI_TEXT.seriesTitle)}</h4>
        <p class="data-note">
          ${escapeHtml(
            config.seriesMode === "multi"
              ? UI_TEXT.seriesDescriptionMulti
              : UI_TEXT.seriesDescriptionSingle,
          )}
        </p>
      </div>
    </div>
    <div class="series-list">${cards}</div>
  `;
}

function renderDataColumns() {
  const headers = seriesConfig
    .map((series) => `<th>${escapeHtml(series.label)}</th>`)
    .join("");

  dataColumnsHead.innerHTML = `
    <tr>
      <th>${escapeHtml(UI_TEXT.tableLabelHeader)}</th>
      ${headers}
      <th></th>
    </tr>
  `;
}

function renderDataTable() {
  const valueCells = (row, index) =>
    seriesConfig
      .map(
        (series) => `
          <td class="value-cell">
            <input
              type="text"
              value="${escapeAttribute(row[series.id] ?? "")}"
              data-index="${index}"
              data-field="${series.id}"
              inputmode="decimal"
              placeholder="0"
            />
          </td>
        `,
      )
      .join("");

  dataRowsBody.innerHTML = dataRows
    .map(
      (row, index) => `
        <tr>
          <td>
            <input
              type="text"
              value="${escapeAttribute(row.label)}"
              data-index="${index}"
              data-field="label"
              placeholder="${escapeAttribute(UI_TEXT.tableLabelHeader)}"
            />
          </td>
          ${valueCells(row, index)}
          <td class="remove-cell">
            <button
              type="button"
              class="row-remove"
              data-remove-row="${index}"
              aria-label="${escapeAttribute(UI_TEXT.removeRowAria({ index: index + 1 }))}"
            >
              ×
            </button>
          </td>
        </tr>
      `,
    )
    .join("");
}

function syncAuxiliaryUi() {
  const config = getChartConfig(currentChartType);
  fields.csvImport.placeholder = buildCsvPlaceholder(currentChartType);
  addSeriesButton.hidden = !config.allowSeriesEditing || seriesConfig.length >= config.maxSeries;
  seriesCountValue.textContent = String(seriesConfig.length);

  if (playAnimationButton) {
    playAnimationButton.disabled = isPreviewAnimating || isVideoExporting;
  }

  if (exportVideoButton) {
    exportVideoButton.disabled = isPreviewAnimating || isVideoExporting;
  }
}

function renderStats(rows) {
  rowCountValue.textContent = String(rows.length);
  seriesCountValue.textContent = String(seriesConfig.length);
  totalValue.textContent = formatDisplayNumber(rows.reduce((sum, row) => sum + row.total, 0));
}

function renderLists(checks) {
  const errors = checks.errors.length ? checks.errors : [UI_TEXT.noErrors];
  const warnings = checks.warnings.length ? checks.warnings : [UI_TEXT.noWarnings];

  errorsList.innerHTML = errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  warningsList.innerHTML = warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderQuality(checks) {
  qualityChip.classList.remove("blocked", "warning");

  if (checks.errors.length > 0) {
    qualityChip.classList.add("blocked");
    qualityChip.textContent = UI_TEXT.qualityBlocked;
    return;
  }

  if (checks.warnings.length > 0) {
    qualityChip.classList.add("warning");
    qualityChip.textContent = UI_TEXT.qualityWarning;
    return;
  }

  qualityChip.textContent = UI_TEXT.qualityReady;
}

function renderPreviewMeta(rowCount, locale, chartType) {
  previewMeta.textContent = `${rowCount} ${UI_TEXT.previewRowsWord} • ${locale.toUpperCase()} • ${getChartConfig(chartType).previewLabel} • ${getPreviewViewportLabel()}`;
}

function renderPreviewViewport() {
  if (previewStage) {
    previewStage.dataset.previewMode = currentPreviewViewport;
    previewStage.style.setProperty(
      "--preview-max-width",
      `${PREVIEW_VIEWPORTS[currentPreviewViewport].maxWidth}px`,
    );
  }

  previewViewportButtons.forEach((button) => {
    const isCurrent = normalizePreviewViewport(button.dataset.previewViewport) === currentPreviewViewport;
    button.classList.toggle("is-current", isCurrent);
    button.setAttribute("aria-pressed", String(isCurrent));
  });
}

function renderProjectStatus() {
  const draftName = fields.projectName.value.trim();
  const project = currentProjectId ? loadProjects().find((item) => item.id === currentProjectId) : null;
  const activeVersion = project?.versions.find((version) => version.id === currentVersionId) || project?.versions[0];

  if (project && activeVersion) {
    projectStatus.textContent = project.name;
    projectVersionMeta.textContent = UI_TEXT.projectLoaded({
      count: project.versions.length,
      date: formatDateTime(activeVersion.savedAt),
    });
    return;
  }

  projectStatus.textContent = draftName || UI_TEXT.unsavedProject;
  projectVersionMeta.textContent = draftName
    ? UI_TEXT.projectDraft
    : UI_TEXT.noLocalVersions;
}

function renderProjectLibrary() {
  const projects = sortProjects(loadProjects());

  if (projects.length === 0) {
    projectHistory.innerHTML = `
      <article class="history-empty">
        <p class="section-kicker">${escapeHtml(UI_TEXT.historyKicker)}</p>
        <p class="data-note">
          ${escapeHtml(UI_TEXT.historyEmpty)}
        </p>
      </article>
    `;
    return;
  }

  projectHistory.innerHTML = projects
    .map((project) => {
      const latestVersion = project.versions[0];
      const versionsMarkup = project.versions
        .slice(0, 6)
        .map((version, index) => {
          const isCurrent = project.id === currentProjectId && version.id === currentVersionId;
          const label = index === 0 ? UI_TEXT.historyLast : formatShortDateTime(version.savedAt);

          return `
            <div class="version-item">
              <button
                type="button"
                class="version-chip ${isCurrent ? "current" : ""}"
                data-load-version="${project.id}:${version.id}"
              >
                ${escapeHtml(label)}
              </button>
              <button
                type="button"
                class="version-delete"
                aria-label="${escapeAttribute(
                  UI_TEXT.deleteVersionAria({ date: formatDateTime(version.savedAt) }),
                )}"
                data-delete-version="${project.id}:${version.id}"
              >
                ×
              </button>
            </div>
          `;
        })
        .join("");

      return `
        <article class="history-card ${project.id === currentProjectId ? "current" : ""}">
          <div class="history-card-head">
            <div>
              <p class="section-kicker">${escapeHtml(UI_TEXT.historyProjectKicker)}</p>
              <strong>${escapeHtml(project.name)}</strong>
            </div>
            <div class="history-count">${project.versions.length}</div>
          </div>
          <div class="history-meta">
            <p class="data-note">${escapeHtml(
              UI_TEXT.historyUpdatedAt({ date: formatDateTime(project.updatedAt) }),
            )}</p>
            <span>${escapeHtml(UI_TEXT.historyVersions)}</span>
          </div>
          <div class="history-actions">
            <button type="button" class="ghost compact" data-load-project="${project.id}">${escapeHtml(
              UI_TEXT.historyLoadLatest,
            )}</button>
          </div>
          <div class="version-list">${versionsMarkup}</div>
        </article>
      `;
    })
    .join("");
}

function saveProjectVersion() {
  const snapshot = getState();
  const projects = loadProjects();
  const savedAt = new Date().toISOString();
  const projectName = fields.projectName.value.trim() || snapshot.title || buildDefaultProjectName();
  let project = currentProjectId ? projects.find((item) => item.id === currentProjectId) : null;

  fields.projectName.value = projectName;

  const version = {
    id: buildEntityId("version"),
    savedAt,
    snapshot,
  };

  if (!project) {
    project = {
      id: buildEntityId("project"),
      name: projectName,
      createdAt: savedAt,
      updatedAt: savedAt,
      versions: [version],
    };
    projects.push(project);
  } else {
    project.name = projectName;
    project.updatedAt = savedAt;
    project.versions.unshift(version);
    project.versions = project.versions.slice(0, MAX_PROJECT_VERSIONS);
  }

  if (!project.createdAt) {
    project.createdAt = savedAt;
  }

  if (project.versions[0]?.id !== version.id) {
    project.versions.unshift(version);
    project.versions = project.versions.slice(0, MAX_PROJECT_VERSIONS);
  }

  currentProjectId = project.id;
  currentVersionId = version.id;
  saveProjects(projects);
  persistSession();
}

function createNewProjectFromCurrentState() {
  const baseName =
    fields.projectName.value.trim() ||
    fields.title.value.trim() ||
    buildDefaultProjectName();

  currentProjectId = null;
  currentVersionId = null;
  fields.projectName.value = buildForkProjectName(baseName);
  persistSession();
}

function loadProject(projectId) {
  const project = loadProjects().find((item) => item.id === projectId);

  if (!project || project.versions.length === 0) {
    return;
  }

  loadProjectVersion(project.id, project.versions[0].id);
}

function loadProjectVersion(projectId, versionId) {
  const project = loadProjects().find((item) => item.id === projectId);
  const version = project?.versions.find((item) => item.id === versionId);

  if (!project || !version) {
    return;
  }

  applySession({
    projectId: project.id,
    projectName: project.name,
    currentVersionId: version.id,
    state: version.snapshot,
  });
  render({ syncAll: true });
}

function deleteProjectVersion(projectId, versionId) {
  const projects = loadProjects();
  const projectIndex = projects.findIndex((item) => item.id === projectId);

  if (projectIndex < 0) {
    return;
  }

  const project = projects[projectIndex];
  const version = project.versions.find((item) => item.id === versionId);

  if (!version) {
    return;
  }

  const shouldDelete = window.confirm(
    UI_TEXT.deleteVersionConfirm({ date: formatDateTime(version.savedAt) }),
  );

  if (!shouldDelete) {
    return;
  }

  project.versions = project.versions.filter((item) => item.id !== versionId);

  if (project.versions.length === 0) {
    projects.splice(projectIndex, 1);

    if (currentProjectId === projectId) {
      applySession({
        projectId: null,
        projectName: "",
        currentVersionId: null,
        state: createBlankState(currentChartType),
      });
    }

    saveProjects(projects);
    render({ syncAll: true });
    return;
  }

  project.updatedAt = project.versions[0].savedAt;
  saveProjects(projects);

  if (currentProjectId === projectId && currentVersionId === versionId) {
    applySession({
      projectId,
      projectName: project.name,
      currentVersionId: project.versions[0].id,
      state: project.versions[0].snapshot,
    });
    render({ syncAll: true });
    return;
  }

  render();
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((project) => normalizeProject(project))
      .filter((project) => project.versions.length > 0);
  } catch (error) {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sortProjects(projects)));
}

function normalizeProject(project) {
  const name = String(project?.name ?? "").trim() || UI_TEXT.untitledProject;
  const createdAt = project?.createdAt || new Date().toISOString();
  const updatedAt = project?.updatedAt || createdAt;
  const versions = Array.isArray(project?.versions)
    ? project.versions
        .map((version) => ({
          id: version?.id || buildEntityId("version"),
          savedAt: version?.savedAt || updatedAt,
          snapshot: normalizeState(version?.snapshot || createBlankState(DEFAULT_CHART_TYPE)),
        }))
        .sort((left, right) => new Date(right.savedAt) - new Date(left.savedAt))
    : [];

  return {
    id: project?.id || buildEntityId("project"),
    name,
    createdAt,
    updatedAt,
    versions,
  };
}

function sortProjects(projects) {
  return [...projects].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
}

function runChecks(state, parsed) {
  const config = getChartConfig(state.chartType);
  const errors = [];
  const warnings = [];
  const labels = parsed.rows.map((row) => row.label);

  if (!state.title) {
    errors.push(UI_TEXT.titleRequired);
  }

  if (!state.source) {
    errors.push(UI_TEXT.sourceRequired);
  }

  if (parsed.rows.length < 2) {
    errors.push(UI_TEXT.minRows);
  }

  if (parsed.invalidRows > 0) {
    errors.push(UI_TEXT.invalidRows({ count: parsed.invalidRows }));
  }

  if (state.chartType === "annual-stacked" && seriesConfig.length < 2) {
    errors.push(UI_TEXT.minSeriesStacked);
  }

  if (!state.altText) {
    warnings.push(UI_TEXT.altTextEmpty);
  }

  if (!state.methodology) {
    warnings.push(UI_TEXT.methodologyEmpty);
  }

  if (!state.owner) {
    warnings.push(UI_TEXT.ownerMissing);
  }

  if (new Set(labels).size !== labels.length) {
    warnings.push(UI_TEXT.duplicateLabels);
  }

  if (labels.some((label) => label.length > 32)) {
    warnings.push(UI_TEXT.longLabels);
  }

  if (state.chartType === "column" && parsed.rows.length > 8) {
    warnings.push(UI_TEXT.columnTooManyRows);
  }

  if (state.chartType === "annual-stacked" && parsed.rows.length > 10) {
    warnings.push(UI_TEXT.annualStackedTooManyRows);
  }

  if (state.chartType === "annual-balance") {
    const hasPositive = parsed.rows.some((row) => row.value > 0);
    const hasNegative = parsed.rows.some((row) => row.value < 0);

    if (!hasPositive || !hasNegative) {
      warnings.push(UI_TEXT.annualBalanceNeedsSigns);
    }
  }

  if (config.seriesMode === "multi" && seriesConfig.length > MAX_SERIES) {
    warnings.push(UI_TEXT.tooManySeries);
  }

  return { errors, warnings };
}

function parseTableRows(rows, series) {
  const parsedRows = [];
  let invalidRows = 0;

  rows.forEach((row) => {
    const label = String(row.label ?? "").trim();
    const values = {};
    let hasAnyValue = false;
    let invalidValue = false;

    series.forEach((seriesItem) => {
      const parsedValue = parseNumeric(row[seriesItem.id]);

      if (parsedValue !== null) {
        hasAnyValue = true;
        values[seriesItem.id] = parsedValue;
      } else {
        values[seriesItem.id] = 0;
        if (String(row[seriesItem.id] ?? "").trim() !== "") {
          invalidValue = true;
        }
      }
    });

    if (!label && !hasAnyValue && !invalidValue) {
      return;
    }

    if (!label || invalidValue) {
      invalidRows += 1;
      return;
    }

    const total = series.reduce((sum, seriesItem) => sum + values[seriesItem.id], 0);

    parsedRows.push({
      label,
      values,
      total,
      value: values[series[0].id],
    });
  });

  return { rows: parsedRows, invalidRows };
}

function parseCsv(input, chartType, currentSeriesConfig) {
  const config = getChartConfig(chartType);
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], invalidRows: 0, series: cloneData(currentSeriesConfig) };
  }

  const delimiter = detectDelimiter(lines[0]);
  const header = splitDelimitedLine(lines[0], delimiter).map((cell) => cell.trim());

  if (header.length < 2) {
    return { rows: [], invalidRows: 0, series: cloneData(currentSeriesConfig) };
  }

  let series = [];

  if (config.seriesMode === "multi") {
    series = header
      .slice(1, config.maxSeries + 1)
      .map((label, index) => ({
        id: buildSeriesId(label || `serie-${index + 1}`, index),
        label: label || UI_TEXT.seriesName({ index: index + 1 }),
        color:
          currentSeriesConfig[index]?.color ||
          config.defaultSeries[index]?.color ||
          pickSeriesColor(index),
      }));
  } else {
    const label = header[1] || currentSeriesConfig[0]?.label || config.defaultSeries[0].label;
    series = [
      {
        id: config.defaultSeries[0].id,
        label,
        color: currentSeriesConfig[0]?.color || config.defaultSeries[0].color,
      },
    ];
  }

  const rows = [];
  let invalidRows = 0;

  lines.slice(1).forEach((line) => {
    const cells = splitDelimitedLine(line, delimiter).map((cell) => cell.trim());
    const row = createEmptyRow(series);
    row.label = cells[0] ?? "";

    if (!row.label && cells.every((cell) => !cell)) {
      return;
    }

    let rowInvalid = false;
    let hasAnyValue = false;

    series.forEach((seriesItem, index) => {
      const rawValue = cells[index + 1] ?? "";

      if (rawValue === "") {
        row[seriesItem.id] = "";
        return;
      }

      const parsedValue = parseNumeric(rawValue);

      if (parsedValue === null) {
        rowInvalid = true;
        return;
      }

      row[seriesItem.id] = String(parsedValue);
      hasAnyValue = true;
    });

    if (!row.label || rowInvalid || !hasAnyValue) {
      invalidRows += 1;
      return;
    }

    rows.push(row);
  });

  return { rows, invalidRows, series };
}

function detectDelimiter(line) {
  const candidates = [",", ";", "\t"];
  let best = ",";
  let count = 0;

  candidates.forEach((candidate) => {
    const current = (line.match(new RegExp(escapeRegExp(candidate), "g")) || []).length;

    if (current > count) {
      count = current;
      best = candidate;
    }
  });

  return best;
}

function splitDelimitedLine(line, delimiter) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function renderSvgChart({ title, subtitle, source, chartType, rows, series }) {
  if (chartType === "annual-stacked") {
    return renderAnnualStackedChart({ title, subtitle, source, rows, series });
  }

  if (chartType === "annual-balance") {
    return renderAnnualBalanceChart({ title, subtitle, source, rows, series });
  }

  if (chartType === "line") {
    return renderLineChart({ title, subtitle, source, rows, series });
  }

  if (chartType === "column") {
    return renderColumnChart({ title, subtitle, source, rows, series });
  }

  return renderBarChart({ title, subtitle, source, rows, series });
}

function renderAnnualStackedChart({ title, subtitle, source, rows, series }) {
  const width = 860;
  const height = 620;
  const padding = { top: 112, right: 52, bottom: 132, left: 72 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const upperBound = niceUpperBound(Math.max(...rows.map((row) => row.total), 1), 5);
  const step = upperBound / 5;
  const slotWidth = chartWidth / Math.max(rows.length, 1);
  const barWidth = clamp(slotWidth * 0.56, 18, 44);

  const grid = Array.from({ length: 6 }, (_, index) => {
    const value = step * index;
    const y = padding.top + chartHeight - (value / upperBound) * chartHeight;

    return `
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}" stroke="${REPORT_COLORS.grid}" />
      <text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" font-size="12" fill="${REPORT_COLORS.text}">${formatChartNumber(
        value,
      )}</text>
    `;
  }).join("");

  const bars = rows
    .map((row, index) => {
      const centerX = padding.left + index * slotWidth + slotWidth / 2;
      let cursorY = padding.top + chartHeight;

      const segments = series
        .map((seriesItem) => {
          const value = row.values[seriesItem.id];

          if (value <= 0) {
            return "";
          }

          const segmentHeight = (value / upperBound) * chartHeight;
          cursorY -= segmentHeight;
          const labelY = cursorY + segmentHeight / 2 + 4;
          const showLabel = segmentHeight > 20 && rows.length <= 12;

          return `
            <rect
              x="${centerX - barWidth / 2}"
              y="${cursorY}"
              width="${barWidth}"
              height="${segmentHeight}"
              fill="${seriesItem.color}"
            />
            ${
              showLabel
                ? `<text x="${centerX}" y="${labelY}" text-anchor="middle" font-size="11" fill="${
                    seriesItem.color === REPORT_COLORS.blue ? "#ffffff" : REPORT_COLORS.text
                  }">${formatChartNumber(value)}</text>`
                : ""
            }
          `;
        })
        .join("");

      const totalY = cursorY - 10;
      const labelLines = wrapLabel(row.label, 8);

      return `
        ${segments}
        <text x="${centerX}" y="${totalY}" text-anchor="middle" font-size="11" fill="${REPORT_COLORS.text}">${formatChartNumber(
          row.total,
        )}</text>
        ${renderMultilineText({
          lines: labelLines,
          x: centerX,
          y: height - 78,
          fontSize: 12,
          lineHeight: 14,
          fill: REPORT_COLORS.text,
        })}
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}" font-family="${escapeAttribute(
      EXPORT_FONT_FAMILY,
    )}" font-weight="300">
      <rect width="${width}" height="${height}" fill="${REPORT_COLORS.paper}" />
      ${renderAnnualHeader({ title, subtitle, source, width })}
      ${grid}
      ${bars}
      ${renderLegend({
        series,
        x: 70,
        y: height - 56,
        rowGap: 18,
      })}
    </svg>
  `;
}

function renderAnnualBalanceChart({ title, subtitle, source, rows }) {
  const width = 960;
  const height = 520;
  const padding = { top: 110, right: 34, bottom: 78, left: 78 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const minValue = Math.min(...rows.map((row) => row.value), 0);
  const maxValue = Math.max(...rows.map((row) => row.value), 0);
  const step = niceStep(Math.max(maxValue - minValue, 1) / 7);
  const upperBound = Math.max(step, Math.ceil(maxValue / step) * step);
  const lowerBound = Math.min(-step, Math.floor(minValue / step) * step);
  const range = upperBound - lowerBound || 1;
  const slotWidth = chartWidth / Math.max(rows.length, 1);
  const barWidth = clamp(slotWidth * 0.76, 14, 40);
  const yForValue = (value) => padding.top + ((upperBound - value) / range) * chartHeight;
  const baselineY = yForValue(0);

  const gridValues = [];
  for (let value = upperBound; value >= lowerBound; value -= step) {
    gridValues.push(value);
  }

  const grid = gridValues
    .map((value) => {
      const y = yForValue(value);
      return `
        <line x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}" stroke="${REPORT_COLORS.grid}" />
        <text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" font-size="11" fill="${REPORT_COLORS.text}">${formatChartNumber(
          value,
        )}</text>
      `;
    })
    .join("");

  const bars = rows
    .map((row, index) => {
      const centerX = padding.left + index * slotWidth + slotWidth / 2;
      const y = yForValue(row.value);
      const rectY = Math.min(y, baselineY);
      const rectHeight = Math.max(Math.abs(y - baselineY), 2);
      const fill = row.value >= 0 ? REPORT_COLORS.blue : REPORT_COLORS.red;
      const valueY = row.value >= 0 ? rectY - 10 : rectY + rectHeight + 16;

      return `
        <rect
          x="${centerX - barWidth / 2}"
          y="${rectY}"
          width="${barWidth}"
          height="${rectHeight}"
          fill="${fill}"
        />
        <text x="${centerX}" y="${valueY}" text-anchor="middle" font-size="11" fill="${REPORT_COLORS.text}">${formatChartNumber(
          row.value,
        )}</text>
        <text x="${centerX}" y="${height - 30}" text-anchor="middle" font-size="11" fill="${REPORT_COLORS.text}">${escapeHtml(
          row.label,
        )}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}" font-family="${escapeAttribute(
      EXPORT_FONT_FAMILY,
    )}" font-weight="300">
      <rect width="${width}" height="${height}" fill="${REPORT_COLORS.paper}" />
      ${renderAnnualHeader({ title, subtitle, source, width })}
      ${grid}
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${baselineY}" y2="${baselineY}" stroke="${REPORT_COLORS.grid}" />
      ${bars}
    </svg>
  `;
}

function renderBarChart({ title, subtitle, source, rows, series }) {
  const width = 860;
  const rowHeight = 38;
  const chartTop = 126;
  const chartLeft = 210;
  const chartRight = 70;
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const barSpace = width - chartLeft - chartRight;
  const height = chartTop + rows.length * rowHeight + 92;
  const fill = series[0]?.color || REPORT_COLORS.blue;

  const bars = rows
    .map((row, index) => {
      const y = chartTop + index * rowHeight;
      const barWidth = Math.max((row.value / maxValue) * barSpace, 2);

      return `
        <text x="${chartLeft - 16}" y="${y + 22}" text-anchor="end" font-size="14" fill="${REPORT_COLORS.text}">${escapeHtml(
          row.label,
        )}</text>
        <rect x="${chartLeft}" y="${y + 8}" width="${barWidth}" height="20" rx="10" fill="${fill}" />
        <text x="${chartLeft + barWidth + 10}" y="${y + 23}" font-size="14" fill="${REPORT_COLORS.text}">${formatDisplayNumber(
          row.value,
        )}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}" font-family="${escapeAttribute(
      EXPORT_FONT_FAMILY,
    )}" font-weight="300">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      <line x1="${chartLeft}" x2="${chartLeft}" y1="${chartTop - 10}" y2="${height - 64}" stroke="${REPORT_COLORS.grid}" />
      ${bars}
      <text x="42" y="${height - 30}" font-size="13" fill="${REPORT_COLORS.muted}">${escapeHtml(
        UI_TEXT.sourceLabel,
      )}: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function renderColumnChart({ title, subtitle, source, rows, series }) {
  const width = 860;
  const height = 560;
  const padding = { top: 126, right: 48, bottom: 158, left: 82 };
  const maxValue = Math.max(...rows.map((row) => row.value), 0);
  const minValue = Math.min(...rows.map((row) => row.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const slotWidth = chartWidth / Math.max(rows.length, 1);
  const barWidth = clamp(slotWidth * 0.6, 22, 56);
  const fill = series[0]?.color || REPORT_COLORS.blue;
  const yForValue = (value) => padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
  const baselineY = yForValue(0);

  const grid = Array.from({ length: 5 }, (_, index) => {
    const value = maxValue - (index / 4) * range;
    const y = yForValue(value);
    return `
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}" stroke="${REPORT_COLORS.grid}" opacity="0.6" />
      <text x="${padding.left - 12}" y="${y + 5}" text-anchor="end" font-size="13" fill="${REPORT_COLORS.muted}">${formatDisplayNumber(
        value,
      )}</text>
    `;
  }).join("");

  const bars = rows
    .map((row, index) => {
      const centerX = padding.left + index * slotWidth + slotWidth / 2;
      const y = yForValue(row.value);
      const rectY = Math.min(y, baselineY);
      const rectHeight = Math.max(Math.abs(y - baselineY), 2);
      const labelY = height - 84;

      return `
        <rect x="${centerX - barWidth / 2}" y="${rectY}" width="${barWidth}" height="${rectHeight}" rx="10" fill="${fill}" />
        <text x="${centerX}" y="${row.value >= 0 ? rectY - 10 : rectY + rectHeight + 18}" text-anchor="middle" font-size="13" fill="${REPORT_COLORS.text}">${formatDisplayNumber(
          row.value,
        )}</text>
        ${renderMultilineText({
          lines: wrapLabel(row.label, 14),
          x: centerX,
          y: labelY,
          fontSize: 12,
          lineHeight: 15,
          fill: REPORT_COLORS.text,
          opacity: "0.8",
        })}
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}" font-family="${escapeAttribute(
      EXPORT_FONT_FAMILY,
    )}" font-weight="300">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      ${grid}
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${baselineY}" y2="${baselineY}" stroke="${REPORT_COLORS.text}" opacity="0.5" />
      <line x1="${padding.left}" x2="${padding.left}" y1="${padding.top}" y2="${height - padding.bottom}" stroke="${REPORT_COLORS.grid}" opacity="0.6" />
      ${bars}
      <text x="42" y="${height - 24}" font-size="13" fill="${REPORT_COLORS.muted}">${escapeHtml(
        UI_TEXT.sourceLabel,
      )}: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function renderLineChart({ title, subtitle, source, rows, series }) {
  const width = 860;
  const height = 500;
  const padding = { top: 126, right: 54, bottom: 92, left: 78 };
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const minValue = Math.min(...rows.map((row) => row.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stroke = series[0]?.color || REPORT_COLORS.blue;

  const points = rows.map((row, index) => {
    const x =
      padding.left +
      (rows.length === 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - ((row.value - minValue) / range) * chartHeight;
    return { ...row, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  const grid = Array.from({ length: 5 }, (_, index) => {
    const y = padding.top + (index / 4) * chartHeight;
    const value = maxValue - (index / 4) * range;
    return `
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}" stroke="${REPORT_COLORS.grid}" opacity="0.5" />
      <text x="${padding.left - 12}" y="${y + 5}" text-anchor="end" font-size="13" fill="${REPORT_COLORS.muted}">${formatDisplayNumber(
        value,
      )}</text>
    `;
  }).join("");

  const labels = points
    .map(
      (point) => `
        <text x="${point.x}" y="${height - 42}" text-anchor="middle" font-size="13" fill="${REPORT_COLORS.muted}">${escapeHtml(
          point.label,
        )}</text>
      `,
    )
    .join("");

  const dots = points
    .map(
      (point) => `
        <circle cx="${point.x}" cy="${point.y}" r="5.5" fill="${stroke}" />
        <text x="${point.x}" y="${point.y - 12}" text-anchor="middle" font-size="13" fill="${REPORT_COLORS.text}">${formatDisplayNumber(
          point.value,
        )}</text>
      `,
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}" font-family="${escapeAttribute(
      EXPORT_FONT_FAMILY,
    )}" font-weight="300">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      ${grid}
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${labels}
      ${dots}
      <text x="42" y="${height - 24}" font-size="13" fill="${REPORT_COLORS.muted}">${escapeHtml(
        UI_TEXT.sourceLabel,
      )}: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function renderAnnualHeader({ title, subtitle, source, width }) {
  const subtitlePart = subtitle ? `${escapeHtml(subtitle)}  ` : "";
  const sourcePart = source ? `${UI_TEXT.sourceUpper}: ${escapeHtml(source)}` : "";

  return `
    <text x="34" y="38" font-size="15" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
    <text x="34" y="58" font-size="10.5" fill="${REPORT_COLORS.muted}">
      <tspan>${subtitlePart}</tspan>
      <tspan fill="${REPORT_COLORS.link}">${sourcePart}</tspan>
    </text>
    <line x1="24" x2="${width - 24}" y1="82" y2="82" stroke="transparent" />
  `;
}

function renderLegend({ series, x, y, rowGap }) {
  return series
    .map(
      (seriesItem, index) => `
        <rect x="${x}" y="${y + index * rowGap - 10}" width="10" height="10" fill="${seriesItem.color}" />
        <text x="${x + 18}" y="${y + index * rowGap - 1}" font-size="11" fill="${REPORT_COLORS.text}">${escapeHtml(
          seriesItem.label,
        )}</text>
      `,
    )
    .join("");
}

async function playCurrentChartAnimation() {
  if (isPreviewAnimating || isVideoExporting) {
    return;
  }

  const context = getCurrentChartRenderContext();

  if (context.checks.errors.length > 0) {
    window.alert(UI_TEXT.emptyStateFixBlocks);
    return;
  }

  isPreviewAnimating = true;
  qualityChip.classList.remove("blocked", "warning");
  qualityChip.textContent = UI_TEXT.animationRunning;
  syncAuxiliaryUi();

  try {
    await ensureExportFontsLoaded();
    preview.innerHTML = renderSvgChart({
      title: context.state.title,
      subtitle: context.state.subtitle,
      source: context.state.source,
      chartType: context.state.chartType,
      rows: context.parsed.rows,
      series: context.series,
    });
    await animatePreviewReveal();
  } finally {
    isPreviewAnimating = false;
    render();
  }
}

async function animatePreviewReveal() {
  const svg = preview.querySelector("svg");

  if (!svg) {
    return;
  }

  const timing = {
    duration: ANIMATION_DURATION_MS,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "both",
  };

  const resetStyles = () => {
    svg.style.willChange = "";
    svg.style.clipPath = "";
    svg.style.transform = "";
    svg.style.opacity = "";
    svg.style.transition = "";
  };

  svg.style.willChange = "clip-path, transform, opacity";

  if (typeof svg.animate === "function") {
    const reveal = svg.animate(
      [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }],
      timing,
    );
    const motion = svg.animate(
      [{ opacity: 0.62, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
      timing,
    );

    await Promise.allSettled([reveal.finished, motion.finished]);
    resetStyles();
    return;
  }

  svg.style.clipPath = "inset(0 100% 0 0)";
  svg.style.transform = "translateY(8px)";
  svg.style.opacity = "0.62";
  svg.style.transition = [
    `clip-path ${ANIMATION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    `opacity ${ANIMATION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  ].join(", ");

  void svg.getBoundingClientRect();

  svg.style.clipPath = "inset(0 0 0 0)";
  svg.style.transform = "translateY(0)";
  svg.style.opacity = "1";

  await wait(ANIMATION_DURATION_MS + 30);
  resetStyles();
}

async function exportCurrentChartAsVideo() {
  if (isVideoExporting || isPreviewAnimating) {
    return;
  }

  const context = getCurrentChartRenderContext();

  if (context.checks.errors.length > 0) {
    window.alert(UI_TEXT.emptyStateFixBlocks);
    return;
  }

  if (typeof MediaRecorder !== "function") {
    window.alert(UI_TEXT.videoExportUnsupported);
    return;
  }

  const recorderProfile = getVideoRecorderProfile();

  if (!recorderProfile) {
    window.alert(UI_TEXT.videoExportUnsupported);
    return;
  }

  const exportData = getCurrentSvgExportData();

  if (!exportData) {
    window.alert(UI_TEXT.exportUnavailable);
    return;
  }

  isVideoExporting = true;
  qualityChip.classList.remove("blocked", "warning");
  qualityChip.textContent = UI_TEXT.videoExportRunning;
  syncAuxiliaryUi();

  let stream = null;

  try {
    await ensureExportFontsLoaded();

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(Math.round(exportData.width), 1);
    canvas.height = Math.max(Math.round(exportData.height), 1);

    const context2d = canvas.getContext("2d");

    if (!context2d || typeof canvas.captureStream !== "function") {
      window.alert(UI_TEXT.videoExportUnsupported);
      return;
    }

    stream = canvas.captureStream(VIDEO_FRAME_RATE);
    const chunks = [];
    const recorder = new MediaRecorder(
      stream,
      recorderProfile.mimeType
        ? { mimeType: recorderProfile.mimeType, videoBitsPerSecond: VIDEO_BIT_RATE }
        : { videoBitsPerSecond: VIDEO_BIT_RATE },
    );

    const recorderStopped = new Promise((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      });
      recorder.addEventListener("stop", resolve, { once: true });
      recorder.addEventListener("error", () => reject(recorder.error || new Error("Video export failed")), {
        once: true,
      });
    });

    recorder.start();

    const baseImage = await loadImage(buildSvgDataUrl(exportData.markup));

    await recordRevealVideoFrames({
      canvas,
      context2d,
      image: baseImage,
      durationMs: ANIMATION_DURATION_MS,
      frameRate: VIDEO_FRAME_RATE,
    });

    drawRevealFrame({ canvas, context2d, image: baseImage, progress: 1 });
    await wait(VIDEO_HOLD_DURATION_MS);
    recorder.stop();
    await recorderStopped;

    if (chunks.length === 0) {
      throw new Error("No video data recorded");
    }

    const videoBlob = new Blob(chunks, {
      type: recorderProfile.mimeType || recorder.mimeType || "video/webm",
    });
    downloadBlob(videoBlob, `${buildExportSlug()}.${recorderProfile.extension}`);

    if (recorderProfile.extension !== "mp4") {
      window.alert(UI_TEXT.videoFallbackWebm);
    }
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
    isVideoExporting = false;
    render();
  }
}

async function recordRevealVideoFrames({ canvas, context2d, image, durationMs, frameRate }) {
  const totalFrames = Math.max(Math.round((durationMs / 1000) * frameRate), 18);
  const frameDelay = 1000 / frameRate;

  for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex += 1) {
    const progress = frameIndex / totalFrames;
    drawRevealFrame({ canvas, context2d, image, progress });

    if (frameIndex < totalFrames) {
      await wait(frameDelay);
    }
  }
}

function drawRevealFrame({ canvas, context2d, image, progress }) {
  const eased = easeOutCubic(clamp(progress, 0, 1));
  const revealWidth = Math.max(Math.round(canvas.width * eased), 1);

  context2d.fillStyle = "#ffffff";
  context2d.fillRect(0, 0, canvas.width, canvas.height);
  context2d.imageSmoothingEnabled = true;
  context2d.imageSmoothingQuality = "high";
  context2d.save();
  context2d.beginPath();
  context2d.rect(0, 0, revealWidth, canvas.height);
  context2d.clip();
  context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
  context2d.restore();
}

function getVideoRecorderProfile() {
  const candidates = [
    { mimeType: "video/mp4;codecs=h264", extension: "mp4" },
    { mimeType: "video/mp4", extension: "mp4" },
    { mimeType: "video/webm;codecs=vp9", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
  ];

  if (typeof MediaRecorder.isTypeSupported !== "function") {
    return { mimeType: "", extension: "webm" };
  }

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }

  return null;
}

function exportCurrentChartAsSvg() {
  const exportData = getCurrentSvgExportData();

  if (!exportData) {
    window.alert(UI_TEXT.exportUnavailable);
    return;
  }

  downloadBlob(
    new Blob([exportData.wordMarkup], { type: "image/svg+xml;charset=utf-8" }),
    `${buildExportSlug()}.svg`,
  );
}

async function exportCurrentChartAsPng() {
  const exportData = getCurrentSvgExportData();

  if (!exportData) {
    window.alert(UI_TEXT.exportUnavailable);
    return;
  }

  await ensureExportFontsLoaded();

  const wordProfile = exportData.wordProfile;
  const image = await loadImage(buildSvgDataUrl(exportData.wordMarkup));
  const canvas = document.createElement("canvas");
  canvas.width = wordProfile.pixelWidth;
  canvas.height = wordProfile.pixelHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const pngBlob = await canvasToBlob(canvas);
  const calibratedBlob = await applyPngDensity(pngBlob, WORD_EXPORT_DPI);
  downloadBlob(calibratedBlob, `${buildExportSlug()}.png`);
}

function getCurrentSvgExportData() {
  const svg = preview.querySelector("svg");

  if (!svg) {
    return null;
  }

  const viewBox = svg.viewBox?.baseVal;
  const width = viewBox?.width || svg.width?.baseVal?.value || svg.getBoundingClientRect().width || 860;
  const height =
    viewBox?.height || svg.height?.baseVal?.value || svg.getBoundingClientRect().height || 500;

  return {
    markup: buildNormalizedSvgMarkup(svg, width, height),
    wordMarkup: buildNormalizedSvgMarkup(svg, width, height, {
      widthCm: getWordExportProfile(width, height).widthCm,
      heightCm: getWordExportProfile(width, height).heightCm,
    }),
    width,
    height,
    wordProfile: getWordExportProfile(width, height),
  };
}

function getWordExportProfile(sourceWidth = 860, sourceHeight = 500) {
  const widthCm = WORD_EXPORT_WIDTH_CM;
  const pixelWidth = Math.max(Math.round((widthCm / 2.54) * WORD_EXPORT_DPI), 1);
  const ratio = sourceHeight / sourceWidth || 1;
  const pixelHeight = Math.max(Math.round(pixelWidth * ratio), 1);
  const heightCm = Number.parseFloat((widthCm * ratio).toFixed(2));

  return {
    widthCm,
    heightCm,
    pixelWidth,
    pixelHeight,
    dpi: WORD_EXPORT_DPI,
  };
}

function buildExportSlug() {
  return slugify(fields.title.value || "graphics-lab");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image loading failed"));
    image.src = url;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Canvas toBlob failed"));
      }, "image/png");
      return;
    }

    try {
      resolve(dataUrlToBlob(canvas.toDataURL("image/png")));
    } catch (error) {
      reject(new Error("Canvas export failed"));
    }
  });
}

function buildNormalizedSvgMarkup(svg, width, height, options = {}) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", options.widthCm ? `${options.widthCm}cm` : String(width));
  clone.setAttribute("height", options.heightCm ? `${options.heightCm}cm` : String(height));
  clone.setAttribute("font-family", EXPORT_FONT_FAMILY);
  clone.setAttribute("font-weight", "300");
  clone.setAttribute("text-rendering", "geometricPrecision");
  clone.setAttribute("shape-rendering", "geometricPrecision");

  if (!clone.getAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
}

async function ensureExportFontsLoaded() {
  if (!document.fonts?.load) {
    return;
  }

  try {
    await Promise.all([
      document.fonts.load('300 16px "League Spartan"'),
      document.fonts.load('400 16px "League Spartan"'),
      document.fonts.load('600 16px "League Spartan"'),
      document.fonts.load('700 16px "League Spartan"'),
      document.fonts.ready,
    ]);
  } catch (error) {
    // The export can continue with the fallback font if the remote font is unavailable.
  }
}

function buildSvgDataUrl(markup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function dataUrlToBlob(dataUrl) {
  const [meta, content] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

async function applyPngDensity(blob, dpi) {
  try {
    const source = new Uint8Array(await blob.arrayBuffer());

    if (!isPngFile(source)) {
      return blob;
    }

    const pixelsPerMeter = Math.max(Math.round(dpi * 39.3701), 1);
    const data = new Uint8Array(9);
    writeUint32(data, 0, pixelsPerMeter);
    writeUint32(data, 4, pixelsPerMeter);
    data[8] = 1;

    const nextBytes = replaceOrInsertPngChunk(source, "pHYs", data, "IHDR");
    return new Blob([nextBytes], { type: "image/png" });
  } catch (error) {
    return blob;
  }
}

function isPngFile(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  return signature.every((value, index) => bytes[index] === value);
}

function replaceOrInsertPngChunk(bytes, chunkType, data, insertAfterType) {
  let offset = 8;
  let insertOffset = 8;

  while (offset < bytes.length) {
    const length = readUint32(bytes, offset);
    const type = readChunkType(bytes, offset + 4);
    const chunkEnd = offset + length + 12;

    if (type === insertAfterType) {
      insertOffset = chunkEnd;
    }

    if (type === chunkType) {
      return concatUint8Arrays([
        bytes.slice(0, offset),
        buildPngChunk(chunkType, data),
        bytes.slice(chunkEnd),
      ]);
    }

    offset = chunkEnd;
  }

  return concatUint8Arrays([
    bytes.slice(0, insertOffset),
    buildPngChunk(chunkType, data),
    bytes.slice(insertOffset),
  ]);
}

function buildPngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(data.length + 12);
  writeUint32(chunk, 0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  writeUint32(chunk, data.length + 8, calculateCrc32(chunk.slice(4, data.length + 8)));
  return chunk;
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    merged.set(part, offset);
    offset += part.length;
  });

  return merged;
}

function readUint32(bytes, offset) {
  return (
    ((bytes[offset] << 24) >>> 0) +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  );
}

function writeUint32(bytes, offset, value) {
  bytes[offset] = (value >>> 24) & 255;
  bytes[offset + 1] = (value >>> 16) & 255;
  bytes[offset + 2] = (value >>> 8) & 255;
  bytes[offset + 3] = value & 255;
}

function readChunkType(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function calculateCrc32(bytes) {
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc = CRC32_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let current = index;

    for (let bit = 0; bit < 8; bit += 1) {
      if ((current & 1) === 1) {
        current = 0xedb88320 ^ (current >>> 1);
      } else {
        current >>>= 1;
      }
    }

    return current >>> 0;
  });
}

function ensureMinimumRows() {
  dataRows = padRows(dataRows, seriesConfig);
}

function padRows(rows, series) {
  const nextRows = rows.map((row) => {
    const nextRow = { label: String(row.label ?? "") };
    series.forEach((seriesItem) => {
      nextRow[seriesItem.id] = String(row[seriesItem.id] ?? "");
    });
    return nextRow;
  });

  while (nextRows.length < MIN_ROWS) {
    nextRows.push(createEmptyRow(series));
  }

  return nextRows;
}

function createEmptyRow(series) {
  const row = { label: "" };
  series.forEach((seriesItem) => {
    row[seriesItem.id] = "";
  });
  return row;
}

function buildCsvPlaceholder(chartType) {
  return getSampleState(chartType).csvImport ?? serializeRowsToCsv(getSampleState(chartType).rows, getSampleState(chartType).series);
}

function serializeRowsToCsv(rows, series) {
  const header = ["label", ...series.map((seriesItem) => seriesItem.label)];
  const lines = rows
    .filter((row) => row.label || series.some((seriesItem) => String(row[seriesItem.id] ?? "").trim() !== ""))
    .map((row) => [row.label, ...series.map((seriesItem) => row[seriesItem.id] ?? "")].join(","));

  return [...header, ...lines].join("\n");
}

function parseNumeric(value) {
  const raw = String(value ?? "").trim();

  if (raw === "") {
    return null;
  }

  const normalized = raw.replace(/\s/g, "").replace("'", "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function wrapLabel(label, maxLength) {
  const words = String(label ?? "").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [""];
  }

  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLength || currentLine === "") {
      currentLine = candidate;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

function renderMultilineText({ lines, x, y, fontSize, lineHeight, fill, opacity = "1" }) {
  return `
    <text x="${x}" y="${y}" text-anchor="middle" font-size="${fontSize}" fill="${fill}" opacity="${opacity}">
      ${lines
        .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`)
        .join("")}
    </text>
  `;
}

function niceUpperBound(maxValue, steps) {
  const step = niceStep(maxValue / steps);
  return Math.max(step, Math.ceil(maxValue / step) * step);
}

function niceStep(value) {
  const safeValue = Math.max(value, 1);
  const exponent = Math.floor(Math.log10(safeValue));
  const fraction = safeValue / 10 ** exponent;

  if (fraction <= 1) {
    return 1 * 10 ** exponent;
  }

  if (fraction <= 2) {
    return 2 * 10 ** exponent;
  }

  if (fraction <= 5) {
    return 5 * 10 ** exponent;
  }

  return 10 * 10 ** exponent;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickSeriesColor(index) {
  const palette = [REPORT_COLORS.grey, REPORT_COLORS.blue, REPORT_COLORS.red, "#7f8aa3"];
  return palette[index % palette.length];
}

function buildSeriesId(value, index) {
  return slugify(value || `serie-${index + 1}`) || `serie-${index + 1}`;
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function wait(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function formatDisplayNumber(value) {
  return new Intl.NumberFormat(getContentNumberLocale(), {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatChartNumber(value) {
  return new Intl.NumberFormat(getContentNumberLocale(), {
    useGrouping: false,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(getUiLocaleCode(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDateTime(value) {
  return new Intl.DateTimeFormat(getUiLocaleCode(), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildDefaultProjectName() {
  return `${UI_TEXT.projectPrefix} ${new Intl.DateTimeFormat(getUiLocaleCode(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .replaceAll(".", "-")}`;
}

function buildForkProjectName(value) {
  const cleanValue = String(value ?? "").trim();

  if (!cleanValue) {
    return UI_TEXT.newProjectFallback;
  }

  if (UI_TEXT.copyWordPattern.test(cleanValue)) {
    return cleanValue;
  }

  return `${cleanValue} ${UI_TEXT.copySuffix}`;
}

function getContentNumberLocale() {
  const selectedLocale = fields.locale?.value || UI_LANGUAGE;
  const locales = {
    fr: "fr-CH",
    de: "de-CH",
    it: "it-CH",
    en: "en-CH",
  };

  return locales[selectedLocale] || "fr-CH";
}

function getUiLocaleCode() {
  return UI_LANGUAGE === "de" ? "de-CH" : "fr-CH";
}

function buildEntityId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
