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
      coupon_name,
      coupon_amount,
      valid_until,
      issue_quantity,
      company_id,
      mart_id,
      minimum_purchase
    } = req.body || {};

    if (!coupon_code || !coupon_name) {
      return res.status(400).json({
        ok: false,
        message: "쿠폰코드와 쿠폰명은 필수입니다."
      });
    }

    const data = await sb("/electronic_coupons", {
      method: "POST",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        coupon_code,
        coupon_name,
        coupon_amount: Number(coupon_amount || 0),
        valid_until: valid_until || null,
        status: "unused",
        issue_quantity: Number(issue_quantity || 0),
        used_quantity: 0,
        company_id: company_id || null,
        mart_id: mart_id || null,
        minimum_purchase: Number(minimum_purchase || 0)
      })
    });

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
};
