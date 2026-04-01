const crypto = require("node:crypto");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const Nano = require("nano");

const PORT = Number(process.env.PORT || 3001);
const COUCH_URL =
  process.env.COUCH_URL || "http://admin:password@couchdb:5984";
const COUCH_DB = process.env.COUCH_DB || "q_items";
const TOOL_BASE_URL = process.env.TOOL_BASE_URL || "http://tool-basic:4000";
const SESSION_SECRET = process.env.SESSION_SECRET || "q-poc-dev-secret";
const SEED_EXAMPLE_ITEM = process.env.SEED_EXAMPLE_ITEM !== "false";
const POC_LOCAL_RENDERING = process.env.POC_LOCAL_RENDERING !== "false";

const TOOL_VARIANTS = [
  {
    name: "cdf-stacked-columns",
    chartType: "stacked-columns",
    labels: {
      fr: "Colonnes empilees",
      de: "Gestapelte Saulen",
      en: "Stacked Columns"
    },
    icon:
      '<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="28" width="10" height="15" fill="#9FA3A7"/><rect x="9" y="20" width="10" height="8" fill="#274F8A"/><rect x="9" y="14" width="10" height="6" fill="#E05B4F"/><rect x="22" y="24" width="10" height="19" fill="#9FA3A7"/><rect x="22" y="12" width="10" height="12" fill="#274F8A"/><rect x="22" y="6" width="10" height="6" fill="#E05B4F"/><rect x="35" y="31" width="10" height="12" fill="#9FA3A7"/><rect x="35" y="18" width="10" height="13" fill="#274F8A"/><rect x="35" y="10" width="10" height="8" fill="#E05B4F"/></svg>'
  },
  {
    name: "cdf-plus-minus-columns",
    chartType: "plus-minus-columns",
    labels: {
      fr: "Colonnes +/-",
      de: "Plus/Minus Saulen",
      en: "Plus/Minus Columns"
    },
    icon:
      '<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><line x1="7" y1="26" x2="45" y2="26" stroke="#8E98A3" stroke-width="1.6"/><rect x="10" y="12" width="10" height="14" fill="#274F8A"/><rect x="22" y="26" width="10" height="11" fill="#E05B4F"/><rect x="34" y="8" width="10" height="18" fill="#274F8A"/></svg>'
  },
  {
    name: "cdf-bars",
    chartType: "bars",
    labels: {
      fr: "Barres verticales",
      de: "Senkrechte Balken",
      en: "Vertical Bars"
    },
    icon:
      '<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="25" width="8" height="18" fill="#274F8A"/><rect x="21" y="18" width="8" height="25" fill="#E05B4F"/><rect x="33" y="11" width="8" height="32" fill="#274F8A"/></svg>'
  }
];

const LEGACY_TOOL_ALIASES = new Map([["simple-bars", "cdf-stacked-columns"]]);
const TOOL_BY_NAME = new Map(TOOL_VARIANTS.map((tool) => [tool.name, tool]));
const DEFAULT_TOOL_NAME = TOOL_VARIANTS[0].name;
const FALLBACK_EMPTY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9Ww0m2EAAAAASUVORK5CYII=",
  "base64"
);

const nano = Nano(COUCH_URL);
const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // POC: allow all origins to avoid local hostname mismatches.
      callback(null, true);
    },
    credentials: true
  })
);
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // eslint-disable-next-line no-console
    console.log(
      `[http] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});
app.use(
  session({
    name: "q-poc.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

let db;

const baseTranslations = {
  general: {
    createLabel: "Choisir un modele de graphique",
    searchEditLabel: "Versions sauvegardees",
    showAllTools: "Afficher toutes les variantes",
    showLessTools: "Afficher uniquement les principales",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    login: "Connexion",
    mslogin: "Connexion Microsoft",
    loginFailed: "Connexion echouee",
    loginFailedGeneric: "Connexion impossible",
    loginTimeout: "Serveur indisponible",
    genericServerError: "Erreur serveur",
    loginTechnicalIssues: "Probleme technique.",
    loginContactUsOnSlack: "Contact Slack",
    created: "Cree",
    edited: "Modifie",
    by: "par"
  },
  itemsFilter: {
    allGraphics: "Tous les graphiques",
    byAll: "Tous",
    byMe: "Par moi",
    allDepartments: "Tous les services",
    myDepartment: "Mon service",
    allStates: "Tous les etats",
    onlyActive: "Actifs",
    onlyInactive: "Inactifs",
    allPublications: "Toutes les publications"
  },
  notifications: {
    failedLoadingItems: "Impossible de charger les elements.",
    failedLoadingEditorConfig: "Impossible de charger la configuration."
  },
  item: {
    active: "Actif",
    inactive: "Inactif",
    edit: "Modifier",
    activate: "Activer",
    deactivate: "Desactiver",
    blueprint: "Dupliquer",
    delete: "Supprimer",
    blueprintTitlePrefix: "Copie"
  },
  editor: {
    activatingEditorTakesTooLong: "Ouverture trop longue.",
    noAutosaveBecauseActive: "Autosave desactive pour un element actif.",
    questionLeaveWithUnsavedChanges: "Quitter sans enregistrer ?",
    questionLeaveWithUnsavedChangesSub:
      "Les changements non enregistres seront perdus.",
    failedToSave: "Enregistrement impossible.",
    conflictOnSave: "Conflit de sauvegarde."
  },
  preview: {
    title: "Modifier ton graphique",
    small: "Petit",
    medium: "Moyen",
    large: "Grand",
    sizeLabel: "Taille",
    error: "Le graphique ne peut pas etre affiche"
  }
};

const translationsByLang = {
  fr: baseTranslations,
  de: {
    ...baseTranslations,
    general: {
      ...baseTranslations.general,
      login: "Anmelden",
      loginFailed: "Anmeldung fehlgeschlagen"
    }
  },
  en: {
    ...baseTranslations,
    general: {
      ...baseTranslations.general,
      login: "Login",
      loginFailed: "Login failed"
    }
  }
};

const toolNamesByLang = {
  fr: {},
  de: {},
  en: {}
};

for (const tool of TOOL_VARIANTS) {
  toolNamesByLang.fr[tool.name] = tool.labels.fr;
  toolNamesByLang.de[tool.name] = tool.labels.de;
  toolNamesByLang.en[tool.name] = tool.labels.en;
}

toolNamesByLang.fr["simple-bars"] = toolNamesByLang.fr["cdf-stacked-columns"];
toolNamesByLang.de["simple-bars"] = toolNamesByLang.de["cdf-stacked-columns"];
toolNamesByLang.en["simple-bars"] = toolNamesByLang.en["cdf-stacked-columns"];

const toolLocaleByLang = {
  fr: {
    chartType: "Type de graphique",
    title: "Titre",
    subtitle: "Sous-titre",
    source: "Source",
    fontFamily: "Police",
    positiveColor: "Couleur positive",
    negativeColor: "Couleur negative",
    values: "Valeurs",
    label: "Libelle",
    series: "Serie",
    value: "Valeur",
    color: "Couleur"
  },
  de: {
    chartType: "Diagrammtyp",
    title: "Titel",
    subtitle: "Untertitel",
    source: "Quelle",
    fontFamily: "Schriftart",
    positiveColor: "Positive Farbe",
    negativeColor: "Negative Farbe",
    values: "Werte",
    label: "Bezeichnung",
    series: "Serie",
    value: "Wert",
    color: "Farbe"
  },
  en: {
    chartType: "Chart type",
    title: "Title",
    subtitle: "Subtitle",
    source: "Source",
    fontFamily: "Font family",
    positiveColor: "Positive color",
    negativeColor: "Negative color",
    values: "Values",
    label: "Label",
    series: "Series",
    value: "Value",
    color: "Color"
  }
};

function nowIso() {
  return new Date().toISOString();
}

function getRequestedLang(rawLang) {
  if (rawLang && translationsByLang[rawLang]) {
    return rawLang;
  }
  return "fr";
}

function getSessionUser(req) {
  return req.session.user || null;
}

function getEffectiveUser(req) {
  return getSessionUser(req) || buildDefaultUser("demo-user");
}

function normalizeToolName(rawToolName) {
  if (TOOL_BY_NAME.has(rawToolName)) {
    return rawToolName;
  }
  if (LEGACY_TOOL_ALIASES.has(rawToolName)) {
    return LEGACY_TOOL_ALIASES.get(rawToolName);
  }
  return DEFAULT_TOOL_NAME;
}

function getToolVariant(rawToolName) {
  return TOOL_BY_NAME.get(normalizeToolName(rawToolName));
}

function isKnownTool(rawToolName) {
  if (TOOL_BY_NAME.has(rawToolName)) {
    return true;
  }
  return LEGACY_TOOL_ALIASES.has(rawToolName);
}

function withToolDefaults(itemInput = {}, rawToolName = undefined) {
  const variant = getToolVariant(rawToolName || itemInput.tool);
  const normalizedToolName = variant?.name || DEFAULT_TOOL_NAME;

  return {
    ...itemInput,
    tool: normalizedToolName,
    chartType: itemInput.chartType || variant?.chartType || "stacked-columns",
    fontFamily: itemInput.fontFamily || "Frutiger, Arial, sans-serif",
    positiveColor: itemInput.positiveColor || "#274F8A",
    negativeColor: itemInput.negativeColor || "#E05B4F"
  };
}

function escapeHtml(input) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildDefaultUser(username) {
  return {
    username,
    roles: ["user", "expert", "poweruser"],
    department: "CDF",
    publication: "cdf",
    acronym: "CDF",
    config: {}
  };
}

function requireAuth(req, res, next) {
  if (!getSessionUser(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

async function ensureDatabase() {
  const maxAttempts = 30;
  const waitMs = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await nano.db.get(COUCH_DB);
      db = nano.db.use(COUCH_DB);
      return;
    } catch (error) {
      if (error.statusCode === 404) {
        await nano.db.create(COUCH_DB);
        db = nano.db.use(COUCH_DB);
        return;
      }

      const transientConnectionError =
        error.code === "ECONNREFUSED" ||
        String(error.message || "").includes("ECONNREFUSED");

      if (!transientConnectionError || attempt === maxAttempts) {
        throw error;
      }

      // eslint-disable-next-line no-console
      console.log(
        `waiting for CouchDB (${attempt}/${maxAttempts}) before retry...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

async function listAllDocs() {
  const result = await db.list({ include_docs: true });
  return result.rows
    .map((row) => row.doc)
    .filter((doc) => doc && doc._id && !doc._deleted);
}

async function ensureExampleItem() {
  if (!SEED_EXAMPLE_ITEM) {
    return;
  }

  const docs = await listAllDocs();
  if (docs.length > 0) {
    return;
  }

  const date = nowIso();
  const sharedMeta = {
    subtitle: "POC Q - integration modeles CDF",
    source: "SOURCE : CDF",
    fontFamily: "Frutiger, Arial, sans-serif",
    positiveColor: "#274F8A",
    negativeColor: "#E05B4F",
    active: true,
    department: "CDF",
    publication: "cdf",
    acronym: "CDF",
    createdBy: "demo-user",
    createdDate: date,
    updatedBy: "demo-user",
    updatedDate: date
  };

  const samples = [
    {
      _id: `sample-${Date.now()}-stacked`,
      title: "Nombre de cas traites de lanceurs d'alerte 2015-2024",
      tool: "cdf-stacked-columns",
      chartType: "stacked-columns",
      values: [
        { label: "2020", series: "Employes", value: 311, color: "#9FA3A7" },
        { label: "2020", series: "Externes", value: 96, color: "#274F8A" },
        { label: "2020", series: "Annonces", value: 77, color: "#E05B4F" },
        { label: "2021", series: "Employes", value: 229, color: "#9FA3A7" },
        { label: "2021", series: "Externes", value: 95, color: "#274F8A" },
        { label: "2021", series: "Annonces", value: 78, color: "#E05B4F" },
        { label: "2022", series: "Employes", value: 47, color: "#9FA3A7" },
        { label: "2022", series: "Externes", value: 132, color: "#274F8A" },
        { label: "2022", series: "Annonces", value: 100, color: "#E05B4F" },
        { label: "2023", series: "Employes", value: 22, color: "#9FA3A7" },
        { label: "2023", series: "Externes", value: 225, color: "#274F8A" },
        { label: "2023", series: "Annonces", value: 125, color: "#E05B4F" },
        { label: "2024", series: "Employes", value: 10, color: "#9FA3A7" },
        { label: "2024", series: "Externes", value: 252, color: "#274F8A" },
        { label: "2024", series: "Annonces", value: 113, color: "#E05B4F" }
      ]
    },
    {
      _id: `sample-${Date.now()}-plusminus`,
      title: "Solde du compte de resultats de la Confederation",
      tool: "cdf-plus-minus-columns",
      chartType: "plus-minus-columns",
      values: [
        { label: "2018", series: "Solde", value: 5701, color: "#274F8A" },
        { label: "2019", series: "Solde", value: 5953, color: "#274F8A" },
        { label: "2020", series: "Solde", value: -16858, color: "#E05B4F" },
        { label: "2021", series: "Solde", value: -9716, color: "#E05B4F" },
        { label: "2022", series: "Solde", value: -2396, color: "#E05B4F" },
        { label: "2023", series: "Solde", value: 877, color: "#274F8A" }
      ]
    },
    {
      _id: `sample-${Date.now()}-bars`,
      title: "Cas traites par annee (barres)",
      tool: "cdf-bars",
      chartType: "bars",
      values: [
        { label: "2019", series: "Cas", value: 122, color: "#274F8A" },
        { label: "2020", series: "Cas", value: 187, color: "#274F8A" },
        { label: "2021", series: "Cas", value: 484, color: "#274F8A" },
        { label: "2022", series: "Cas", value: 279, color: "#E05B4F" },
        { label: "2023", series: "Cas", value: 372, color: "#274F8A" },
        { label: "2024", series: "Cas", value: 375, color: "#E05B4F" }
      ]
    }
  ];

  for (const sample of samples) {
    await db.insert({
      ...sharedMeta,
      ...sample
    });
  }
}

function parseBooleanFilter(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}

function parseToolFilter(rawValue) {
  if (!rawValue) {
    return null;
  }

  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // ignore and fallback to comma-separated value
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBookmark(rawBookmark) {
  const parsed = Number(rawBookmark || 0);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function getSortDate(doc) {
  const updatedDate = Date.parse(doc.updatedDate || "");
  if (!Number.isNaN(updatedDate)) {
    return updatedDate;
  }

  const createdDate = Date.parse(doc.createdDate || "");
  if (!Number.isNaN(createdDate)) {
    return createdDate;
  }

  return 0;
}

function buildEditorConfig() {
  return {
    auth: {
      type: "cookie",
      isLD: true
    },
    languages: [
      { key: "fr", label: "fr" },
      { key: "de", label: "de" }
    ],
    publications: [],
    departments: ["CDF"],
    lowNewItems: {
      threshold: 0,
      days: 7
    },
    itemList: {
      itemsPerLoad: 18
    },
    stylesheets: [],
    previewSizes: {
      small: {
        value: 360,
        label_locales: { fr: "Mobile", de: "Mobile", en: "Mobile" }
      },
      medium: {
        value: 760,
        label_locales: { fr: "Desktop", de: "Desktop", en: "Desktop" }
      },
      large: {
        value: 1200,
        label_locales: { fr: "Large", de: "Large", en: "Large" }
      }
    }
  };
}

function buildTargets() {
  const webTarget = {
    key: "web",
    label: "web",
    context: {
      background: { color: "#ffffff" }
    },
    preview: {
      background: { color: "#ffffff" }
    },
    userExportable: false
  };

  const webTargetCloneForPreview = JSON.parse(JSON.stringify(webTarget));

  return [
    webTarget,
    {
      key: "export-png",
      label: "export-png",
      modalTitle: "Exporter PNG",
      proceedText: "Telecharger",
      cancelText: "Fermer",
      context: {
        background: { color: "#ffffff" }
      },
      preview: {
        background: { color: "#ffffff" }
      },
      userExportable: {
        buttonLabel: "PNG",
        onlyTools: TOOL_VARIANTS.map((tool) => tool.name),
        preview: {
          target: "web"
        },
        previewTarget: webTargetCloneForPreview,
        download: {
          file: {
            nameMaxLength: 120
          }
        }
      }
    }
  ];
}

function buildTools() {
  return TOOL_VARIANTS.map((tool) => ({
    name: tool.name,
    icon: tool.icon
  }));
}

function buildFallbackToolSchema(variant) {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    title: "Modeles graphiques CDF",
    properties: {
      chartType: {
        type: "string",
        title: "Type de graphique",
        enum: ["stacked-columns", "plus-minus-columns", "bars"],
        default: variant.chartType
      },
      title: {
        type: "string",
        title: "Titre",
        default: variant.labels.fr
      },
      subtitle: {
        type: "string",
        title: "Sous-titre",
        default: "SOURCE : CDF"
      },
      source: {
        type: "string",
        title: "Source",
        default: "SOURCE : CDF"
      },
      fontFamily: {
        type: "string",
        title: "Police",
        default: "Frutiger, Arial, sans-serif"
      },
      positiveColor: {
        type: "string",
        title: "Couleur positive",
        default: "#274F8A"
      },
      negativeColor: {
        type: "string",
        title: "Couleur negative",
        default: "#E05B4F"
      },
      values: {
        type: "array",
        title: "Valeurs",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            label: { type: "string", title: "Libelle", default: "" },
            series: { type: "string", title: "Serie", default: "Serie 1" },
            value: { type: "number", title: "Valeur", default: 0 },
            color: { type: "string", title: "Couleur", default: "#274F8A" }
          },
          required: ["label", "value"]
        },
        default: [
          { label: "2021", series: "Serie 1", value: 20, color: "#274F8A" },
          { label: "2022", series: "Serie 1", value: 28, color: "#E05B4F" },
          { label: "2023", series: "Serie 1", value: 17, color: "#274F8A" }
        ]
      }
    },
    required: ["chartType", "title", "values"]
  };
}

function decorateSchemaForVariant(schemaInput, variant) {
  const schema = JSON.parse(JSON.stringify(schemaInput || {}));
  if (!schema.properties) {
    schema.properties = {};
  }

  if (!schema.properties.chartType) {
    schema.properties.chartType = {
      type: "string",
      enum: ["stacked-columns", "plus-minus-columns", "bars"]
    };
  }

  schema.properties.chartType.default = variant.chartType;
  if (schema.properties.title && !schema.properties.title.default) {
    schema.properties.title.default = variant.labels.fr;
  }
  if (schema.properties.fontFamily && !schema.properties.fontFamily.default) {
    schema.properties.fontFamily.default = "Frutiger, Arial, sans-serif";
  }

  return schema;
}

function buildFallbackRenderingInfo(itemInput) {
  const item = withToolDefaults(itemInput);
  const title = escapeHtml(item.title || "Apercu du graphique");
  const subtitle = escapeHtml(item.subtitle || "");
  const source = escapeHtml(item.source || "");

  return {
    markup: `<div class="q-fallback-preview">
<h3>${title}</h3>
<p>${subtitle}</p>
<small>${source}</small>
</div>`,
    stylesheets: [
      {
        content: ".q-fallback-preview{font-family:Frutiger,Arial,sans-serif;padding:20px;color:#1F2A37}.q-fallback-preview h3{margin:0 0 8px;font-size:20px}.q-fallback-preview p{margin:0 0 8px;color:#4A5A6B}.q-fallback-preview small{color:#6C7884}"
      }
    ]
  };
}

async function fetchToolSchema(payload = null) {
  const options = {
    method: payload ? "POST" : "GET",
    headers: {
      "content-type": "application/json"
    }
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`${TOOL_BASE_URL}/schema.json`, options);
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Tool schema failed (${response.status}): ${responseText || "no body"}`
    );
  }

  return response.json();
}

async function fetchRenderingInfo({ item, target, toolRuntimeConfig }) {
  const response = await fetch(`${TOOL_BASE_URL}/rendering-info`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      item,
      target,
      toolRuntimeConfig
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Tool rendering failed (${response.status}): ${responseText || "no body"}`
    );
  }

  return response.json();
}

async function fetchRenderingPng({ item, target, toolRuntimeConfig }) {
  const response = await fetch(`${TOOL_BASE_URL}/rendering-image.png`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      item,
      target,
      toolRuntimeConfig
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Tool png rendering failed (${response.status}): ${
        responseText || "no body"
      }`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    type: response.headers.get("content-type") || "image/png",
    buffer
  };
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "q-poc-server"
  });
});

app.post("/authenticate", (req, res) => {
  const username = String(req.body?.username || "").trim() || "demo-user";
  req.session.user = buildDefaultUser(username);
  res.json({ ok: true, username });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/user", (req, res) => {
  const user = getEffectiveUser(req);
  if (!getSessionUser(req)) {
    req.session.user = user;
  }
  res.json(user);
});

app.put("/user", requireAuth, (req, res) => {
  const currentUser = getSessionUser(req);
  const updatedUser = {
    ...currentUser,
    ...req.body,
    username: currentUser.username
  };
  req.session.user = updatedUser;
  res.json(updatedUser);
});

app.get("/editor/config", (req, res) => {
  res.json(buildEditorConfig());
});

app.get("/editor/targets", (req, res) => {
  res.json(buildTargets());
});

app.get("/editor/tools", (req, res) => {
  res.json(buildTools());
});

app.get("/editor/tools-ordered-by-user-usage", (req, res) => {
  res.json(TOOL_VARIANTS.map((tool) => tool.name));
});

app.get("/editor/locales/:lng/translation.json", (req, res) => {
  const lang = getRequestedLang(req.params.lng);
  res.json(translationsByLang[lang]);
});

app.get("/editor/tools/locales/:lng/translation.json", (req, res) => {
  const lang = getRequestedLang(req.params.lng);
  res.json(toolNamesByLang[lang]);
});

app.get("/tools/:tool/locales/:lng/translation.json", (req, res) => {
  if (!isKnownTool(req.params.tool)) {
    res.status(404).json({ error: "unknown tool" });
    return;
  }
  const lang = getRequestedLang(req.params.lng);
  res.json(toolLocaleByLang[lang]);
});

app.get("/tools/:tool/schema.json", async (req, res, next) => {
  try {
    if (!isKnownTool(req.params.tool)) {
      res.status(404).json({ error: "unknown tool" });
      return;
    }
    const variant = getToolVariant(req.params.tool);
    if (POC_LOCAL_RENDERING) {
      res.json(buildFallbackToolSchema(variant));
      return;
    }
    try {
      const schema = await fetchToolSchema();
      res.json(decorateSchemaForVariant(schema, variant));
    } catch (toolError) {
      res.json(buildFallbackToolSchema(variant));
    }
  } catch (error) {
    next(error);
  }
});

app.post("/tools/:tool/schema.json", async (req, res, next) => {
  try {
    if (!isKnownTool(req.params.tool)) {
      res.status(404).json({ error: "unknown tool" });
      return;
    }
    const variant = getToolVariant(req.params.tool);
    if (POC_LOCAL_RENDERING) {
      res.json(buildFallbackToolSchema(variant));
      return;
    }
    try {
      const schema = await fetchToolSchema(req.body);
      res.json(decorateSchemaForVariant(schema, variant));
    } catch (toolError) {
      res.json(buildFallbackToolSchema(variant));
    }
  } catch (error) {
    next(error);
  }
});

app.get("/item/:id", async (req, res, next) => {
  try {
    const doc = await db.get(req.params.id);
    res.json(withToolDefaults(doc));
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: "item not found" });
      return;
    }
    next(error);
  }
});

app.post("/item", async (req, res, next) => {
  try {
    const user = getEffectiveUser(req);
    const now = nowIso();
    const payload = req.body || {};

    const item = withToolDefaults({
      ...payload,
      _id: payload._id || crypto.randomUUID(),
      createdDate: payload.createdDate || now,
      createdBy: payload.createdBy || user.username,
      updatedDate: now,
      updatedBy: user.username,
      department: payload.department || user.department,
      publication: payload.publication || user.publication,
      acronym: payload.acronym || user.acronym
    });

    if (typeof item.active !== "boolean") {
      item.active = false;
    }

    const result = await db.insert(item);
    res.json({
      _id: result.id,
      _rev: result.rev
    });
  } catch (error) {
    next(error);
  }
});

app.put("/item", async (req, res, next) => {
  try {
    const user = getEffectiveUser(req);
    const payload = req.body || {};

    if (!payload._id) {
      res.status(400).json({ error: "missing _id" });
      return;
    }

    if (payload._deleted === true) {
      let revision = payload._rev;
      if (!revision) {
        const existing = await db.get(payload._id);
        revision = existing._rev;
      }
      await db.destroy(payload._id, revision);
      res.json({
        _id: payload._id,
        _deleted: true
      });
      return;
    }

    const now = nowIso();
    const item = withToolDefaults({
      ...payload,
      updatedDate: now,
      updatedBy: user.username
    });

    const result = await db.insert(item);
    res.json({
      _id: result.id,
      _rev: result.rev,
      updatedDate: item.updatedDate,
      updatedBy: item.updatedBy
    });
  } catch (error) {
    next(error);
  }
});

app.get("/search", async (req, res, next) => {
  try {
    const docs = await listAllDocs();

    const rawToolFilter = parseToolFilter(req.query.tool);
    const toolFilter = rawToolFilter
      ? rawToolFilter.map((toolName) => normalizeToolName(toolName))
      : null;
    const createdByFilter = req.query.createdBy;
    const departmentFilter = req.query.department;
    const publicationFilter = req.query.publication;
    const activeFilter = parseBooleanFilter(req.query.active);
    const searchString = String(req.query.searchString || "")
      .trim()
      .toLowerCase();

    const filteredDocs = docs
      .filter((doc) => {
        const normalizedDocTool = normalizeToolName(doc.tool);
        if (
          toolFilter &&
          toolFilter.length > 0 &&
          !toolFilter.includes(normalizedDocTool)
        ) {
          return false;
        }
        if (createdByFilter && doc.createdBy !== createdByFilter) {
          return false;
        }
        if (departmentFilter && doc.department !== departmentFilter) {
          return false;
        }
        if (publicationFilter && doc.publication !== publicationFilter) {
          return false;
        }
        if (activeFilter !== null && Boolean(doc.active) !== activeFilter) {
          return false;
        }
        if (searchString) {
          const haystack = [
            doc.title,
            doc.subtitle,
            normalizedDocTool,
            doc.department,
            doc.acronym
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(searchString)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => getSortDate(b) - getSortDate(a))
      .map((doc) => withToolDefaults(doc));

    const limit = Math.max(1, Number(req.query.limit || 18));
    const offset = parseBookmark(req.query.bookmark);
    const pagedDocs = filteredDocs.slice(offset, offset + limit);
    const nextBookmark =
      offset + limit < filteredDocs.length ? String(offset + limit) : null;

    res.json({
      docs: pagedDocs,
      bookmark: nextBookmark
    });
  } catch (error) {
    next(error);
  }
});

app.get("/statistics/number-of-items/:fromTs?", async (req, res, next) => {
  try {
    const docs = await listAllDocs();
    const fromTs = req.params.fromTs ? Number(req.params.fromTs) : null;

    const value = docs.filter((doc) => {
      if (!doc.active) {
        return false;
      }
      if (fromTs === null || Number.isNaN(fromTs)) {
        return true;
      }
      const createdDate = Date.parse(doc.createdDate || "");
      if (Number.isNaN(createdDate)) {
        return false;
      }
      return createdDate >= fromTs;
    }).length;

    res.json({ value });
  } catch (error) {
    next(error);
  }
});

app.get("/display-options-schema/:id/:target.json", (req, res) => {
  if (req.params.target === "export-png") {
    res.json({
      title: "PNG options",
      type: "object",
      properties: {
        width: {
          type: "integer",
          title: "Largeur PNG",
          minimum: 800,
          maximum: 3200,
          default: 1600
        },
        background: {
          type: "string",
          title: "Fond",
          default: "#ffffff"
        }
      }
    });
    return;
  }

  res.json({
    title: "Export options",
    type: "object",
    properties: {}
  });
});

app.get("/rendering-info/:id/:target", async (req, res, next) => {
  try {
    const itemDoc = await db.get(req.params.id);
    const item = withToolDefaults(itemDoc);
    const toolRuntimeConfigRaw = req.query.toolRuntimeConfig;
    let toolRuntimeConfig = null;
    if (toolRuntimeConfigRaw) {
      try {
        toolRuntimeConfig = JSON.parse(toolRuntimeConfigRaw);
      } catch (error) {
        toolRuntimeConfig = null;
      }
    }

    if (req.params.target === "export-png") {
      if (POC_LOCAL_RENDERING) {
        res.set("content-type", "image/png");
        res.send(FALLBACK_EMPTY_PNG);
      } else {
        try {
          const image = await fetchRenderingPng({
            item,
            target: req.params.target,
            toolRuntimeConfig
          });
          res.set("content-type", image.type);
          res.send(image.buffer);
        } catch (pngError) {
          res.set("content-type", "image/png");
          res.send(FALLBACK_EMPTY_PNG);
        }
      }
      return;
    }

    let renderingInfo = buildFallbackRenderingInfo(item);
    if (!POC_LOCAL_RENDERING) {
      try {
        renderingInfo = await fetchRenderingInfo({
          item,
          target: req.params.target,
          toolRuntimeConfig
        });
      } catch (toolError) {
        renderingInfo = buildFallbackRenderingInfo(item);
      }
    }
    res.json(renderingInfo);
  } catch (error) {
    next(error);
  }
});

app.post("/rendering-info/:target", async (req, res, next) => {
  try {
    const item = withToolDefaults(req.body?.item || {});

    const toolRuntimeConfig = req.body?.toolRuntimeConfig || null;

    if (req.params.target === "export-png") {
      if (POC_LOCAL_RENDERING) {
        res.set("content-type", "image/png");
        res.send(FALLBACK_EMPTY_PNG);
      } else {
        try {
          const image = await fetchRenderingPng({
            item,
            target: req.params.target,
            toolRuntimeConfig
          });
          res.set("content-type", image.type);
          res.send(image.buffer);
        } catch (pngError) {
          res.set("content-type", "image/png");
          res.send(FALLBACK_EMPTY_PNG);
        }
      }
      return;
    }

    let renderingInfo = buildFallbackRenderingInfo(item);
    if (!POC_LOCAL_RENDERING) {
      try {
        renderingInfo = await fetchRenderingInfo({
          item,
          target: req.params.target,
          toolRuntimeConfig
        });
      } catch (toolError) {
        renderingInfo = buildFallbackRenderingInfo(item);
      }
    }
    res.json(renderingInfo);
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res) => {
  res.json({
    service: "q-poc-server",
    status: "ok"
  });
});

app.use((error, req, res, next) => {
  const status = Number(error.statusCode || error.status || 500);
  const message = error.message || "unexpected error";
  res.status(status).json({ error: message });
});

async function start() {
  await ensureDatabase();
  await ensureExampleItem();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`q-poc-server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("failed to start q-poc-server", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  // eslint-disable-next-line no-console
  console.error("unhandledRejection", error);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("uncaughtException", error);
});
