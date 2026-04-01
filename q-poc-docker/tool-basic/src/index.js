const express = require("express");
const { Resvg } = require("@resvg/resvg-js");

const PORT = Number(process.env.PORT || 4000);
const TOOL_NAME = process.env.TOOL_NAME || "simple-bars";

const CHART_TYPES = {
  BARS: "bars",
  STACKED_COLUMNS: "stacked-columns",
  PLUS_MINUS_COLUMNS: "plus-minus-columns"
};

const CDF_COLORS = {
  blue: "#274F8A",
  red: "#E05B4F",
  gray: "#9FA3A7",
  dark: "#1F2A37",
  grid: "#CBD2DA",
  axis: "#8E98A3"
};

const CDF_PALETTE = [
  CDF_COLORS.blue,
  CDF_COLORS.red,
  CDF_COLORS.gray,
  "#5D6F86",
  "#C56A60",
  "#7D8792"
];

const DEFAULT_FONT = "Frutiger, Arial, sans-serif";

const app = express();
app.use(express.json({ limit: "2mb" }));

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeValue(rawValue) {
  const parsed = Number(rawValue);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function normalizeColor(rawColor, fallback = CDF_COLORS.blue) {
  if (typeof rawColor !== "string") {
    return fallback;
  }
  const trimmed = rawColor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return fallback;
}

function normalizeChartType(rawType) {
  const allowedTypes = Object.values(CHART_TYPES);
  if (allowedTypes.includes(rawType)) {
    return rawType;
  }
  return CHART_TYPES.STACKED_COLUMNS;
}

function normalizeFontFamily(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    return DEFAULT_FONT;
  }

  const cleaned = rawValue.replace(/[^a-zA-Z0-9,\- "'\\.]/g, "").trim();
  if (!cleaned) {
    return DEFAULT_FONT;
  }
  return cleaned;
}

function formatNumber(value) {
  if (Math.abs(value) >= 1000) {
    return String(Math.round(value));
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Math.round(value * 10) / 10);
}

function getRequestedWidth(toolRuntimeConfig, fallback = 1000) {
  const fromDisplayOptions = Number(
    toolRuntimeConfig?.displayOptions?.width || Number.NaN
  );
  if (!Number.isNaN(fromDisplayOptions) && fromDisplayOptions > 0) {
    return Math.max(700, Math.min(3200, Math.round(fromDisplayOptions)));
  }

  const fromPreviewSize = Number(
    toolRuntimeConfig?.size?.width?.[0]?.value || Number.NaN
  );
  if (!Number.isNaN(fromPreviewSize) && fromPreviewSize > 0) {
    return Math.max(700, Math.min(3200, Math.round(fromPreviewSize)));
  }

  return fallback;
}

function getDefaultSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    title: "Modeles graphiques CDF",
    properties: {
      chartType: {
        type: "string",
        title: "Type de graphique",
        enum: [
          CHART_TYPES.STACKED_COLUMNS,
          CHART_TYPES.PLUS_MINUS_COLUMNS,
          CHART_TYPES.BARS
        ],
        default: CHART_TYPES.STACKED_COLUMNS
      },
      title: {
        type: "string",
        title: "Titre",
        default: "Nombre de cas traites de lanceurs d'alerte 2015-2024"
      },
      subtitle: {
        type: "string",
        title: "Sous-titre",
        default: "Mini POC Q - style CDF"
      },
      source: {
        type: "string",
        title: "Source",
        default: "SOURCE : CDF"
      },
      fontFamily: {
        type: "string",
        title: "Police",
        default: DEFAULT_FONT
      },
      positiveColor: {
        type: "string",
        title: "Couleur positive",
        default: CDF_COLORS.blue
      },
      negativeColor: {
        type: "string",
        title: "Couleur negative",
        default: CDF_COLORS.red
      },
      values: {
        type: "array",
        title: "Valeurs",
        minItems: 1,
        default: [
          { label: "2020", series: "Employes", value: 311, color: "#9FA3A7" },
          { label: "2020", series: "Externes", value: 96, color: "#274F8A" },
          { label: "2020", series: "Annonces", value: 77, color: "#E05B4F" },
          { label: "2021", series: "Employes", value: 229, color: "#9FA3A7" },
          { label: "2021", series: "Externes", value: 95, color: "#274F8A" },
          { label: "2021", series: "Annonces", value: 78, color: "#E05B4F" }
        ],
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              title: "Libelle",
              default: ""
            },
            series: {
              type: "string",
              title: "Serie",
              default: "Serie 1"
            },
            value: {
              type: "number",
              title: "Valeur",
              default: 0
            },
            color: {
              type: "string",
              title: "Couleur",
              default: CDF_COLORS.blue
            }
          },
          required: ["label", "value"]
        }
      }
    },
    required: ["chartType", "title", "values"]
  };
}

function normalizeEntries(values) {
  const input = Array.isArray(values) ? values : [];
  const seriesColorMap = new Map();
  const normalized = input.map((entry, index) => {
    const label = String(entry?.label || "").trim() || `Item ${index + 1}`;
    const series = String(entry?.series || "").trim() || "Serie 1";
    if (!seriesColorMap.has(series)) {
      seriesColorMap.set(series, CDF_PALETTE[seriesColorMap.size % CDF_PALETTE.length]);
    }
    const mappedColor = seriesColorMap.get(series);

    return {
      label,
      series,
      value: normalizeValue(entry?.value),
      color: normalizeColor(entry?.color, mappedColor)
    };
  });

  return normalized;
}

function groupByLabel(entries) {
  const groups = [];
  const byLabel = new Map();
  for (const entry of entries) {
    if (!byLabel.has(entry.label)) {
      const group = {
        label: entry.label,
        entries: []
      };
      byLabel.set(entry.label, group);
      groups.push(group);
    }
    byLabel.get(entry.label).entries.push(entry);
  }
  return groups;
}

function getSeriesLegend(entries) {
  const series = [];
  const seen = new Set();
  for (const entry of entries) {
    const key = entry.series;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    series.push({
      label: entry.series,
      color: entry.color
    });
  }
  return series;
}

function computeYDomain(chartType, groups) {
  let min = 0;
  let max = 0;

  if (chartType === CHART_TYPES.STACKED_COLUMNS) {
    for (const group of groups) {
      let positiveTotal = 0;
      let negativeTotal = 0;
      for (const entry of group.entries) {
        if (entry.value >= 0) {
          positiveTotal += entry.value;
        } else {
          negativeTotal += entry.value;
        }
      }
      max = Math.max(max, positiveTotal);
      min = Math.min(min, negativeTotal);
    }
  } else {
    for (const group of groups) {
      const total = group.entries.reduce((sum, entry) => sum + entry.value, 0);
      max = Math.max(max, total);
      min = Math.min(min, total);
    }
  }

  if (chartType === CHART_TYPES.BARS) {
    min = Math.min(0, min);
  }
  if (chartType === CHART_TYPES.PLUS_MINUS_COLUMNS) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  if (max === min) {
    max += 1;
  }

  return { min, max };
}

function toY(value, domainMin, domainMax, chartTop, chartHeight) {
  const ratio = (value - domainMin) / (domainMax - domainMin);
  return chartTop + (1 - ratio) * chartHeight;
}

function renderGrid({
  domainMin,
  domainMax,
  chartTop,
  chartHeight,
  chartLeft,
  chartRight
}) {
  const tickCount = 5;
  const lines = [];
  for (let index = 0; index <= tickCount; index += 1) {
    const value = domainMin + ((domainMax - domainMin) * index) / tickCount;
    const y = toY(value, domainMin, domainMax, chartTop, chartHeight);
    const stroke = Math.abs(value) < 0.00001 ? CDF_COLORS.axis : CDF_COLORS.grid;
    const strokeWidth = Math.abs(value) < 0.00001 ? 1.4 : 1;
    lines.push(
      `<line x1="${chartLeft}" y1="${y}" x2="${chartRight}" y2="${y}" stroke="${stroke}" stroke-width="${strokeWidth}" />`
    );
    lines.push(
      `<text x="${chartLeft - 10}" y="${y + 4}" font-size="12" text-anchor="end" fill="${CDF_COLORS.axis}">${escapeXml(
        formatNumber(value)
      )}</text>`
    );
  }
  return lines.join("");
}

function renderBars({
  chartType,
  groups,
  chartLeft,
  chartTop,
  chartWidth,
  chartHeight,
  domainMin,
  domainMax,
  positiveColor,
  negativeColor
}) {
  if (groups.length === 0) {
    return "";
  }

  const parts = [];
  const categoryStep = chartWidth / groups.length;
  const barWidth = Math.max(16, Math.min(74, categoryStep * 0.62));
  const zeroY = toY(0, domainMin, domainMax, chartTop, chartHeight);

  groups.forEach((group, index) => {
    const x = chartLeft + index * categoryStep + (categoryStep - barWidth) / 2;
    const xCenter = x + barWidth / 2;

    if (chartType === CHART_TYPES.STACKED_COLUMNS) {
      let positiveStack = 0;
      let negativeStack = 0;

      group.entries.forEach((entry) => {
        const start = entry.value >= 0 ? positiveStack : negativeStack;
        const end = start + entry.value;
        if (entry.value >= 0) {
          positiveStack = end;
        } else {
          negativeStack = end;
        }

        const y1 = toY(start, domainMin, domainMax, chartTop, chartHeight);
        const y2 = toY(end, domainMin, domainMax, chartTop, chartHeight);
        const rectY = Math.min(y1, y2);
        const rectHeight = Math.max(1, Math.abs(y2 - y1));

        parts.push(
          `<rect x="${x}" y="${rectY}" width="${barWidth}" height="${rectHeight}" fill="${entry.color}" />`
        );
      });

      const total = group.entries.reduce((sum, entry) => sum + entry.value, 0);
      const totalY = toY(total, domainMin, domainMax, chartTop, chartHeight);
      parts.push(
        `<text x="${xCenter}" y="${Math.max(chartTop + 14, totalY - 6)}" font-size="11" text-anchor="middle" fill="${CDF_COLORS.dark}">${escapeXml(
          formatNumber(total)
        )}</text>`
      );
    } else {
      const total = group.entries.reduce((sum, entry) => sum + entry.value, 0);
      const y1 = toY(Math.max(0, total), domainMin, domainMax, chartTop, chartHeight);
      const y2 = toY(Math.min(0, total), domainMin, domainMax, chartTop, chartHeight);
      const rectY = Math.min(y1, y2);
      const rectHeight = Math.max(1, Math.abs(y2 - y1));
      let fill = group.entries[0]?.color || CDF_COLORS.blue;

      if (chartType === CHART_TYPES.PLUS_MINUS_COLUMNS) {
        fill = total >= 0 ? positiveColor : negativeColor;
      }

      parts.push(
        `<rect x="${x}" y="${rectY}" width="${barWidth}" height="${rectHeight}" fill="${fill}" />`
      );

      const textY = total >= 0 ? rectY - 6 : rectY + rectHeight + 14;
      parts.push(
        `<text x="${xCenter}" y="${textY}" font-size="11" text-anchor="middle" fill="${CDF_COLORS.dark}">${escapeXml(
          formatNumber(total)
        )}</text>`
      );
    }

    parts.push(
      `<text x="${xCenter}" y="${chartTop + chartHeight + 24}" font-size="12" text-anchor="middle" fill="${CDF_COLORS.axis}">${escapeXml(
        group.label
      )}</text>`
    );
  });

  parts.push(
    `<line x1="${chartLeft}" y1="${zeroY}" x2="${chartLeft + chartWidth}" y2="${zeroY}" stroke="${CDF_COLORS.axis}" stroke-width="1.2" />`
  );

  return parts.join("");
}

function renderLegend({ chartType, entries, positiveColor, negativeColor, width, y }) {
  const legendEntries = [];

  if (chartType === CHART_TYPES.STACKED_COLUMNS) {
    legendEntries.push(...getSeriesLegend(entries));
  } else if (chartType === CHART_TYPES.PLUS_MINUS_COLUMNS) {
    legendEntries.push(
      { label: "Positif", color: positiveColor },
      { label: "Negatif", color: negativeColor }
    );
  } else {
    legendEntries.push(...getSeriesLegend(entries));
  }

  if (legendEntries.length === 0) {
    return "";
  }

  const itemWidth = Math.max(140, Math.floor(width / Math.max(legendEntries.length, 1)));
  return legendEntries
    .map((legendEntry, index) => {
      const x = 66 + index * itemWidth;
      return `<rect x="${x}" y="${y}" width="14" height="14" fill="${legendEntry.color}" />
<text x="${x + 20}" y="${y + 11}" font-size="12" fill="${CDF_COLORS.dark}">${escapeXml(
        legendEntry.label
      )}</text>`;
    })
    .join("");
}

function buildSvg(item, toolRuntimeConfig) {
  const chartType = normalizeChartType(item.chartType);
  const fontFamily = normalizeFontFamily(item.fontFamily || DEFAULT_FONT);
  const positiveColor = normalizeColor(item.positiveColor, CDF_COLORS.blue);
  const negativeColor = normalizeColor(item.negativeColor, CDF_COLORS.red);
  const entries = normalizeEntries(item.values);
  const groups = groupByLabel(entries);

  const width = getRequestedWidth(toolRuntimeConfig, 1000);
  const height = Math.round(width * 0.57);
  const marginTop = 100;
  const marginRight = 40;
  const marginBottom = 118;
  const marginLeft = 70;
  const chartLeft = marginLeft;
  const chartTop = marginTop;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;
  const chartRight = chartLeft + chartWidth;

  const domain = computeYDomain(chartType, groups);
  const title = escapeXml(item.title || "Sans titre");
  const subtitle = escapeXml(item.subtitle || "");
  const source = escapeXml(item.source || "");

  const grid = renderGrid({
    domainMin: domain.min,
    domainMax: domain.max,
    chartTop,
    chartHeight,
    chartLeft,
    chartRight
  });

  const bars = renderBars({
    chartType,
    groups,
    chartLeft,
    chartTop,
    chartWidth,
    chartHeight,
    domainMin: domain.min,
    domainMax: domain.max,
    positiveColor,
    negativeColor
  });

  const legend = renderLegend({
    chartType,
    entries,
    positiveColor,
    negativeColor,
    width,
    y: height - 48
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
<style>
text { font-family: ${fontFamily}; }
</style>
<rect x="0" y="0" width="${width}" height="${height}" fill="#FFFFFF" />
<text x="70" y="34" font-size="32" font-weight="600" fill="${CDF_COLORS.dark}">${title}</text>
<text x="70" y="64" font-size="18" fill="${CDF_COLORS.axis}">${subtitle}</text>
<text x="70" y="86" font-size="14" fill="${CDF_COLORS.axis}">${source}</text>
${grid}
${bars}
${legend}
</svg>`;
}

function getMarkup(item, toolRuntimeConfig) {
  const svg = buildSvg(item, toolRuntimeConfig);
  return `<figure class="cdf-chart">${svg}</figure>`;
}

function getStyles() {
  return `
    .cdf-chart {
      margin: 0;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e2e6ea;
      box-sizing: border-box;
    }
    .cdf-chart svg {
      display: block;
      width: 100%;
      height: auto;
    }
  `;
}

function renderPng(item, toolRuntimeConfig) {
  const svg = buildSvg(item, toolRuntimeConfig);
  const pngWidth = getRequestedWidth(toolRuntimeConfig, 1600);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: pngWidth
    },
    font: {
      loadSystemFonts: true
    }
  });
  return resvg.render().asPng();
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: TOOL_NAME });
});

app.get("/schema.json", (req, res) => {
  res.json(getDefaultSchema());
});

app.post("/schema.json", (req, res) => {
  if (req.body?.customSchema) {
    res.json(req.body.customSchema);
    return;
  }
  res.json(getDefaultSchema());
});

app.post("/rendering-info", (req, res) => {
  const item = req.body?.item || {};
  const toolRuntimeConfig = req.body?.toolRuntimeConfig || null;
  res.json({
    markup: getMarkup(item, toolRuntimeConfig),
    stylesheets: [{ content: getStyles() }]
  });
});

app.post("/rendering-image.png", (req, res) => {
  const item = req.body?.item || {};
  const toolRuntimeConfig = req.body?.toolRuntimeConfig || null;
  const pngBuffer = renderPng(item, toolRuntimeConfig);
  res.set("content-type", "image/png");
  res.send(Buffer.from(pngBuffer));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`q-poc-tool listening on http://0.0.0.0:${PORT}`);
});
