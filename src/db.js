// src/db.js
// Supabase-only data layer (no filesystem access, no top-level side effects)

import { createClient } from '@supabase/supabase-js';

let _anonClient = null;
let _adminClient = null;

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getAnonClient() {
  if (_anonClient) return _anonClient;

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  _anonClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _anonClient;
}

function getAdminClient() {
  if (_adminClient) return _adminClient;

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  _adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _adminClient;
}

/**
 * Generic read helper
 */
export async function selectRows(table, {
  columns = '*',
  filters = [],
  orderBy,
  ascending = true,
  limit,
  single = false,
  useAdmin = false,
} = {}) {
  const client = useAdmin ? getAdminClient() : getAnonClient();
  let query = client.from(table).select(columns);

  for (const f of filters) {
    if (!f || !f.op) continue;
    const { op, column, value } = f;
    if (op === 'eq') query = query.eq(column, value);
    if (op === 'in') query = query.in(column, value);
    if (op === 'neq') query = query.neq(column, value);
    if (op === 'gte') query = query.gte(column, value);
    if (op === 'lte') query = query.lte(column, value);
    if (op === 'like') query = query.like(column, value);
    if (op === 'ilike') query = query.ilike(column, value);
  }

  if (orderBy) query = query.order(orderBy, { ascending });
  if (limit) query = query.limit(limit);
  if (single) query = query.maybeSingle();

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Insert helper
 */
export async function insertRows(table, payload, { useAdmin = true } = {}) {
  const client = useAdmin ? getAdminClient() : getAnonClient();
  const rows = Array.isArray(payload) ? payload : [payload];

  const { data, error } = await client
    .from(table)
    .insert(rows)
    .select('*');

  if (error) throw error;
  return data;
}

/**
 * Upsert helper
 */
export async function upsertRows(table, payload, {
  onConflict,
  ignoreDuplicates = false,
  useAdmin = true,
} = {}) {
  const client = useAdmin ? getAdminClient() : getAnonClient();
  const rows = Array.isArray(payload) ? payload : [payload];

  const { data, error } = await client
    .from(table)
    .upsert(rows, { onConflict, ignoreDuplicates })
    .select('*');

  if (error) throw error;
  return data;
}

/**
 * Update helper
 */
export async function updateRows(table, values, {
  filters = [],
  useAdmin = true,
} = {}) {
  const client = useAdmin ? getAdminClient() : getAnonClient();
  let query = client.from(table).update(values);

  for (const f of filters) {
    if (!f || !f.op) continue;
    const { op, column, value } = f;
    if (op === 'eq') query = query.eq(column, value);
    if (op === 'in') query = query.in(column, value);
  }

  const { data, error } = await query.select('*');
  if (error) throw error;
  return data;
}

/**
 * Delete helper
 */
export async function deleteRows(table, {
  filters = [],
  useAdmin = true,
} = {}) {
  const client = useAdmin ? getAdminClient() : getAnonClient();
  let query = client.from(table).delete();

  for (const f of filters) {
    if (!f || !f.op) continue;
    const { op, column, value } = f;
    if (op === 'eq') query = query.eq(column, value);
    if (op === 'in') query = query.in(column, value);
  }

  const { data, error } = await query.select('*');
  if (error) throw error;
  return data;
}
