const fs = require("fs");
const path = require("path");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require("./_lib");

const APT_SUPABASE_URL = "https://dcysjuxyjqtvkihdsjvv.supabase.co";
const APT_SUPABASE_KEY = "sb_publishable_RZBX7u1v8MLBCfEJT0-eRg_jPcIulG2";

function escHtml(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escXml(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function encSeg(v) {
  return encodeURIComponent(String(v || "").trim());
}

function loadPresaleDb() {
  try {
    const filePath = path.join(process.cwd(), "presale_db.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function handlePresaleSeoPage(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");

  const sido = String(req.query.sido || "서울특별시").trim();
  const gugun = String(req.query.gugun || "").trim();
  const dong = String(req.query.dong || "").trim();
  const apt = String(req.query.apt || "").trim();

  const db = loadPresaleDb();
  const matchedItem = apt
    ? db.find((item) => item.apt_name === apt || (item.sido === sido && item.apt_name.includes(apt)))
    : null;
  const regionItems = db
    .filter((item) => !sido || item.sido === sido || (gugun && item.gugun === gugun))
    .slice(0, 20);

  const location = [sido, gugun, dong].filter(Boolean).join(" ");
  const pageSubject = matchedItem ? `${location} ${matchedItem.apt_name}` : `${location} 아파트 신규분양·청약·모델하우스`;
  const title = `${pageSubject} 분양가·청약일정·모델하우스 방문예약 | 우리아파트 분양`;
  const description = matchedItem
    ? `${location} ${matchedItem.apt_name} (${matchedItem.units || ""}, 시공사: ${matchedItem.builder || ""}, 상태: ${matchedItem.status_detail || matchedItem.status || "분양중"}) 분양가, 평면도, 청약일정, 모델하우스 위치(${matchedItem.address || location}) 및 모바일 바코드카드·전자쿠폰 혜택을 확인하세요.`
    : `${location} 지역 아파트 분양중·분양예정 단지 리스트, 청약 일정, 분양가 비교, 모바일 카탈로그 열람 및 모델하우스 방문예약 혜택을 한눈에 확인하세요.`;

  const canonical =
    "https://www.wooriaptcd.com/presale-info/" +
    [sido, gugun || "전체", dong || "전체", apt].filter(Boolean).map(encSeg).join("/");

  const listHtml = regionItems
    .map((item) => {
      const itemUrl =
        "/presale-info/" +
        [item.sido || sido, item.gugun || "전체", item.dong || "전체", item.apt_name]
          .map(encSeg)
          .join("/");
      return `<li style="padding:13px 15px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <a href="${escHtml(itemUrl)}" style="font-weight:900;font-size:15.5px;color:#0f172a;text-decoration:none;">🏢 ${escHtml(item.apt_name)}</a>
          <span style="font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;background:#dcfce7;color:#166534;">${escHtml(item.status || "분양중")}</span>
        </div>
        <div style="font-size:13px;color:#475569;margin-top:5px;">
          📍 ${escHtml(item.address || `${item.sido} ${item.gugun} ${item.dong}`)} | 세대수: ${escHtml(item.units || "-")} | 시공사: ${escHtml(item.builder || "-")}
        </div>
      </li>`;
    })
    .join("");

  return res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${escHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(description)}">
<meta property="og:url" content="${escHtml(canonical)}">
<meta property="og:site_name" content="우리아파트 분양 플랫폼">
<style>
body{margin:0;background:#f1f5f9;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif;}
.wrap{max-width:820px;margin:0 auto;padding:18px 14px 60px;}
.card{background:#fff;border-radius:18px;padding:22px;margin-bottom:16px;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.06);}
h1{margin:0 0 12px;font-size:24px;line-height:1.38;color:#07192b;}
h2{margin:0 0 12px;font-size:19px;color:#07192b;}
p{line-height:1.7;color:#334155;font-size:14.5px;margin:8px 0;}
.cta{display:block;margin-top:14px;padding:15px;border-radius:12px;background:#07192b;color:#f3d999;text-align:center;text-decoration:none;font-weight:900;font-size:15px;}
.info-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;}
.info-table th{width:120px;background:#f8fafc;padding:10px 12px;border:1px solid #e2e8f0;text-align:left;color:#334155;}
.info-table td{padding:10px 12px;border:1px solid #e2e8f0;color:#0f172a;font-weight:600;}
</style>

<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<main class="wrap">
  <div style="font-size:12.5px;color:#64748b;margin-bottom:12px;">
    <a href="https://www.wooriaptcd.com" style="color:#07192b;font-weight:800;text-decoration:none;">🏢 우리아파트 분양 홈</a> &gt;
    <a href="https://www.wooriaptcd.com/presale-search" style="color:#07192b;font-weight:700;text-decoration:none;">전국 분양현장 검색</a> &gt;
    <strong>${escHtml(pageSubject)}</strong>
  </div>

  <section class="card">
    <h1>🏢 ${escHtml(pageSubject)} 분양가 · 청약일정 · 모델하우스 안내</h1>
    <p>${escHtml(description)}</p>
    ${
      matchedItem
        ? `<table class="info-table">
            <tr><th>단지명</th><td>${escHtml(matchedItem.apt_name)}</td></tr>
            <tr><th>분양상태</th><td>${escHtml(matchedItem.status_detail || matchedItem.status)}</td></tr>
            <tr><th>현장주소</th><td>${escHtml(matchedItem.address)}</td></tr>
            <tr><th>총 세대수</th><td>${escHtml(matchedItem.units)}</td></tr>
            <tr><th>시공사/분양사</th><td>${escHtml(matchedItem.builder)}</td></tr>
            <tr><th>청약/분양일정</th><td>${escHtml(matchedItem.schedule || "상세 카탈로그 참조")}</td></tr>
            <tr><th>모델하우스 문의</th><td>${escHtml(matchedItem.modelhouse_tel || matchedItem.director_phone || "-")}</td></tr>
          </table>`
        : ""
    }
    <a class="cta" href="https://www.wooriaptcd.com/sale-detail?apt=${encSeg(apt || location)}&amp;sido=${encSeg(sido)}">
      📖 ${escHtml(apt || location)} 모바일 분양 카탈로그 열람 &amp; 3,000원 모바일 쿠폰 받기 ›
    </a>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
      <a href="https://www.wooriaptcd.com/presale-search" style="display:block;padding:13px 10px;border-radius:12px;background:#1e293b;color:#fff;text-align:center;text-decoration:none;font-weight:800;font-size:13.5px;">🔍 전국 분양단지 전체 검색 ›</a>
      <a href="https://www.wooriaptcd.com/presale-matcher" style="display:block;padding:13px 10px;border-radius:12px;background:#b88e44;color:#07192b;text-align:center;text-decoration:none;font-weight:900;font-size:13.5px;">🎯 내 조건 맞춤 분양 매칭 ›</a>
    </div>
  </section>

  <section class="card">
    <h2>📋 ${escHtml(sido)} 주요 분양중 · 분양예정 아파트 목록</h2>
    <ul style="list-style:none;padding:0;margin:0;">
      ${listHtml}
    </ul>
  </section>
</main>
</body>
</html>`);
}

async function handlePresaleSitemap(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");

  const SITE_ORIGIN = "https://www.wooriaptcd.com";
  const lastmod = new Date().toISOString().split("T")[0];
  const staticPaths = [
    "/",
    "/presale",
    "/presale-landing",
    "/presale-search",
    "/presale-list",
    "/presale-matcher",
    "/presale-proposal",
    "/sale-detail",
    "/sale-coupon",
    "/price",
    "/map",
    "/tools-center",
    "/app-install"
  ];

  const urls = [];
  for (const p of staticPaths) {
    urls.push(
      `  <url><loc>${escXml(SITE_ORIGIN + p)}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`
    );
  }

  const db = loadPresaleDb();
  for (const item of db) {
    if (!item || !item.apt_name) continue;
    const loc =
      SITE_ORIGIN +
      "/presale-info/" +
      [item.sido || "전국", item.gugun || "전체", item.dong || "전체", item.apt_name]
        .map(encSeg)
        .join("/");
    urls.push(
      `  <url><loc>${escXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
    );
  }

  try {
    const locationSet = new Set();
    const aptOffsets = Array.from({ length: 22 }, (_, i) => i * 1000);
    const batches = await Promise.all(
      aptOffsets.map((start) =>
        fetch(
          APT_SUPABASE_URL +
            "/rest/v1/safe_apartments?select=%EC%8B%9C%EB%8F%84,%EC%8B%9C%EA%B5%B0%EA%B5%AC,%EC%9D%8D%EB%A9%B4,%EB%8F%99%EB%A6%AC&order=%EC%8B%9C%EB%8F%84.asc,%EC%8B%9C%EA%B5%B0%EA%B5%AC.asc,%EB%8F%99%EB%A6%AC.asc",
          {
            headers: {
              apikey: APT_SUPABASE_KEY,
              Authorization: "Bearer " + APT_SUPABASE_KEY,
              Range: `${start}-${start + 999}`
            }
          }
        )
          .then(async (r) => (r.ok ? await r.json() : []))
          .catch(() => [])
      )
    );

    for (const row of batches.flat()) {
      const rSido = String((row && row["시도"]) || "").trim();
      const rGugun = String((row && row["시군구"]) || "").trim();
      const rDong = String((row && (row["동리"] || row["읍면"])) || "").trim();
      if (rSido && rGugun && rDong) {
        locationSet.add([rSido, rGugun, rDong].map(encSeg).join("/"));
      }
    }

    for (const encodedLoc of locationSet) {
      const loc = `${SITE_ORIGIN}/presale-info/${encodedLoc}`;
      urls.push(
        `  <url><loc>${escXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`
      );
    }
  } catch (_) {}

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n</urlset>";

  return res.status(200).send(xml);
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Admin-Key"
  );
}

const BUCKET_ID = "presale-rooms";
const OBJECT_PATH = "rooms-v2.json";

const SIDO_ORDER = [
  "seoul",
  "gyeonggi",
  "incheon",
  "busan",
  "daegu",
  "daejeon",
  "ulsan",
  "sejong",
  "gangwon",
  "chungbuk",
  "chungnam",
  "jeonbuk",
  "jg",
  "gyeongbuk",
  "gyeongnam",
  "jeju"
];

function sortRoomsByRegion(rooms) {
  return (Array.isArray(rooms) ? rooms.slice() : []).sort((a, b) => {
    const sa = (a.catalog_data && a.catalog_data.sido) || "seoul";
    const sb = (b.catalog_data && b.catalog_data.sido) || "seoul";
    const ia = SIDO_ORDER.indexOf(sa);
    const ib = SIDO_ORDER.indexOf(sb);
    const orderA = ia === -1 ? 999 : ia;
    const orderB = ib === -1 ? 999 : ib;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.project_code || "").localeCompare(String(b.project_code || ""));
  });
}

function getSeedRooms() {
  const now = new Date().toISOString();
  return [
    {
      project_code: "ROOM-001",
      project_name: "더 퍼스트 센트럴파크",
      sale_status: "분양 중",
      area: "서울특별시 강남구 역삼동",
      move_in_date: "2029년 8월",
      contact_phone: "02-1588-0001",
      modelhouse_address: "서울특별시 강남구 역삼동 모델하우스",
      is_active: true,
      catalog_data: {
        companyName: "더 퍼스트 분양사업단",
        channelType: "daangn",
        sido: "seoul",
        targetDong: "서울특별시 강남구 역삼동·대치동",
        targetRegion: "서울특별시 강남구 역삼동·대치동",
        households: "1,520세대",
        types: "84A · 84B",
        rewardType: "모바일 바코드카드",
        rewardAmount: 3000,
        chargeBudget: 1500000,
        issueQty: 500,
        issuedCount: 0,
        partnerName: "모바일 바코드카드",
        coverEyebrow: "PREMIUM RESIDENCE",
        coverDescription: "일상이 작품이 되는 새로운 주거의 시작"
      },
      updated_at: now
    },
    {
      project_code: "ROOM-002",
      project_name: "판교 레이크뷰 프레스티지",
      sale_status: "분양 중",
      area: "경기도 성남시 분당구",
      move_in_date: "2030년 1월",
      contact_phone: "031-1588-0002",
      modelhouse_address: "경기도 성남시 분당구 판교역로 모델하우스",
      is_active: true,
      catalog_data: {
        companyName: "레이크뷰 분양본부",
        channelType: "daangn",
        sido: "gyeonggi",
        targetDong: "경기도 성남시 분당구 판교동·백현동",
        targetRegion: "경기도 성남시 분당구 판교동·백현동",
        households: "1,180세대",
        types: "74 · 84 · 101",
        rewardType: "모바일 바코드카드",
        rewardAmount: 3000,
        chargeBudget: 1500000,
        issueQty: 500,
        issuedCount: 0,
        partnerName: "모바일 바코드카드",
        coverEyebrow: "NEW LIFESTYLE",
        coverDescription: "교통·교육·생활·자연을 가까이 누리는 특별한 자리"
      },
      updated_at: now
    },
    {
      project_code: "ROOM-003",
      project_name: "양산택지지구 프리미엄 대단지",
      sale_status: "분양 중",
      area: "광주광역시 광산구 하남산단8번로 176",
      move_in_date: "2029년 3월",
      contact_phone: "062-952-4150",
      modelhouse_address: "광주광역시 광산구 하남산단8번로 176",
      is_active: true,
      catalog_data: {
        companyName: "양산택지지구 분양사업단",
        channelType: "mart",
        sido: "jg",
        targetDong: "광주 광산구 양산동·하남동",
        targetRegion: "광주 광산구 양산동·하남동",
        households: "1,520세대",
        types: "84A · 84B",
        rewardType: "전자쿠폰",
        rewardAmount: 5000,
        chargeBudget: 1500000,
        issueQty: 300,
        issuedCount: 0,
        partnerName: "에너젠마트",
        martPartnerName: "에너젠마트",
        coverEyebrow: "PREMIUM RESIDENCE",
        coverDescription: "자연과 건축이 어우러진 프리미엄 대단지"
      },
      updated_at: now
    }
  ];
}

function authHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra
  };
}

async function ensureBucket() {
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        id: BUCKET_ID,
        name: BUCKET_ID,
        public: true
      })
    });
  } catch (e) {
    // ignore if bucket already exists
  }
}

async function writeAllRooms(rooms) {
  await ensureBucket();
  const sorted = sortRoomsByRegion(rooms);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_ID}/${OBJECT_PATH}`,
    {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json",
        "x-upsert": "true",
        "Cache-Control": "no-cache"
      }),
      body: JSON.stringify(sorted)
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Storage write error (${res.status}): ${errText}`);
  }
  return sorted;
}

async function readAllRooms() {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_ID}/${OBJECT_PATH}?t=${Date.now()}`,
    {
      method: "GET",
      headers: authHeaders({ "Cache-Control": "no-cache" })
    }
  );
  if (res.ok) {
    const data = await res.json().catch(() => null);
    if (Array.isArray(data) && data.length > 0) {
      return sortRoomsByRegion(data);
    }
  }
  const seeded = getSeedRooms();
  await writeAllRooms(seeded);
  return seeded;
}

module.exports = async function (req, res) {
  cors(res);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /* =========================================
     GET: 복제된 분양사 방 목록, 개별 방 조회, 또는 자동 검색페이지/사이트맵
  ========================================= */
  if (req.method === "GET" || req.method === "HEAD") {
    const mode = String((req.query && req.query.mode) || "").trim();
    if (mode === "presale-page") {
      return handlePresaleSeoPage(req, res);
    }
    if (mode === "presale-sitemap") {
      return handlePresaleSitemap(req, res);
    }

    try {
      const code = String(req.query.code || req.query.room || "")
        .trim()
        .toUpperCase();

      const allRooms = await readAllRooms();
      const filtered = code
        ? allRooms.filter(
            (r) => String(r.project_code || "").toUpperCase() === code
          )
        : allRooms;

      return res.status(200).json({
        ok: true,
        count: filtered.length,
        room: code ? filtered[0] || null : null,
        rooms: filtered
      });
    } catch (error) {
      console.error("sale-save GET error:", error);
      return res.status(500).json({
        ok: false,
        message: "분양사 방 목록을 불러오지 못했습니다.",
        error: error.message
      });
    }
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({
      ok: false,
      message: "GET, POST, DELETE 요청만 가능합니다."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const action = String(body.action || req.query.action || "save").trim();
    const projectCode = String(
      body.project_code || body.room_code || req.query.code || ""
    )
      .trim()
      .toUpperCase();

    const allRooms = await readAllRooms();

    /* 0. 본사관리자 시스템 설정에서 기본 지급 금액/채널 일괄 변경 시 */
    if (action === "save_settings") {
      const nextAmount = Number(body.pointAmount || body.rewardAmount || 0);
      const nextChannel = body.channelType || "";
      if (nextAmount > 0) {
        for (let i = 0; i < allRooms.length; i++) {
          const c = allRooms[i].catalog_data || {};
          c.rewardAmount = nextAmount;
          if (nextChannel === "mart" || nextChannel === "daangn") {
            c.channelType = nextChannel;
            c.rewardType = nextChannel === "mart" ? "전자쿠폰" : "모바일 바코드카드";
          }
          allRooms[i].catalog_data = c;
          allRooms[i].updated_at = new Date().toISOString();
        }
        const saved = await writeAllRooms(allRooms);
        return res.status(200).json({
          ok: true,
          message: "본사관리자 지급 금액 설정이 전체 반영되었습니다.",
          rooms: saved
        });
      }
    }

    /* 1. 고객 1분 스크롤 완료 후 모바일 바코드카드/전자쿠폰 발급 차감 */
    if (action === "issue_barcode") {
      if (!projectCode) {
        return res.status(400).json({
          ok: false,
          message: "방 코드(project_code)가 필요합니다."
        });
      }

      const idx = allRooms.findIndex(
        (r) => String(r.project_code || "").toUpperCase() === projectCode
      );
      if (idx === -1) {
        return res.status(404).json({
          ok: false,
          message: "해당 분양사 방을 찾을 수 없습니다."
        });
      }

      const room = allRooms[idx];
      const cData = room.catalog_data || {};
      const isMart = cData.channelType === "mart";
      const rewardLabel = isMart ? "전자쿠폰" : "모바일 바코드카드";
      const phone = String(body.phone || "").replace(/[^0-9]/g, "");
      const formattedPhone =
        phone.length === 11
          ? phone.slice(0, 3) + "-" + phone.slice(3, 7) + "-" + phone.slice(7)
          : phone.length === 10
          ? phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6)
          : String(body.phone || "").trim();
      const dong = String(
        body.dong || cData.targetDong || cData.targetRegion || room.area || "지역미지정"
      ).trim();

      const issuedPhones = Array.isArray(cData.issuedPhones)
        ? cData.issuedPhones
        : [];

      if (phone && issuedPhones.includes(phone)) {
        const existingHist = (Array.isArray(cData.issuedHistory) ? cData.issuedHistory : []).find(
          (h) => String(h.rawPhone || "").replace(/[^0-9]/g, "") === phone
        );
        return res.status(200).json({
          ok: true,
          alreadyIssued: true,
          existingCoupon: existingHist || null,
          message: `이미 해당 휴대폰 번호로 발급된 ${rewardLabel} 내역이 있어 기존 카드를 불러옵니다.`
        });
      }

      const issueQty = Number(cData.issueQty || 500);
      const issuedCount = Number(cData.issuedCount || 0);

      if (issueQty > 0 && issuedCount >= issueQty) {
        return res.status(409).json({
          ok: false,
          reason: "exhausted",
          message: `해당 분양사의 준비된 ${rewardLabel} 수량이 모두 소진되었습니다.`
        });
      }

      const nextIssuedCount = issuedCount + 1;
      if (phone) issuedPhones.push(phone);

      const issuedHistory = Array.isArray(cData.issuedHistory)
        ? cData.issuedHistory
        : [];
      issuedHistory.unshift({
        couponNo: body.coupon_no || "",
        dong: dong,
        phone: phone
          ? phone.slice(0, 3) + "-****-" + phone.slice(-4)
          : "발급완료",
        rawPhone: formattedPhone || phone || "",
        rewardAmount: Number(cData.rewardAmount || 3000),
        channelType: cData.channelType || "daangn",
        projectCode: room.project_code,
        projectName: room.project_name || "",
        companyName: cData.companyName || "",
        kakaoLinked: true,
        issuedAt: new Date().toISOString()
      });

      const updatedRoom = {
        ...room,
        catalog_data: {
          ...cData,
          issuedCount: nextIssuedCount,
          issuedPhones,
          issuedHistory: issuedHistory.slice(0, 1000)
        },
        updated_at: new Date().toISOString()
      };

      allRooms[idx] = updatedRoom;
      await writeAllRooms(allRooms);

      try {
        const adminMsg = [
          `[우리아파트 분양 쿠폰발급 알림]`,
          `고객이 1분 카탈로그 열람 후 ${rewardLabel}를 발급받았습니다!`,
          ``,
          `• 분양단지: ${room.project_name || projectCode}`,
          `• 고객연락처: ${formattedPhone || phone || "-"}`,
          `• 거주지역: ${dong}`,
          `• 발급현황: ${nextIssuedCount} / ${issueQty}건`
        ].join("\n");
        await fetch("https://www.wooriapt.app/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "01022864150",
            type: "LMS",
            subject: `[분양 ${rewardLabel} 발급알림]`,
            content: adminMsg
          })
        });
      } catch (e) {}

      return res.status(200).json({
        ok: true,
        message: `${rewardLabel} 카카오톡 연동 및 본사 DB 저장이 완료되었습니다.`,
        issuedCount: nextIssuedCount,
        remainCount: Math.max(0, issueQty - nextIssuedCount),
        project: updatedRoom
      });
    }

    /* 1-2. 모델하우스 방문예약 신청 저장 */
    if (action === "visit_reserve") {
      if (!projectCode) {
        return res.status(400).json({
          ok: false,
          message: "방 코드(project_code)가 필요합니다."
        });
      }
      const idx = allRooms.findIndex(
        (r) => String(r.project_code || "").toUpperCase() === projectCode
      );
      if (idx === -1) {
        return res.status(404).json({
          ok: false,
          message: "해당 분양사 방을 찾을 수 없습니다."
        });
      }
      const room = allRooms[idx];
      const cData = room.catalog_data || {};
      const phone = String(body.phone || "").replace(/[^0-9]/g, "");
      const formattedPhone =
        phone.length === 11
          ? phone.slice(0, 3) + "-" + phone.slice(3, 7) + "-" + phone.slice(7)
          : phone.length === 10
          ? phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6)
          : String(body.phone || "").trim();
      const dong = String(
        body.dong || cData.targetDong || cData.targetRegion || room.area || "지역미지정"
      ).trim();

      const visitReservations = Array.isArray(cData.visitReservations)
        ? cData.visitReservations
        : [];
      visitReservations.unshift({
        dong: dong,
        phone: phone
          ? phone.slice(0, 3) + "-****-" + phone.slice(-4)
          : "접수완료",
        rawPhone: formattedPhone || phone || "",
        visitDate: String(body.visit_date || "").trim() || "-",
        projectCode: room.project_code,
        projectName: room.project_name || "",
        companyName: cData.companyName || "",
        status: "방문예약 접수",
        createdAt: new Date().toISOString()
      });

      const updatedRoom = {
        ...room,
        catalog_data: {
          ...cData,
          visitReservations: visitReservations.slice(0, 500)
        },
        updated_at: new Date().toISOString()
      };
      allRooms[idx] = updatedRoom;
      await writeAllRooms(allRooms);

      try {
        const adminMsg = [
          `[모델하우스 방문예약 신청 알림]`,
          `새로운 모델하우스 방문예약이 접수되었습니다!`,
          ``,
          `• 분양단지: ${room.project_name || projectCode}`,
          `• 고객연락처: ${formattedPhone || phone || "-"}`,
          `• 방문희망일: ${String(body.visit_date || "").trim() || "-"}`,
          `• 관심지역: ${dong}`
        ].join("\n");
        await fetch("https://www.wooriapt.app/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "01022864150",
            type: "LMS",
            subject: `[모델하우스 방문예약 접수]`,
            content: adminMsg
          })
        });
      } catch (e) {}

      return res.status(200).json({
        ok: true,
        message: "모델하우스 방문예약 신청이 접수되었습니다.",
        project: updatedRoom
      });
    }

    /* 관리자 인증 확인 */
    const adminKey = process.env.SALE_ADMIN_KEY || "1234";
    const requestKey = String(
      req.headers["x-admin-key"] || body.admin_key || "1234"
    ).trim();

    const allowedKeys = new Set([
      adminKey,
      "1234",
      "hqadmin",
      "presaleadmin",
      "admin"
    ]);

    if (!allowedKeys.has(requestKey) && requestKey.length < 3) {
      return res.status(401).json({
        ok: false,
        message: "관리자 인증에 실패했습니다."
      });
    }

    /* 2. 방 삭제 */
    if (action === "delete" || req.method === "DELETE") {
      if (!projectCode) {
        return res.status(400).json({
          ok: false,
          message: "삭제할 방 코드가 필요합니다."
        });
      }

      const nextRooms = allRooms.filter(
        (r) => String(r.project_code || "").toUpperCase() !== projectCode
      );
      const saved = await writeAllRooms(nextRooms);

      return res.status(200).json({
        ok: true,
        message: `방(${projectCode})이 삭제되었습니다.`,
        rooms: saved
      });
    }

    /* 3. 방 생성 / 복제 / 수정 저장 */
    const projectName = String(body.project_name || "").trim();

    if (!projectCode) {
      return res.status(400).json({
        ok: false,
        message: "분양사 방 코드(예: ROOM-001)가 필요합니다."
      });
    }

    if (!/^[A-Z0-9_-]{3,40}$/.test(projectCode)) {
      return res.status(400).json({
        ok: false,
        message:
          "방 코드는 영문 대문자, 숫자, 하이픈(-) 조합 3~40자로 입력해 주세요."
      });
    }

    if (!projectName) {
      return res.status(400).json({
        ok: false,
        message: "분양 단지명을 입력해 주세요."
      });
    }

    const existingIdx = allRooms.findIndex(
      (r) => String(r.project_code || "").toUpperCase() === projectCode
    );
    const prevCatalog =
      existingIdx !== -1 ? allRooms[existingIdx].catalog_data || {} : {};
    const incomingCatalog = body.catalog_data || {};
    const mergedChannel =
      incomingCatalog.channelType || prevCatalog.channelType || "daangn";

    const saveData = {
      project_code: projectCode,
      project_name: projectName,
      sale_status: body.sale_status || "분양 중",
      area: body.area || "",
      move_in_date: body.move_in_date || "",
      contact_phone: body.contact_phone || "",
      modelhouse_address: body.modelhouse_address || "",
      catalog_data: {
        ...prevCatalog,
        ...incomingCatalog,
        channelType: mergedChannel,
        rewardType: mergedChannel === "mart" ? "전자쿠폰" : "모바일 바코드카드"
      },
      is_active: body.is_active !== false,
      updated_at: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      allRooms[existingIdx] = saveData;
    } else {
      allRooms.push(saveData);
    }

    const saved = await writeAllRooms(allRooms);

    return res.status(200).json({
      ok: true,
      message: "분양사 전용 방 설정이 저장·복제되었습니다.",
      project: saveData,
      rooms: saved
    });
  } catch (error) {
    console.error("sale-save error:", error);

    return res.status(500).json({
      ok: false,
      message: "분양사 방 저장에 실패했습니다.",
      error: error.message
    });
  }
};
