"use strict";

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = async function handler(req, res) {
  const q = req.query || {};

  const mart = String(q.mart || "").trim();
  const region = String(q.region || "").trim();

  if (!mart) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.end(`
      <!doctype html>
      <html lang="ko">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>마트 정보를 찾을 수 없습니다</title>
      </head>
      <body>
        <h1>마트 정보를 찾을 수 없습니다.</h1>
      </body>
      </html>
    `);
  }

  const safeMart = esc(mart);
  const safeRegion = esc(region);

  const title = region
    ? `${safeRegion} ${safeMart} | 마트 정보`
    : `${safeMart} | 마트 정보`;

  const description = region
    ? `${safeRegion} ${safeMart} 정보를 확인하세요. 마트 특가상품과 행사상품 정보를 확인할 수 있습니다.`
    : `${safeMart} 정보를 확인하세요. 마트 특가상품과 행사상품 정보를 확인할 수 있습니다.`;

  const html = `
<!doctype html>
<html lang="ko">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1,viewport-fit=cover"
>

<title>${title}</title>

<meta
  name="description"
  content="${description}"
>

<meta
  name="robots"
  content="index,follow"
>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Noto Sans KR",
    Arial,
    sans-serif;

  background: #f7f8f7;
  color: #222;
}

.wrap {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 50px;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 26px 20px;
}

.label {
  font-size: 14px;
  margin-bottom: 8px;
}

h1 {
  margin: 0 0 18px;
  font-size: 28px;
  line-height: 1.35;
}

.location {
  font-size: 16px;
  margin-bottom: 22px;
}

.text {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 26px;
}

.owner-box {
  margin-top: 28px;
  padding: 22px 18px;
  border: 1px solid #dfe6df;
  border-radius: 12px;
}

.owner-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 10px;
}

.owner-text {
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 18px;
}

.button {
  display: block;
  width: 100%;
  padding: 15px 16px;
  text-align: center;
  text-decoration: none;
  border-radius: 9px;
  background: #075b32;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
}

</style>

</head>

<body>

<main class="wrap">

  <section class="card">

    <div class="label">
      마트 정보
    </div>

    <h1>
      ${safeMart}
    </h1>

    ${
      safeRegion
        ? `
        <div class="location">
          ${safeRegion}
        </div>
        `
        : ""
    }

    <div class="text">
      ${safeMart}의 특가상품과 행사상품 정보를
      확인할 수 있는 마트 정보 페이지입니다.
    </div>


    <div class="owner-box">

      <div class="owner-title">
        이 마트의 사장님이신가요?
      </div>

      <div class="owner-text">
        고객이 우리 매장을 검색하고 있습니다.
        매장 정보와 특가·행사상품을 직접 등록해
        고객에게 보여주세요.
      </div>

      <a
        class="button"
        href="/mart-landing.html"
      >
        마트 플랫폼 알아보기
      </a>

    </div>

  </section>

</main>

</body>
</html>
  `;

  res.statusCode = 200;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "s-maxage=3600, stale-while-revalidate=86400"
  );

  return res.end(html);
};
