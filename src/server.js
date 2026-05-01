// Stub serverless function.
//
// Vercel's project settings include a `@vercel/node` builder that searches for
// an entrypoint at {app,index,server}.{js,ts,...} in the repo root or under
// src/. The legacy Express server that previously satisfied that search was
// removed when we migrated the data layer to Supabase, but the builder is
// still configured in the Vercel dashboard — without an entrypoint here the
// deploy fails after `next build` with:
//
//   Error: No entrypoint found. Searched for:
//     - src/server.{js,ts,...}
//
// This stub exists only to satisfy that search. All real API surface lives in
// app/api/*/route.ts and is served by the Next.js builder. The /_legacy path
// returns 410 Gone so anyone still hitting the old function gets a clear
// signal rather than a silent 200.
//
// TODO: remove this file once the @vercel/node build is removed from
// Project Settings (Build & Output → Build Step).

module.exports = (_req, res) => {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    error: 'gone',
    message: 'The legacy Express endpoint has been retired. Use /api/* (Next.js route handlers).',
  }));
};
