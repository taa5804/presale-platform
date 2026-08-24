const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function envReady() {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function sb(path, opts = {}) {
  if (!envReady()) {
    throw new Error("Supabase env missing");
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1${path}`,
    {
      ...opts,
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        ...(opts.headers || {})
      }
    }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Supabase error ${res.status}`);
  }

  return text ? JSON.parse(text) : null;
}

module.exports = {
  sb,
  envReady
};
