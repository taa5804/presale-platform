const { sb, envReady } = require("./_lib");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function (req, res) {
  cors(res);

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
    const coupon_code = req.query.coupon_code;

    if (!coupon_code) {
      return res.status(400).json({
        ok: false,
        message: "쿠폰코드가 필요합니다."
      });
    }

    const rows = await sb(
      `/electronic_coupons?coupon_code=eq.${encodeURIComponent(coupon_code)}&select=*`,
      { method: "GET" }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "존재하지 않는 쿠폰입니다."
      });
    }

    const coupon = rows[0];

    if (
      coupon.valid_until &&
      new Date(coupon.valid_until).getTime() < Date.now()
    ) {
      return res.status(200).json({
        ok: true,
        usable: false,
        reason: "expired",
        message: "유효기간이 만료된 쿠폰입니다.",
        data: coupon
      });
    }

    if (coupon.status === "used") {
      return res.status(200).json({
        ok: true,
        usable: false,
        reason: "used",
        message: "이미 사용된 쿠폰입니다.",
        data: coupon
      });
    }

    return res.status(200).json({
      ok: true,
      usable: true,
      message: "사용 가능한 쿠폰입니다.",
      data: coupon
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};
