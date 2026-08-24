const { sb, envReady } = require("./_lib");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function (req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "POST 요청만 가능합니다."
    });
  }

  if (!envReady()) {
    return res.status(500).json({
      ok: false,
      message: "Supabase 환경변수가 설정되지 않았습니다."
    });
  }

  try {
    const {
      coupon_code,
      mart_id,
      used_by
    } = req.body || {};

    if (!coupon_code) {
      return res.status(400).json({
        ok: false,
        message: "쿠폰코드가 필요합니다."
      });
    }

    const rows = await sb(
      `/electronic_coupons?coupon_code=eq.${encodeURIComponent(coupon_code)}&select=*`,
      {
        method: "GET"
      }
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "존재하지 않는 쿠폰입니다."
      });
    }

    const coupon = rows[0];

    if (coupon.status === "used") {
      return res.status(409).json({
        ok: false,
        message: "이미 사용된 쿠폰입니다."
      });
    }

    if (
      coupon.valid_until &&
      new Date(coupon.valid_until).getTime() < Date.now()
    ) {
      return res.status(409).json({
        ok: false,
        message: "유효기간이 만료된 쿠폰입니다."
      });
    }

    if (
      coupon.usable_mart_id &&
      mart_id &&
      coupon.usable_mart_id !== mart_id
    ) {
      return res.status(403).json({
        ok: false,
        message: "이 마트에서는 사용할 수 없는 쿠폰입니다."
      });
    }

    const updated = await sb(
      `/electronic_coupons?coupon_code=eq.${encodeURIComponent(coupon_code)}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          status: "used",
          used_quantity: Number(coupon.used_quantity || 0) + 1,
          mart_id: mart_id || coupon.mart_id || null,
          used_by: used_by || null,
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    );

    return res.status(200).json({
      ok: true,
      message: "쿠폰 사용처리가 완료되었습니다.",
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "쿠폰 사용처리 중 오류가 발생했습니다."
    });
  }
};
