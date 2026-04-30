// Legal content + acceptances. The disclosures and terms are seeded from the
// design's legal.jsx and exposed via /api/legal so the page (and any future
// admin editor) reads from a single source of truth.

const db = require('../db');

function rowToDoc(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    sectionNum: row.section_num,
    title: row.title,
    intro: row.intro,
    items: JSON.parse(row.content),
    version: row.version,
    docCode: row.doc_code,
    lastUpdated: row.last_updated,
    updatedAt: row.updated_at,
  };
}

function getDocument(slug) {
  return rowToDoc(db.prepare(`SELECT * FROM legal_documents WHERE slug = ?`).get(slug));
}

function listDocuments() {
  return db.prepare(`SELECT * FROM legal_documents ORDER BY section_num`).all().map(rowToDoc);
}

function upsertDocument(doc) {
  const required = ['slug', 'title', 'sectionNum', 'items', 'version', 'lastUpdated'];
  for (const k of required) {
    if (doc[k] === undefined || doc[k] === null) throw new Error(`legal: ${k} is required`);
  }
  if (!Array.isArray(doc.items)) throw new Error('legal: items must be an array');

  db.prepare(`
    INSERT INTO legal_documents (slug, title, intro, section_num, content, version, doc_code, last_updated, updated_at)
    VALUES (@slug, @title, @intro, @sectionNum, @content, @version, @docCode, @lastUpdated, datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      intro = excluded.intro,
      section_num = excluded.section_num,
      content = excluded.content,
      version = excluded.version,
      doc_code = excluded.doc_code,
      last_updated = excluded.last_updated,
      updated_at = datetime('now')
  `).run({
    slug: doc.slug,
    title: doc.title,
    intro: doc.intro || null,
    sectionNum: doc.sectionNum,
    content: JSON.stringify(doc.items),
    version: doc.version,
    docCode: doc.docCode || null,
    lastUpdated: doc.lastUpdated,
  });
  return getDocument(doc.slug);
}

function recordAcceptance({ email, intent, documents, ip, userAgent }) {
  if (!Array.isArray(documents) || !documents.length) {
    throw Object.assign(new Error('documents_required'), { status: 400 });
  }
  const info = db.prepare(`
    INSERT INTO legal_acceptances (email, intent, documents, ip, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `).run(email || null, intent || 'engagement', JSON.stringify(documents), ip || null, userAgent || null);
  return getAcceptance(info.lastInsertRowid);
}

function getAcceptance(id) {
  const row = db.prepare(`SELECT * FROM legal_acceptances WHERE id = ?`).get(id);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    intent: row.intent,
    documents: JSON.parse(row.documents),
    ip: row.ip,
    userAgent: row.user_agent,
    acceptedAt: row.accepted_at,
  };
}

function listAcceptances({ limit = 100 } = {}) {
  const rows = db.prepare(
    `SELECT * FROM legal_acceptances ORDER BY accepted_at DESC LIMIT ?`
  ).all(Math.max(1, Math.min(1000, limit | 0)));
  return rows.map(r => ({
    id: r.id,
    email: r.email,
    intent: r.intent,
    documents: JSON.parse(r.documents),
    ip: r.ip,
    userAgent: r.user_agent,
    acceptedAt: r.accepted_at,
  }));
}

module.exports = {
  getDocument, listDocuments, upsertDocument,
  recordAcceptance, getAcceptance, listAcceptances,
};
