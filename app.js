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

const STORAGE_KEY = "graphics-lab-draft-v2";
const DEFAULT_CHART_TYPE = "annual-stacked";
const MIN_ROWS = 5;
const MAX_SERIES = 4;

const CHART_CONFIGS = {
  "annual-stacked": {
    label: "Colonnes empilees (rapport annuel)",
    previewLabel: "colonnes empilees",
    seriesMode: "multi",
    minSeries: 2,
    maxSeries: 4,
    allowSeriesEditing: true,
    editableColors: true,
    templateNote:
      "Template proche du rapport annuel: fond gris clair, colonnes empilees, total affiche au sommet et legende en pied de graphique.",
    defaultSeries: [
      {
        id: "confederation_staff",
        label: "Employes et employees de la Confederation",
        color: REPORT_COLORS.grey,
      },
      {
        id: "external_staff",
        label: "Personnes externes a l'administration federale",
        color: REPORT_COLORS.blue,
      },
      {
        id: "covid_alerts",
        label: "Annonces liees au COVID-19",
        color: REPORT_COLORS.red,
      },
    ],
  },
  "annual-balance": {
    label: "Colonnes +/- (rapport annuel)",
    previewLabel: "colonnes positives / negatives",
    seriesMode: "single",
    minSeries: 1,
    maxSeries: 1,
    allowSeriesEditing: false,
    editableColors: false,
    templateNote:
      "Template type compte de resultats: une seule serie, bleu au-dessus de zero, rouge en dessous, grille annuelle et ligne de base explicite.",
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
      "Template simple a une seule serie. Pratique pour une comparaison de categories rapide.",
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
      "Template simple a une seule serie. Convient bien aux comparaisons annuelles ou temporelles courtes.",
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
      "Template simple a une seule serie. Ideal pour montrer une evolution dans le temps.",
    defaultSeries: [
      {
        id: "value",
        label: "Valeur",
        color: REPORT_COLORS.blue,
      },
    ],
  },
};

const SAMPLE_STATES = {
  "annual-stacked": {
    title: "Nombre de cas traites de lanceurs d'alerte 2015-2024",
    subtitle: "",
    chartType: "annual-stacked",
    locale: "fr",
    source: "CDF",
    owner: "Rapport annuel",
    methodology:
      "Exemple de structure inspiree du rapport annuel pour tester un graphique empile multi-series.",
    altText:
      "Les cas traites augmentent fortement a partir de 2020, avec un poids important des categories employees, externes et COVID.",
    series: cloneData(CHART_CONFIGS["annual-stacked"].defaultSeries),
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
    title: "Solde du compte de resultats de la Confederation",
    subtitle: "EN MILLIONS DE FRANCS, 2008-2023",
    chartType: "annual-balance",
    locale: "fr",
    source: "AFF. COMPTE D'ETAT, TOME 1, p. 19",
    owner: "Rapport annuel",
    methodology:
      "Exemple de structure inspiree du rapport annuel pour tester un graphique a colonnes positives et negatives.",
    altText:
      "Le solde reste positif jusqu'en 2019, bascule en negatif des 2020 puis revient legerement en positif en 2023.",
    series: cloneData(CHART_CONFIGS["annual-balance"].defaultSeries),
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
    title: "Exemple de categories",
    subtitle: "",
    chartType: "bar",
    locale: "fr",
    source: "Prototype",
    owner: "Graphics Lab",
    methodology: "Jeu de donnees simple pour tester les barres horizontales.",
    altText: "Le graphique compare quatre categories de demonstration.",
    series: cloneData(CHART_CONFIGS.bar.defaultSeries),
    rows: [
      { label: "Audit numerique", value: "18" },
      { label: "Subventions", value: "11" },
      { label: "Marches publics", value: "9" },
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
    methodology: "Jeu de donnees simple pour tester les colonnes verticales.",
    altText: "Le graphique montre quatre colonnes verticales de demonstration.",
    series: cloneData(CHART_CONFIGS.column.defaultSeries),
    rows: [
      { label: "2021", value: "14" },
      { label: "2022", value: "18" },
      { label: "2023", value: "12" },
      { label: "2024", value: "22" },
    ],
  },
  line: {
    title: "Evolution sur quatre ans",
    subtitle: "",
    chartType: "line",
    locale: "fr",
    source: "Prototype",
    owner: "Graphics Lab",
    methodology: "Jeu de donnees simple pour tester la courbe.",
    altText: "Le graphique montre une progression avec une legere baisse puis une hausse.",
    series: cloneData(CHART_CONFIGS.line.defaultSeries),
    rows: [
      { label: "2021", value: "14" },
      { label: "2022", value: "18" },
      { label: "2023", value: "12" },
      { label: "2024", value: "22" },
    ],
  },
};

const form = document.querySelector("#editor-form");
const preview = document.querySelector("#chart-preview");
const payloadPreview = document.querySelector("#payload-preview");
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

const fields = {
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

document.querySelector("#load-sample").addEventListener("click", () => {
  applyState(getSampleState(currentChartType));
  render({ syncAll: true });
});

document.querySelector("#reset-form").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  applyState(createBlankState(currentChartType));
  render({ syncAll: true });
});

document.querySelector("#save-draft").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
  qualityChip.textContent = "Brouillon sauve";
  setTimeout(() => render(), 500);
});

document.querySelector("#copy-config").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
    qualityChip.textContent = "JSON copie";
    setTimeout(() => render(), 500);
  } catch (error) {
    window.alert("Le navigateur a refuse l'acces au presse-papiers.");
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
    window.alert("Impossible d'exporter le PNG pour le moment.");
  }
});

fields.chartType.addEventListener("change", () => {
  handleChartTypeChange(fields.chartType.value);
});

addSeriesButton.addEventListener("click", () => {
  const config = getChartConfig(currentChartType);

  if (!config.allowSeriesEditing || seriesConfig.length >= config.maxSeries) {
    return;
  }

  seriesConfig.push({
    id: buildSeriesId(`serie-${seriesConfig.length + 1}`, seriesConfig.length),
    label: `Serie ${seriesConfig.length + 1}`,
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
    window.alert("Aucune donnee exploitable n'a ete trouvee dans le CSV.");
    return;
  }

  seriesConfig = imported.series;
  dataRows = padRows(imported.rows, seriesConfig);
  render({ syncAll: true });

  if (imported.invalidRows > 0) {
    window.alert(
      `${imported.invalidRows} ligne(s) n'ont pas pu etre importees parce qu'elles etaient incompletes ou invalides.`,
    );
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
  const saved = loadSavedState();
  applyState(saved || getSampleState(DEFAULT_CHART_TYPE));
  render({ syncAll: true });
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
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

function applyState(state) {
  const normalized = normalizeState(state);

  currentChartType = normalized.chartType;
  seriesConfig = normalized.series;
  dataRows = normalized.rows;

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
    label: String(series.label ?? defaults[index]?.label ?? `Serie ${index + 1}`),
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
      label: series.label || `Serie ${index + 1}`,
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

  return {
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
      exportTargets: ["web", "svg", "png"],
      series: cloneData(seriesConfig),
    },
    data: parsed.rows,
  };
}

function render(options = {}) {
  const { syncAll = false, syncTable = false, syncColumns = false } = options;
  const state = getState();
  const parsed = parseTableRows(dataRows, seriesConfig);
  const checks = runChecks(state, parsed);
  const payload = {
    ...buildPayload(),
    checks,
  };

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
  renderStats(parsed.rows);
  renderLists(checks);
  renderQuality(checks);
  renderPreviewMeta(parsed.rows.length, state.locale, state.chartType);
  renderPayload(payload);

  if (checks.errors.length > 0) {
    preview.innerHTML = `
      <div class="empty-state">
        <p>Corrige les blocages pour afficher le graphique.</p>
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
    <p class="section-kicker">Template</p>
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
          ? `<p class="series-help">Le template colore automatiquement les valeurs positives en bleu et les negatives en rouge.</p>`
          : "";

      return `
        <article class="series-card">
          <div class="series-card-head">
            <strong>Serie ${index + 1}</strong>
            ${
              canRemove
                ? `<button type="button" class="ghost compact" data-remove-series="${index}">Supprimer</button>`
                : ""
            }
          </div>
          <label>
            Libelle
            <input
              type="text"
              value="${escapeAttribute(series.label)}"
              data-series-index="${index}"
              data-series-field="label"
            />
          </label>
          <label>
            Couleur
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
        <p class="section-kicker">Series</p>
        <h4>Legende et couleurs</h4>
        <p class="data-note">
          ${escapeHtml(
            config.seriesMode === "multi"
              ? "Configure les series qui composeront les colonnes empilees."
              : "Template mono-serie. Le nom sert au payload et a la lecture des donnees.",
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
      <th>Libelle</th>
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
              placeholder="Libelle"
            />
          </td>
          ${valueCells(row, index)}
          <td class="remove-cell">
            <button
              type="button"
              class="row-remove"
              data-remove-row="${index}"
              aria-label="Supprimer la ligne ${index + 1}"
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
}

function renderStats(rows) {
  rowCountValue.textContent = String(rows.length);
  seriesCountValue.textContent = String(seriesConfig.length);
  totalValue.textContent = formatDisplayNumber(rows.reduce((sum, row) => sum + row.total, 0));
}

function renderLists(checks) {
  const errors = checks.errors.length ? checks.errors : ["Aucun blocage."];
  const warnings = checks.warnings.length ? checks.warnings : ["Aucun warning."];

  errorsList.innerHTML = errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  warningsList.innerHTML = warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderQuality(checks) {
  qualityChip.classList.remove("blocked", "warning");

  if (checks.errors.length > 0) {
    qualityChip.classList.add("blocked");
    qualityChip.textContent = "Bloque";
    return;
  }

  if (checks.warnings.length > 0) {
    qualityChip.classList.add("warning");
    qualityChip.textContent = "Pret avec reserves";
    return;
  }

  qualityChip.textContent = "Pret pour revue";
}

function renderPreviewMeta(rowCount, locale, chartType) {
  previewMeta.textContent = `${rowCount} lignes • ${locale.toUpperCase()} • ${getChartConfig(chartType).previewLabel}`;
}

function renderPayload(payload) {
  payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

function runChecks(state, parsed) {
  const config = getChartConfig(state.chartType);
  const errors = [];
  const warnings = [];
  const labels = parsed.rows.map((row) => row.label);

  if (!state.title) {
    errors.push("Le titre est obligatoire.");
  }

  if (!state.source) {
    errors.push("La source est obligatoire.");
  }

  if (parsed.rows.length < 2) {
    errors.push("Il faut au moins deux lignes de donnees.");
  }

  if (parsed.invalidRows > 0) {
    errors.push(`${parsed.invalidRows} ligne(s) de donnees contiennent une valeur invalide.`);
  }

  if (state.chartType === "annual-stacked" && seriesConfig.length < 2) {
    errors.push("Le template empile exige au moins deux series.");
  }

  if (!state.altText) {
    warnings.push("Le texte alternatif est vide.");
  }

  if (!state.methodology) {
    warnings.push("La note methodologique est vide.");
  }

  if (!state.owner) {
    warnings.push("Le service responsable n'est pas renseigne.");
  }

  if (new Set(labels).size !== labels.length) {
    warnings.push("Certaines etiquettes sont dupliquees.");
  }

  if (labels.some((label) => label.length > 32)) {
    warnings.push("Certaines etiquettes sont longues et peuvent casser la mise en page.");
  }

  if (state.chartType === "column" && parsed.rows.length > 8) {
    warnings.push("En colonnes verticales, plus de 8 categories deviennent vite difficiles a lire.");
  }

  if (state.chartType === "annual-stacked" && parsed.rows.length > 10) {
    warnings.push("Le template annuel empile devient plus difficile a lire au-dela d'environ 10 categories.");
  }

  if (state.chartType === "annual-balance") {
    const hasPositive = parsed.rows.some((row) => row.value > 0);
    const hasNegative = parsed.rows.some((row) => row.value < 0);

    if (!hasPositive || !hasNegative) {
      warnings.push("Le template +/- est plus parlant quand il contient a la fois des valeurs positives et negatives.");
    }
  }

  if (config.seriesMode === "multi" && seriesConfig.length > MAX_SERIES) {
    warnings.push("Trop de series risquent de nuire a la lisibilite du graphique.");
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
        label: label || `Serie ${index + 1}`,
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      <line x1="${chartLeft}" x2="${chartLeft}" y1="${chartTop - 10}" y2="${height - 64}" stroke="${REPORT_COLORS.grid}" />
      ${bars}
      <text x="42" y="${height - 30}" font-size="13" fill="${REPORT_COLORS.muted}">Source: ${escapeHtml(source)}</text>
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      ${grid}
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${baselineY}" y2="${baselineY}" stroke="${REPORT_COLORS.text}" opacity="0.5" />
      <line x1="${padding.left}" x2="${padding.left}" y1="${padding.top}" y2="${height - padding.bottom}" stroke="${REPORT_COLORS.grid}" opacity="0.6" />
      ${bars}
      <text x="42" y="${height - 24}" font-size="13" fill="${REPORT_COLORS.muted}">Source: ${escapeHtml(source)}</text>
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
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
      <rect width="${width}" height="${height}" rx="28" fill="#ffffff" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="${REPORT_COLORS.text}">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="${REPORT_COLORS.muted}">${escapeHtml(subtitle || "")}</text>
      ${grid}
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${labels}
      ${dots}
      <text x="42" y="${height - 24}" font-size="13" fill="${REPORT_COLORS.muted}">Source: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function renderAnnualHeader({ title, subtitle, source, width }) {
  const subtitlePart = subtitle ? `${escapeHtml(subtitle)}  ` : "";
  const sourcePart = source ? `SOURCE: ${escapeHtml(source)}` : "";

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

function exportCurrentChartAsSvg() {
  const exportData = getCurrentSvgExportData();

  if (!exportData) {
    window.alert("Impossible d'exporter: aucun SVG n'est disponible.");
    return;
  }

  downloadBlob(
    new Blob([exportData.markup], { type: "image/svg+xml;charset=utf-8" }),
    `${buildExportSlug()}.svg`,
  );
}

async function exportCurrentChartAsPng() {
  const exportData = getCurrentSvgExportData();

  if (!exportData) {
    window.alert("Impossible d'exporter: aucun SVG n'est disponible.");
    return;
  }

  const image = await loadImage(buildSvgDataUrl(exportData.markup));
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(Math.round(exportData.width * scale), 1);
  canvas.height = Math.max(Math.round(exportData.height * scale), 1);

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.drawImage(image, 0, 0, exportData.width, exportData.height);

  const pngBlob = await canvasToBlob(canvas);
  downloadBlob(pngBlob, `${buildExportSlug()}.png`);
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
    width,
    height,
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

function buildNormalizedSvgMarkup(svg, width, height) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  if (!clone.getAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`;
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

function formatDisplayNumber(value) {
  return new Intl.NumberFormat("fr-CH", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatChartNumber(value) {
  return new Intl.NumberFormat("fr-CH", {
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
