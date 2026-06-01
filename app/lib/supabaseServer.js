const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export async function supabaseSelect(table, { orderBy, ascending = false, select = "*", filters = {} } = {}) {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("select", select);
  if (orderBy) url.searchParams.set("order", `${orderBy}.${ascending ? "asc" : "desc"}`);

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return parseResponse(response);
}

export async function supabaseInsert(table, payload) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const rows = await parseResponse(response);
  return rows[0];
}

export async function supabaseUpsert(table, payload, conflictColumn) {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  if (conflictColumn) url.searchParams.set("on_conflict", conflictColumn);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getHeaders(),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(payload),
  });

  const rows = await parseResponse(response);
  return rows[0];
}

export async function supabaseUpdate(table, id, payload) {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("id", `eq.${id}`);

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      ...getHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const rows = await parseResponse(response);
  return rows[0];
}

export async function supabaseDelete(table, id) {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("id", `eq.${id}`);

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

function getHeaders() {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse(response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(body?.message || body?.error || text || "Supabase request failed");
  }

  return body || [];
}
