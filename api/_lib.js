const DEFAULT_SUPABASE_URL = "https://dcysjuxyjqtvkihdsjvv.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_RZBX7u1v8MLBCfEJT0-eRg_jPcIulG2";

const SUPABASE_URL = String(
  process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL
)
  .trim()
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/+$/, "");

const SUPABASE_SERVICE_ROLE_KEY = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY
).trim();

function envReady() {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function sb(path, opts = {}) {
  if (!envReady()) {
    throw new Error("Supabase env missing");
  }

  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${SUPABASE_URL}/rest/v1/${cleanPath}`;

  const res = await fetch(url, {
    ...opts,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Supabase error ${res.status}`);
  }

  return text ? JSON.parse(text) : null;
}

/* Lightweight query-builder compatibility for routes using sb.from(...) */
sb.from = function (table) {
  let method = "GET";
  let selectCols = "*";
  let countMode = null;
  let bodyData = null;
  let filters = [];
  let orders = [];
  let rangeHeader = null;
  let wantSingle = false;

  const builder = {
    select(cols = "*", opts = {}) {
      selectCols = cols || "*";
      if (opts && opts.count) countMode = opts.count;
      return builder;
    },
    insert(rows) {
      method = "POST";
      bodyData = rows;
      return builder;
    },
    update(values) {
      method = "PATCH";
      bodyData = values;
      return builder;
    },
    delete() {
      method = "DELETE";
      return builder;
    },
    eq(col, val) {
      filters.push(`${encodeURIComponent(col)}=eq.${encodeURIComponent(val)}`);
      return builder;
    },
    order(col, opts = {}) {
      const dir = opts && opts.ascending === false ? "desc" : "asc";
      orders.push(`${encodeURIComponent(col)}.${dir}`);
      return builder;
    },
    range(from, to) {
      rangeHeader = `${from}-${to}`;
      return builder;
    },
    single() {
      wantSingle = true;
      return builder;
    },
    async then(resolve, reject) {
      try {
        const params = [];
        if (selectCols) {
          params.push(`select=${encodeURIComponent(selectCols)}`);
        }
        for (const f of filters) params.push(f);
        if (orders.length > 0) {
          params.push(`order=${orders.join(",")}`);
        }
        const qs = params.length ? `?${params.join("&")}` : "";
        const url = `${SUPABASE_URL}/rest/v1/${table}${qs}`;

        const prefer = ["return=representation"];
        if (countMode) prefer.push(`count=${countMode}`);

        const headers = {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: prefer.join(",")
        };
        if (rangeHeader) headers.Range = rangeHeader;

        const res = await fetch(url, {
          method,
          headers,
          body: bodyData !== null ? JSON.stringify(bodyData) : undefined
        });

        const text = await res.text();
        if (!res.ok) {
          return resolve({
            data: null,
            error: new Error(text || `Supabase error ${res.status}`),
            count: 0
          });
        }

        let data = text ? JSON.parse(text) : null;
        let totalCount = Array.isArray(data) ? data.length : 0;
        const cr = res.headers.get("content-range") || "";
        if (cr.includes("/")) {
          const parsed = Number(cr.split("/").pop());
          if (Number.isFinite(parsed)) totalCount = parsed;
        }
        if (wantSingle && Array.isArray(data)) {
          data = data[0] || null;
        }
        return resolve({ data, error: null, count: totalCount });
      } catch (err) {
        if (reject) return reject(err);
        return resolve({ data: null, error: err, count: 0 });
      }
    }
  };

  return builder;
};

module.exports = {
  sb,
  envReady,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
};
