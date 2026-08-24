const { sb, envReady } = require("./_lib");

module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "GET 요청만 가능합니다."
    });
  }

  if (!envReady()) {
    return res.status(500).json({
      ok: false,
      message: "Supabase 환경변수가 설정되지 않았습니다."
    });
  }

  try {

    const page = Math.max(
      1,
      Number(req.query.page || 1)
    );

    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number(req.query.page_size || 100)
      )
    );

    const offset =
      (page - 1) * pageSize;

    const rows = await sb(
      "/electronic_coupons" +
      "?select=*" +
      "&order=created_at.desc" +
      "&offset=" + offset +
      "&limit=" + pageSize,
      {
        method: "GET"
      }
    );

    return res.status(200).json({
      ok: true,
      page: page,
      page_size: pageSize,
      rows: Array.isArray(rows) ? rows : []
    });

  } catch (error) {

    console.error(
      "coupon-history error:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        error.message ||
        "전자쿠폰 조회현황을 불러오지 못했습니다."
    });
  }
};
