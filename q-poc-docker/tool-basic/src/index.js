const express = require("express");

const PORT = Number(process.env.PORT || 4000);
const TOOL_NAME = process.env.TOOL_NAME || "simple-bars";

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

function normalizeValue(rawValue) {
  const parsed = Number(rawValue);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function normalizeColor(rawColor) {
  const fallback = "#274f8a";
  if (typeof rawColor !== "string") {
    return fallback;
  }
  const trimmed = rawColor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

function getDefaultSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    title: "Simple Bars",
    properties: {
      title: {
        type: "string",
        title: "Titre",
        default: "Exemple de graphique"
      },
      subtitle: {
        type: "string",
        title: "Sous-titre",
        default: "POC Q editor + Q server + tool"
      },
      values: {
        type: "array",
        title: "Valeurs",
        minItems: 1,
        default: [
          { label: "A", value: 15, color: "#274f8a" },
          { label: "B", value: 29, color: "#e05b4f" },
          { label: "C", value: 21, color: "#274f8a" }
        ],
        items: {
          type: "object",
          properties: {
            label: { type: "string", title: "Libelle", default: "" },
            value: { type: "number", title: "Valeur", default: 0 },
            color: { type: "string", title: "Couleur", default: "#274f8a" }
          },
          required: ["label", "value"]
        }
      }
    },
    required: ["title", "values"]
  };
}

function getMarkup(item) {
  const title = escapeHtml(item.title || "Sans titre");
  const subtitle = escapeHtml(item.subtitle || "");
  const values = Array.isArray(item.values) ? item.values : [];

  const normalized = values.map((entry) => ({
    label: escapeHtml(entry?.label || ""),
    value: normalizeValue(entry?.value),
    color: normalizeColor(entry?.color)
  }));

  const maxValue = Math.max(
    1,
    ...normalized.map((entry) => Math.abs(entry.value))
  );

  const bars = normalized
    .map((entry) => {
      const barHeight = Math.max(
        4,
        Math.round((Math.abs(entry.value) / maxValue) * 210)
      );
      return `<div class="q-poc-bar">
  <div class="q-poc-bar__value">${entry.value}</div>
  <div class="q-poc-bar__shape" style="height:${barHeight}px;background:${entry.color};"></div>
  <div class="q-poc-bar__label">${entry.label}</div>
</div>`;
    })
    .join("");

  const emptyState = `<div class="q-poc-empty">Aucune donnee.</div>`;

  return `<figure class="q-poc-chart">
  <header class="q-poc-header">
    <h3 class="q-poc-title">${title}</h3>
    <p class="q-poc-subtitle">${subtitle}</p>
  </header>
  <div class="q-poc-bars">${bars || emptyState}</div>
</figure>`;
}

function getStyles() {
  return `
    .q-poc-chart {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #222;
      background: #fff;
      border: 1px solid #e1e1e1;
      padding: 14px 16px 12px;
      box-sizing: border-box;
    }
    .q-poc-header {
      margin-bottom: 12px;
    }
    .q-poc-title {
      margin: 0 0 4px;
      font-size: 18px;
      line-height: 1.25;
    }
    .q-poc-subtitle {
      margin: 0;
      color: #5e5e5e;
      font-size: 13px;
      line-height: 1.3;
    }
    .q-poc-bars {
      min-height: 240px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #ececec;
    }
    .q-poc-bar {
      flex: 1;
      min-width: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .q-poc-bar__shape {
      width: 100%;
      max-width: 64px;
      min-height: 4px;
    }
    .q-poc-bar__label {
      font-size: 12px;
      color: #4d4d4d;
    }
    .q-poc-bar__value {
      font-size: 12px;
      color: #2a2a2a;
    }
    .q-poc-empty {
      color: #777;
      font-size: 13px;
      line-height: 1.4;
      padding: 12px 0;
    }
  `;
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
  res.json({
    markup: getMarkup(item),
    stylesheets: [{ content: getStyles() }]
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`q-poc-tool listening on http://0.0.0.0:${PORT}`);
});
