/** Canvas-based result card image generator (@2x retina, dynamic height) */

import { EAGLE_SVG_STRINGS } from "@/constants/eagleSvgStrings";
import { GRADE_CONFIG, type GradeLevel } from "@/constants/gradeConfig";
import type { AreaScores } from "@/types/database";

interface DrawResultCardParams {
  grade: number;
  score: number;
  eagleLabel: string;
  color: string;
  areaScores?: AreaScores;
  createdAt: string;
}

const SCALE = 2;
const LW = 390; // logical width
const W = LW * SCALE;
const PAD = 28;

const GRADE_COLORS: Record<GradeLevel, string> = {
  1: "#22C55E",
  2: "#EAB308",
  3: "#F97316",
  4: "#EF4444",
  5: "#A855F7",
};

/** SVG string → HTMLImageElement (data URL 방식, Safari 호환) */
function loadSvgAsImage(svgString: string, size: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = (): void => resolve(img);
    img.onerror = reject;
    const sized = svgString
      .replace(/width="48"/, `width="${size}"`)
      .replace(/height="48"/, `height="${size}"`);
    const encodedSized = btoa(unescape(encodeURIComponent(sized)));
    img.src = `data:image/svg+xml;base64,${encodedSized}`;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** HTMLCanvasElement → Blob (toBlob Promise wrapper) */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("canvas.toBlob returned null"));
      },
      "image/png",
    );
  });
}

/** 콘텐츠에 따른 논리 높이 계산 */
function calcLogicalHeight(hasAreaScores: boolean): number {
  // 헤더(48) + eagle(72~128) + score headline(160~192) + ring(220~340)
  // + trend(370) + bar(390~418) + scale labels(436)
  const base = 460;
  const areaSection = hasAreaScores ? 20 + 36 * 3 : 0; // divider + 3 rows
  const footer = 50; // divider + url + padding
  return base + areaSection + footer;
}

export async function drawResultCard(
  params: DrawResultCardParams,
): Promise<Blob> {
  const { grade, score, eagleLabel, color, areaScores, createdAt } = params;
  const clampedGrade = Math.max(1, Math.min(5, Math.round(grade))) as GradeLevel;
  const gradeConfig = GRADE_CONFIG[clampedGrade];

  const LH = calcLogicalHeight(!!areaScores);
  const H = LH * SCALE;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  ctx.scale(SCALE, SCALE);

  // ── Background ──
  drawRoundedRect(ctx, 0, 0, LW, LH, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.clip();

  // ── Brand header ──
  ctx.fillStyle = "#111827";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Alopedia", PAD, 40);

  // ── Eagle icon ──
  const eagleDrawSize = 44;
  try {
    const eagleImg = await loadSvgAsImage(
      EAGLE_SVG_STRINGS[clampedGrade],
      eagleDrawSize * SCALE,
    );
    ctx.drawImage(eagleImg, PAD, 58, eagleDrawSize, eagleDrawSize);
  } catch {
    // skip
  }

  // Eagle label + level
  ctx.fillStyle = "#374151";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${eagleLabel} LV.${clampedGrade}`, PAD + eagleDrawSize + 10, 82);

  // ── Score headline ──
  ctx.fillStyle = "#111827";
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("두피 건강 점수", PAD, 128);
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${score.toFixed(1)}점`, PAD, 156);

  // ── Score ring ──
  const ringCx = LW / 2;
  const ringCy = 226;
  const ringR = 48;
  const ringLineWidth = 8;

  // Track
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = "#F3F4F6";
  ctx.lineWidth = ringLineWidth;
  ctx.stroke();

  // Progress
  const progress = Math.min(score / 100, 1);
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = ringLineWidth;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.lineCap = "butt";

  // Score text inside ring
  ctx.fillStyle = color;
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(score)}`, ringCx, ringCy + 2);
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("/100", ringCx, ringCy + 16);
  ctx.textAlign = "left";

  // ── Trend + date ──
  const trendY = 300;
  ctx.fillStyle = color;
  ctx.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`● ${gradeConfig.label}`, PAD, trendY);

  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatDate(createdAt), LW - PAD, trendY);
  ctx.textAlign = "left";

  // ── Grade scale bar ──
  const barY = trendY + 16;
  const barH = 6;
  const barGap = 3;
  const barTotalWidth = LW - PAD * 2;
  const barSegW = (barTotalWidth - barGap * 4) / 5;

  for (let i = 1; i <= 5; i++) {
    const x = PAD + (i - 1) * (barSegW + barGap);
    ctx.fillStyle =
      i <= clampedGrade
        ? GRADE_COLORS[i as GradeLevel]
        : "#E5E7EB";
    drawRoundedRect(ctx, x, barY, barSegW, barH, 3);
    ctx.fill();
  }

  // Scale labels
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("정상", PAD, barY + barH + 16);
  ctx.textAlign = "right";
  ctx.fillText("전문 상담", LW - PAD, barY + barH + 16);
  ctx.textAlign = "left";

  // ── Area scores (optional) ──
  let nextY = barY + barH + 36;

  if (areaScores) {
    const areas: { label: string; value: number }[] = [
      { label: "정수리", value: areaScores.crown },
      { label: "헤어라인", value: areaScores.hairline },
      { label: "모발밀도", value: areaScores.density },
    ];

    // Divider
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(PAD, nextY, barTotalWidth, 1);
    nextY += 16;

    for (const area of areas) {
      const labelW = 56;
      const scoreBarX = PAD + labelW + 8;
      const scoreBarW = barTotalWidth - labelW - 40;
      const scoreFill = Math.min(area.value / 100, 1);

      // Label
      ctx.fillStyle = "#6B7280";
      ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(area.label, PAD, nextY + 11);

      // Bar track
      drawRoundedRect(ctx, scoreBarX, nextY + 4, scoreBarW, 7, 3.5);
      ctx.fillStyle = "#F3F4F6";
      ctx.fill();

      // Bar fill
      if (scoreFill > 0) {
        drawRoundedRect(
          ctx,
          scoreBarX,
          nextY + 4,
          Math.max(scoreBarW * scoreFill, 7),
          7,
          3.5,
        );
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Score number
      ctx.fillStyle = "#374151";
      ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(area.value)), LW - PAD, nextY + 12);
      ctx.textAlign = "left";

      nextY += 36;
    }
  }

  // ── Footer ──
  const footerY = nextY + 10;

  // Divider
  ctx.fillStyle = "#F3F4F6";
  ctx.fillRect(PAD, footerY, barTotalWidth, 1);

  // URL
  ctx.fillStyle = "#D1D5DB";
  ctx.font = "400 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("alopedia.kr", LW / 2, footerY + 18);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}
