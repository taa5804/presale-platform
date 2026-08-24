const { sb } = require("./_lib");

module.exports = async function handler(req, res) {

  /* ==============================
     CORS
  ============================== */

  const origin = req.headers.origin || "";

  const allowedOrigins = [
    "https://wooriapt.ai.kr",
    "https://wooriapt.imweb.me",
    "https://presale-platform.vercel.app"
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  /* ==============================
     OPTIONS 요청
  ============================== */

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }


  /* ==============================
     GET만 허용
  ============================== */

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "GET 요청만 가능합니다."
    });
  }


  try {

    /* ==============================
       페이지 값
    ============================== */

    const page =
      Math.max(
        1,
        Number(req.query.page || 1)
      );

    const pageSize =
      Math.min(
        100,
        Math.max(
          1,
          Number(req.query.page_size || 100)
        )
      );

    const from =
      (page - 1) * pageSize;

    const to =
      from + pageSize - 1;


    /* ==============================
       전자쿠폰 조회
       100개씩 페이지 조회
    ============================== */

    const { data, error, count } = await sb
      .from("electronic_coupons")
      .select(
        "id, coupon_code, coupon_name, coupon_amount, valid_until, status, issue_quantity, used_quantity, company_id, mart_id, used_at, created_at",
        { count: "exact" }
      )
      .order("created_at", {
        ascending: false
      })
      .range(from, to);


    if (error) {

      console.error(
        "electronic_coupons select error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message: "전자쿠폰 조회현황을 불러오지 못했습니다."
      });
    }


    const rows =
      Array.isArray(data)
        ? data
        : [];


    /* ==============================
       성공
    ============================== */

    return res.status(200).json({

      ok: true,

      page: page,

      page_size: pageSize,

      total_count:
        Number(count || 0),

      total_pages:
        Math.max(
          1,
          Math.ceil(
            Number(count || 0) /
            pageSize
          )
        ),

      rows: rows

    });


  } catch (error) {

    console.error(
      "coupon-history error:",
      error
    );

    return res.status(500).json({
      ok: false,
      message: "서버 오류가 발생했습니다."
    });
  }
};
