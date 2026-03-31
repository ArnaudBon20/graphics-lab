const SAMPLE_STATE = {
  title: "Évolution des audits publiés",
  subtitle: "Exemple de jeu de données simple pour un premier test CDF",
  chartType: "bar",
  locale: "fr",
  source: "CDF, démonstration interne",
  owner: "Equipe audit / prototype",
  methodology:
    "Comptage fictif utilisé uniquement pour illustrer un prototype de workflow graphique.",
  altText:
    "Le graphique compare quatre domaines et montre que les audits IT ont le volume le plus élevé.",
  csvInput: `label,value
Audits IT,18
Marchés publics,11
Subventions,9
Gouvernance,14`,
};

const STORAGE_KEY = "cdf-graphics-lab-draft";

const form = document.querySelector("#editor-form");
const preview = document.querySelector("#chart-preview");
const payloadPreview = document.querySelector("#payload-preview");
const errorsList = document.querySelector("#errors-list");
const warningsList = document.querySelector("#warnings-list");
const qualityChip = document.querySelector("#quality-chip");
const previewMeta = document.querySelector("#preview-meta");

const fields = {
  title: document.querySelector("#title"),
  subtitle: document.querySelector("#subtitle"),
  chartType: document.querySelector("#chart-type"),
  locale: document.querySelector("#locale"),
  source: document.querySelector("#source"),
  owner: document.querySelector("#owner"),
  methodology: document.querySelector("#methodology"),
  altText: document.querySelector("#alt-text"),
  csvInput: document.querySelector("#csv-input"),
};

document.querySelector("#load-sample").addEventListener("click", () => {
  applyState(SAMPLE_STATE);
  render();
});

document.querySelector("#reset-form").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  applyState({
    ...SAMPLE_STATE,
    title: "",
    subtitle: "",
    source: "",
    owner: "",
    methodology: "",
    altText: "",
    csvInput: "label,value\n",
  });
  render();
});

document.querySelector("#save-draft").addEventListener("click", () => {
  const state = getState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  qualityChip.textContent = "Brouillon sauvé";
  setTimeout(render, 500);
});

document.querySelector("#copy-config").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(buildPayload(), null, 2));
    qualityChip.textContent = "JSON copié";
    setTimeout(render, 500);
  } catch (error) {
    window.alert("Le navigateur a refusé l'accès au presse-papiers.");
  }
});

document.querySelector("#export-svg").addEventListener("click", () => {
  const svg = preview.querySelector("svg");

  if (!svg) {
    window.alert("Impossible d'exporter: aucun SVG n'est disponible.");
    return;
  }

  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeSlug = slugify(fields.title.value || "cdf-graphic");
  link.href = url;
  link.download = `${safeSlug}.svg`;
  link.click();
  URL.revokeObjectURL(url);
});

form.addEventListener("input", render);
form.addEventListener("change", render);

boot();

function boot() {
  const saved = loadSavedState();
  applyState(saved || SAMPLE_STATE);
  render();
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function applyState(state) {
  Object.entries(fields).forEach(([key, element]) => {
    element.value = state[key] ?? "";
  });
}

function getState() {
  return {
    title: fields.title.value.trim(),
    subtitle: fields.subtitle.value.trim(),
    chartType: fields.chartType.value,
    locale: fields.locale.value,
    source: fields.source.value.trim(),
    owner: fields.owner.value.trim(),
    methodology: fields.methodology.value.trim(),
    altText: fields.altText.value.trim(),
    csvInput: fields.csvInput.value,
  };
}

function buildPayload() {
  const state = getState();
  const parsed = parseCsv(state.csvInput);

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
      exportTargets: ["web", "svg"],
    },
    data: parsed.rows,
  };
}

function render() {
  const state = getState();
  const parsed = parseCsv(state.csvInput);
  const payload = {
    ...buildPayload(),
    checks: runChecks(state, parsed),
  };

  renderLists(payload.checks);
  renderQuality(payload.checks);
  renderPreviewMeta(parsed.rows.length, state.locale, state.chartType);
  renderPayload(payload);

  if (payload.checks.errors.length > 0) {
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
  });
}

function renderLists(checks) {
  const errors = checks.errors.length ? checks.errors : ["Aucun blocage."];
  const warnings = checks.warnings.length ? checks.warnings : ["Aucun warning."];

  errorsList.innerHTML = errors.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  warningsList.innerHTML = warnings
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function renderQuality(checks) {
  qualityChip.classList.remove("blocked", "warning");

  if (checks.errors.length > 0) {
    qualityChip.classList.add("blocked");
    qualityChip.textContent = "Bloqué";
    return;
  }

  if (checks.warnings.length > 0) {
    qualityChip.classList.add("warning");
    qualityChip.textContent = "Prêt avec réserves";
    return;
  }

  qualityChip.textContent = "Prêt pour revue";
}

function renderPreviewMeta(rowCount, locale, chartType) {
  const chartLabel = chartType === "line" ? "courbe" : "barres";
  previewMeta.textContent = `${rowCount} lignes • ${locale.toUpperCase()} • ${chartLabel}`;
}

function renderPayload(payload) {
  payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

function runChecks(state, parsed) {
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
    errors.push("Il faut au moins deux lignes de données.");
  }

  if (parsed.invalidRows > 0) {
    errors.push(`${parsed.invalidRows} ligne(s) de données contiennent une valeur invalide.`);
  }

  if (!state.altText) {
    warnings.push("Le texte alternatif est vide.");
  }

  if (!state.methodology) {
    warnings.push("La note méthodologique est vide.");
  }

  if (!state.owner) {
    warnings.push("Le service responsable n'est pas renseigné.");
  }

  if (labels.length > 12) {
    warnings.push("Plus de 12 lignes: le rendu risque d'être chargé.");
  }

  if (new Set(labels).size !== labels.length) {
    warnings.push("Certaines étiquettes sont dupliquées.");
  }

  if (labels.some((label) => label.length > 24)) {
    warnings.push("Certaines étiquettes sont longues et peuvent casser la mise en page.");
  }

  return { errors, warnings };
}

function parseCsv(input) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], invalidRows: 0 };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rows = [];
  let invalidRows = 0;

  lines.slice(1).forEach((line) => {
    const cells = splitDelimitedLine(line, delimiter).map((cell) => cell.trim());

    if (cells.length < 2) {
      invalidRows += 1;
      return;
    }

    const label = cells[0];
    const value = Number.parseFloat(cells[1].replace(",", "."));

    if (!label || Number.isNaN(value)) {
      invalidRows += 1;
      return;
    }

    rows.push({ label, value });
  });

  return { rows, invalidRows };
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

function renderSvgChart({ title, subtitle, source, chartType, rows }) {
  return chartType === "line"
    ? renderLineChart({ title, subtitle, source, rows })
    : renderBarChart({ title, subtitle, source, rows });
}

function renderBarChart({ title, subtitle, source, rows }) {
  const width = 860;
  const rowHeight = 34;
  const chartTop = 126;
  const chartLeft = 180;
  const chartRight = 70;
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const barSpace = width - chartLeft - chartRight;
  const height = chartTop + rows.length * rowHeight + 92;

  const bars = rows
    .map((row, index) => {
      const y = chartTop + index * rowHeight;
      const barWidth = Math.max((row.value / maxValue) * barSpace, 2);

      return `
        <text x="${chartLeft - 16}" y="${y + 19}" text-anchor="end" font-size="14" fill="#4f5a70">${escapeHtml(
          row.label,
        )}</text>
        <rect x="${chartLeft}" y="${y + 6}" width="${barWidth}" height="18" rx="9" fill="#a10f2b" />
        <text x="${chartLeft + barWidth + 10}" y="${y + 20}" font-size="14" fill="#172033">${formatNumber(
          row.value,
        )}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
      <rect width="${width}" height="${height}" rx="28" fill="#fffdf8" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="#172033">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="#59627a">${escapeHtml(subtitle || "")}</text>
      <line x1="${chartLeft}" x2="${chartLeft}" y1="${chartTop - 10}" y2="${height - 64}" stroke="#d8deea" />
      ${bars}
      <text x="42" y="${height - 30}" font-size="13" fill="#59627a">Source: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function renderLineChart({ title, subtitle, source, rows }) {
  const width = 860;
  const height = 500;
  const padding = { top: 126, right: 54, bottom: 92, left: 78 };
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const minValue = Math.min(...rows.map((row) => row.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = rows
    .map((row, index) => {
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
      <line x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}" stroke="#e8ecf3" />
      <text x="${padding.left - 12}" y="${y + 5}" text-anchor="end" font-size="13" fill="#59627a">${formatNumber(
        value,
      )}</text>
    `;
  }).join("");

  const labels = points
    .map(
      (point) => `
        <text x="${point.x}" y="${height - 42}" text-anchor="middle" font-size="13" fill="#59627a">${escapeHtml(
          point.label,
        )}</text>
      `,
    )
    .join("");

  const dots = points
    .map(
      (point) => `
        <circle cx="${point.x}" cy="${point.y}" r="5.5" fill="#a10f2b" />
        <text x="${point.x}" y="${point.y - 12}" text-anchor="middle" font-size="13" fill="#172033">${formatNumber(
          point.value,
        )}</text>
      `,
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(title)}">
      <rect width="${width}" height="${height}" rx="28" fill="#fffdf8" />
      <text x="42" y="52" font-size="28" font-weight="700" fill="#172033">${escapeHtml(title)}</text>
      <text x="42" y="80" font-size="16" fill="#59627a">${escapeHtml(subtitle || "")}</text>
      ${grid}
      <path d="${path}" fill="none" stroke="#a10f2b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${labels}
      ${dots}
      <text x="42" y="${height - 24}" font-size="13" fill="#59627a">Source: ${escapeHtml(source)}</text>
    </svg>
  `;
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-CH", { maximumFractionDigits: 1 }).format(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
