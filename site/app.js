(function () {
  const data = window.AIR_PROJECT_DATA;
  const records = data.records || [];
  const stats = data.summary.stats || {};

  const fmt = (value, suffix = "") => {
    if (value === undefined || value === null || Number.isNaN(value)) return "-";
    return `${Number(value).toLocaleString("ko-KR")}${suffix}`;
  };

  document.getElementById("rowCount").textContent = fmt(data.summary.row_count);
  document.getElementById("co2Mean").textContent = fmt(stats.co2?.mean);
  document.getElementById("co2Max").textContent = fmt(stats.co2?.max);
  document.getElementById("vocMax").textContent = fmt(stats.voc?.max);
  document.getElementById("co2RangeInsight").textContent = `${fmt(stats.co2?.min)}-${fmt(stats.co2?.max)} ppm`;
  document.getElementById("vocInsight").textContent = `최대 ${fmt(stats.voc?.max)}`;

  const quote = (data.paper.snippets && data.paper.snippets[2]) || (data.paper.snippets && data.paper.snippets[0]) || "";
  document.getElementById("paperQuote").textContent = quote;

  const topCo2List = document.getElementById("topCo2List");
  data.summary.top_co2.slice(0, 6).forEach((row, index) => {
    const item = document.createElement("div");
    item.className = "rank";
    item.innerHTML = `
      <b>${index + 1}</b>
      <div>
        <strong>${row.province || ""} ${row.station || ""}</strong>
        <span>${row.line || ""} · ${row.location || "측정위치 미상"}</span>
      </div>
      <strong>${fmt(row.co2_num)}</strong>
    `;
    topCo2List.appendChild(item);
  });

  const average = (rows, key) => {
    const values = rows.map((r) => r[key]).filter((v) => typeof v === "number");
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  };

  const pearson = (rows, xKey, yKey) => {
    const pairs = rows
      .map((r) => [r[xKey], r[yKey]])
      .filter(([x, y]) => typeof x === "number" && typeof y === "number");
    const n = pairs.length;
    if (n < 2) return null;
    const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
    const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    pairs.forEach(([x, y]) => {
      const dx = x - meanX;
      const dy = y - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    });
    return numerator / Math.sqrt(denomX * denomY);
  };

  const co2Pm = pearson(records, "co2_num", "pm25_num");
  const co2Voc = pearson(records, "co2_num", "voc_num");
  const highCo2 = records.filter((r) => r.co2_num >= average(records, "co2_num"));
  const lowCo2 = records.filter((r) => r.co2_num < average(records, "co2_num"));
  const highPmAvg = average(highCo2, "pm25_num");
  const lowPmAvg = average(lowCo2, "pm25_num");

  const insightList = document.getElementById("insightList");
  const insightItems = [
    `분석한 공개자료의 CO2 평균은 ${fmt(stats.co2?.mean)} ppm, 최대는 ${fmt(stats.co2?.max)} ppm이었다. 이 자료만 보면 CO2가 1,000 ppm을 넘는 사례는 없었다.`,
    `CO2와 PM2.5의 상관계수는 ${co2Pm === null ? "계산 불가" : co2Pm.toFixed(2)}로 나타났다. 즉 이 공개자료에서는 CO2와 미세먼지가 강하게 함께 움직인다고 보기는 어렵다.`,
    `CO2와 VOC의 상관계수는 ${co2Voc === null ? "계산 불가" : co2Voc.toFixed(2)}이다. VOC는 사람의 호흡뿐 아니라 자재, 세정제, 외부 유입 등 다른 원인의 영향을 받을 수 있다.`,
    `CO2가 평균 이상인 지점의 PM2.5 평균은 ${fmt(highPmAvg.toFixed(1))}, 평균 미만 지점은 ${fmt(lowPmAvg.toFixed(1))}였다. 실내 환경은 한 변수만 보지 말고 여러 지표를 같이 봐야 한다.`,
    "학업 집중도와의 직접 상관분석은 아직 불가능하다. 집중도 점수 데이터가 없기 때문이다. 그래서 교실에서 CO2와 집중도 설문을 같은 시간에 직접 수집하는 후속 조사가 필요하다."
  ];
  insightList.innerHTML = insightItems.map((item) => `<li>${item}</li>`).join("");

  const chart = document.getElementById("pollutantChart");
  const ctx = chart.getContext("2d");
  const scatter = document.getElementById("scatterChart");
  const scatterCtx = scatter.getContext("2d");
  const ratio = window.devicePixelRatio || 1;

  function drawChart() {
    const width = chart.clientWidth;
    const height = Number(chart.getAttribute("height"));
    chart.width = width * ratio;
    chart.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const items = [
      ["CO2", stats.co2?.mean, stats.co2?.max, "#315c9b"],
      ["PM10", stats.pm10?.mean, stats.pm10?.max, "#0f8b8d"],
      ["PM2.5", stats.pm25?.mean, stats.pm25?.max, "#c77800"],
      ["VOC", stats.voc?.mean, stats.voc?.max, "#b9463f"],
      ["HCHO", stats.hcho?.mean, stats.hcho?.max, "#6b5aa6"]
    ].filter((d) => d[1] !== undefined);

    const max = Math.max(...items.map((d) => d[2]));
    const left = 58;
    const top = 24;
    const barH = 20;
    const gap = 23;
    const axisW = width - left - 24;

    ctx.font = "12px Malgun Gothic, Segoe UI, sans-serif";
    ctx.fillStyle = "#66717f";
    ctx.fillText("평균", left, 14);
    ctx.fillText("최대", left + axisW * 0.55, 14);

    items.forEach(([label, mean, peak, color], i) => {
      const y = top + i * (barH + gap);
      ctx.fillStyle = "#66717f";
      ctx.fillText(label, 8, y + 15);
      ctx.fillStyle = "#d9e1e8";
      ctx.fillRect(left, y, axisW, barH);
      ctx.fillStyle = color;
      ctx.fillRect(left, y, axisW * (mean / max), barH);
      ctx.fillStyle = "rgba(29,39,51,.28)";
      ctx.fillRect(left, y + barH + 4, axisW * (peak / max), 6);
      ctx.fillStyle = "#1d2733";
      ctx.fillText(`${Math.round(mean)} / ${Math.round(peak)}`, left + axisW * (peak / max) - 42, y + 15);
    });
  }

  function drawScatter() {
    const width = scatter.clientWidth;
    const height = Number(scatter.getAttribute("height"));
    scatter.width = width * ratio;
    scatter.height = height * ratio;
    scatterCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    scatterCtx.clearRect(0, 0, width, height);

    const points = records
      .filter((r) => typeof r.co2_num === "number" && typeof r.pm25_num === "number")
      .map((r) => ({ x: r.co2_num, y: r.pm25_num, voc: r.voc_num || 0 }));
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const pad = { left: 48, right: 18, top: 18, bottom: 38 };
    const xScale = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * (width - pad.left - pad.right);
    const yScale = (y) => height - pad.bottom - ((y - minY) / (maxY - minY || 1)) * (height - pad.top - pad.bottom);

    scatterCtx.strokeStyle = "#d9e1e8";
    scatterCtx.lineWidth = 1;
    scatterCtx.beginPath();
    scatterCtx.moveTo(pad.left, pad.top);
    scatterCtx.lineTo(pad.left, height - pad.bottom);
    scatterCtx.lineTo(width - pad.right, height - pad.bottom);
    scatterCtx.stroke();

    scatterCtx.font = "12px Malgun Gothic, Segoe UI, sans-serif";
    scatterCtx.fillStyle = "#66717f";
    scatterCtx.fillText("CO2 ppm", width - 74, height - 12);
    scatterCtx.save();
    scatterCtx.translate(14, 92);
    scatterCtx.rotate(-Math.PI / 2);
    scatterCtx.fillText("PM2.5", 0, 0);
    scatterCtx.restore();

    points.forEach((p) => {
      const radius = Math.max(3, Math.min(8, p.voc / 75));
      scatterCtx.beginPath();
      scatterCtx.fillStyle = "rgba(49, 92, 155, .58)";
      scatterCtx.arc(xScale(p.x), yScale(p.y), radius, 0, Math.PI * 2);
      scatterCtx.fill();
    });

    scatterCtx.fillStyle = "#1d2733";
    scatterCtx.fillText(`r(CO2, PM2.5) = ${co2Pm === null ? "-" : co2Pm.toFixed(2)}`, pad.left, 18);
    scatterCtx.fillStyle = "#66717f";
    scatterCtx.fillText("점 크기: VOC", pad.left + 126, 18);
  }

  drawChart();
  drawScatter();
  window.addEventListener("resize", () => {
    drawChart();
    drawScatter();
  });
})();
