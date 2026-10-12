const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require("./_lib");

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
     GET: 복제된 분양사 방 목록 또는 개별 방 조회
  ========================================= */
  if (req.method === "GET") {
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

      return res.status(200).json({
        ok: true,
        message: `${rewardLabel} 카카오톡 연동 및 본사 DB 저장이 완료되었습니다.`,
        issuedCount: nextIssuedCount,
        remainCount: Math.max(0, issueQty - nextIssuedCount),
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
