const crypto = require("node:crypto");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const Nano = require("nano");

const PORT = Number(process.env.PORT || 3001);
const COUCH_URL =
  process.env.COUCH_URL || "http://admin:password@couchdb:5984";
const COUCH_DB = process.env.COUCH_DB || "q_items";
const TOOL_NAME = process.env.TOOL_NAME || "simple-bars";
const TOOL_BASE_URL = process.env.TOOL_BASE_URL || "http://tool-basic:4000";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:8080";
const SESSION_SECRET = process.env.SESSION_SECRET || "q-poc-dev-secret";
const SEED_EXAMPLE_ITEM = process.env.SEED_EXAMPLE_ITEM !== "false";

const nano = Nano(COUCH_URL);
const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === ALLOWED_ORIGIN) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true
  })
);
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
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
  fr: { [TOOL_NAME]: "Barres simples" },
  de: { [TOOL_NAME]: "Einfache Balken" },
  en: { [TOOL_NAME]: "Simple Bars" }
};

const toolLocaleByLang = {
  fr: {
    title: "Titre",
    subtitle: "Sous-titre",
    values: "Valeurs",
    label: "Libelle",
    value: "Valeur",
    color: "Couleur"
  },
  de: {
    title: "Titel",
    subtitle: "Untertitel",
    values: "Werte",
    label: "Bezeichnung",
    value: "Wert",
    color: "Farbe"
  },
  en: {
    title: "Title",
    subtitle: "Subtitle",
    values: "Values",
    label: "Label",
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
  try {
    await nano.db.get(COUCH_DB);
  } catch (error) {
    if (error.statusCode === 404) {
      await nano.db.create(COUCH_DB);
    } else {
      throw error;
    }
  }

  db = nano.db.use(COUCH_DB);
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
  const item = {
    _id: `sample-${Date.now()}`,
    title: "Nombre de cas traites",
    subtitle: "POC Q - graphique barres",
    tool: TOOL_NAME,
    values: [
      { label: "2020", value: 18, color: "#274f8a" },
      { label: "2021", value: 31, color: "#274f8a" },
      { label: "2022", value: 24, color: "#e05b4f" },
      { label: "2023", value: 38, color: "#274f8a" },
      { label: "2024", value: 41, color: "#e05b4f" }
    ],
    active: true,
    department: "CDF",
    publication: "cdf",
    acronym: "CDF",
    createdBy: "demo-user",
    createdDate: date,
    updatedBy: "demo-user",
    updatedDate: date
  };

  await db.insert(item);
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
  return [
    {
      key: "web",
      label: "web",
      context: {
        background: { color: "#ffffff" }
      },
      preview: {
        background: { color: "#ffffff" }
      },
      userExportable: {
        buttonLabel: "Exporter HTML",
        modalTitle: "Exporter",
        proceedText: "Confirmer",
        cancelText: "Annuler",
        previewTarget: "web"
      }
    }
  ];
}

function buildTools() {
  return [
    {
      name: TOOL_NAME,
      icon: "bar_chart"
    }
  ];
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
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
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

app.get("/editor/tools-ordered-by-user-usage", requireAuth, (req, res) => {
  res.json([TOOL_NAME]);
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
  if (req.params.tool !== TOOL_NAME) {
    res.status(404).json({ error: "unknown tool" });
    return;
  }
  const lang = getRequestedLang(req.params.lng);
  res.json(toolLocaleByLang[lang]);
});

app.get("/tools/:tool/schema.json", async (req, res, next) => {
  try {
    if (req.params.tool !== TOOL_NAME) {
      res.status(404).json({ error: "unknown tool" });
      return;
    }
    const schema = await fetchToolSchema();
    res.json(schema);
  } catch (error) {
    next(error);
  }
});

app.post("/tools/:tool/schema.json", async (req, res, next) => {
  try {
    if (req.params.tool !== TOOL_NAME) {
      res.status(404).json({ error: "unknown tool" });
      return;
    }
    const schema = await fetchToolSchema(req.body);
    res.json(schema);
  } catch (error) {
    next(error);
  }
});

app.get("/item/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await db.get(req.params.id);
    res.json(doc);
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: "item not found" });
      return;
    }
    next(error);
  }
});

app.post("/item", requireAuth, async (req, res, next) => {
  try {
    const user = getSessionUser(req);
    const now = nowIso();
    const payload = req.body || {};

    const item = {
      ...payload,
      _id: payload._id || crypto.randomUUID(),
      createdDate: payload.createdDate || now,
      createdBy: payload.createdBy || user.username,
      updatedDate: now,
      updatedBy: user.username,
      tool: payload.tool || TOOL_NAME,
      department: payload.department || user.department,
      publication: payload.publication || user.publication,
      acronym: payload.acronym || user.acronym
    };

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

app.put("/item", requireAuth, async (req, res, next) => {
  try {
    const user = getSessionUser(req);
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
    const item = {
      ...payload,
      updatedDate: now,
      updatedBy: user.username
    };

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

app.get("/search", requireAuth, async (req, res, next) => {
  try {
    const docs = await listAllDocs();

    const toolFilter = parseToolFilter(req.query.tool);
    const createdByFilter = req.query.createdBy;
    const departmentFilter = req.query.department;
    const publicationFilter = req.query.publication;
    const activeFilter = parseBooleanFilter(req.query.active);
    const searchString = String(req.query.searchString || "")
      .trim()
      .toLowerCase();

    const filteredDocs = docs
      .filter((doc) => {
        if (toolFilter && toolFilter.length > 0 && !toolFilter.includes(doc.tool)) {
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
            doc.tool,
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
      .sort((a, b) => getSortDate(b) - getSortDate(a));

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

app.get("/statistics/number-of-items/:fromTs?", requireAuth, async (req, res, next) => {
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

app.get("/display-options-schema/:id/:target.json", requireAuth, (req, res) => {
  res.json({
    title: "Export options",
    type: "object",
    properties: {}
  });
});

app.get("/rendering-info/:id/:target", requireAuth, async (req, res, next) => {
  try {
    const item = await db.get(req.params.id);
    const toolRuntimeConfigRaw = req.query.toolRuntimeConfig;
    let toolRuntimeConfig = null;
    if (toolRuntimeConfigRaw) {
      try {
        toolRuntimeConfig = JSON.parse(toolRuntimeConfigRaw);
      } catch (error) {
        toolRuntimeConfig = null;
      }
    }

    const renderingInfo = await fetchRenderingInfo({
      item,
      target: req.params.target,
      toolRuntimeConfig
    });
    res.json(renderingInfo);
  } catch (error) {
    next(error);
  }
});

app.post("/rendering-info/:target", requireAuth, async (req, res, next) => {
  try {
    const item = req.body?.item || {};
    if (!item.tool) {
      item.tool = TOOL_NAME;
    }

    const renderingInfo = await fetchRenderingInfo({
      item,
      target: req.params.target,
      toolRuntimeConfig: req.body?.toolRuntimeConfig || null
    });
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
