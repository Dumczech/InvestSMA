// Tiny client for the InvestSMA admin API. Loaded as a plain <script> before the
// babel-transpiled JSX so all files can share window.api without import shims.
(function () {
  function qs(params) {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params || {})) {
      if (v !== undefined && v !== null && v !== '') u.set(k, v);
    }
    const s = u.toString();
    return s ? `?${s}` : '';
  }

  async function jfetch(url, opts = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
      body: opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)
        ? JSON.stringify(opts.body)
        : opts.body,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  window.api = {
    listMedia: (params) => jfetch(`/api/media${qs(params)}`),
    getMedia:  (id) => jfetch(`/api/media/${encodeURIComponent(id)}`),
    updateMedia: (id, patch) => jfetch(`/api/media/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
    deleteMedia: (id) => jfetch(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    bulkMedia: (action, payload) => jfetch(`/api/media/bulk`, { method: 'POST', body: { action, ...payload } }),
    addFromUrl: (payload) => jfetch(`/api/media/from-url`, { method: 'POST', body: payload }),
    uploadFiles: (files, folder) => {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      if (folder) fd.append('folder', folder);
      return jfetch(`/api/media/upload`, { method: 'POST', headers: {}, body: fd });
    },
    listFolders: () => jfetch(`/api/folders`),
    createFolder: (payload) => jfetch(`/api/folders`, { method: 'POST', body: payload }),
    storage: () => jfetch(`/api/storage`),
  };
})();
