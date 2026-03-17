/** Canvas-based result card image generator (780×1360 @2x → 390×680 logical) */

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

const W = 780;
const H = 1360;
const SCALE = 2;
const LW = W / SCALE; // 390 logical

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

export async function drawResultCard(
  params: DrawResultCardParams,
): Promise<Blob> {
  const { grade, score, eagleLabel, color, areaScores, createdAt } = params;
  const clampedGrade = Math.max(1, Math.min(5, Math.round(grade))) as GradeLevel;
  const gradeConfig = GRADE_CONFIG[clampedGrade];

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  // Scale everything by 2x for retina
  ctx.scale(SCALE, SCALE);

  // ── Background ──
  drawRoundedRect(ctx, 0, 0, LW, H / SCALE, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.clip();

  // ── Brand header ──
  ctx.fillStyle = "#111827";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("Alopedia", 28, 48);

  // ── Eagle icon ──
  const eagleDrawSize = 56;
  try {
    const eagleImg = await loadSvgAsImage(
      EAGLE_SVG_STRINGS[clampedGrade],
      eagleDrawSize * SCALE,
    );
    ctx.drawImage(eagleImg, 28, 72, eagleDrawSize, eagleDrawSize);
  } catch {
    // Eagle failed to load — skip icon, continue drawing
  }

  // Eagle label + level
  ctx.fillStyle = "#374151";
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${eagleLabel} LV.${clampedGrade}`, 92, 98);

  // ── Score headline ──
  ctx.fillStyle = "#111827";
  ctx.font = "500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("두피 건강 점수", 28, 160);
  ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`${score.toFixed(1)}점`, 28, 192);

  // ── Score ring ──
  const ringCx = LW / 2;
  const ringCy = 280;
  const ringR = 60;
  const ringLineWidth = 10;

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
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(score)}`, ringCx, ringCy + 2);
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("/100", ringCx, ringCy + 20);
  ctx.textAlign = "left";

  // ── Trend + date ──
  const trendY = 370;
  ctx.fillStyle = color;
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(`● ${gradeConfig.label}`, 28, trendY);

  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatDate(createdAt), LW - 28, trendY);
  ctx.textAlign = "left";

  // ── Grade scale bar ──
  const barY = trendY + 20;
  const barH = 8;
  const barGap = 4;
  const barTotalWidth = LW - 56;
  const barSegW = (barTotalWidth - barGap * 4) / 5;

  for (let i = 1; i <= 5; i++) {
    const x = 28 + (i - 1) * (barSegW + barGap);
    ctx.fillStyle =
      i <= clampedGrade
        ? GRADE_COLORS[i as GradeLevel]
        : "#E5E7EB";
    drawRoundedRect(ctx, x, barY, barSegW, barH, 4);
    ctx.fill();
  }

  // Scale labels
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("정상", 28, barY + barH + 18);
  ctx.textAlign = "right";
  ctx.fillText("전문 상담", LW - 28, barY + barH + 18);
  ctx.textAlign = "left";

  // ── Area scores (optional) ──
  let nextY = barY + barH + 44;

  if (areaScores) {
    const areas: { label: string; value: number }[] = [
      { label: "정수리", value: areaScores.crown },
      { label: "헤어라인", value: areaScores.hairline },
      { label: "모발밀도", value: areaScores.density },
    ];

    // Divider
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(28, nextY, barTotalWidth, 1);
    nextY += 20;

    for (const area of areas) {
      const labelW = 64;
      const scoreBarX = 28 + labelW + 8;
      const scoreBarW = barTotalWidth - labelW - 48;
      const scoreFill = Math.min(area.value / 100, 1);

      // Label
      ctx.fillStyle = "#6B7280";
      ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(area.label, 28, nextY + 12);

      // Bar track
      drawRoundedRect(ctx, scoreBarX, nextY + 4, scoreBarW, 8, 4);
      ctx.fillStyle = "#F3F4F6";
      ctx.fill();

      // Bar fill
      if (scoreFill > 0) {
        drawRoundedRect(
          ctx,
          scoreBarX,
          nextY + 4,
          Math.max(scoreBarW * scoreFill, 8),
          8,
          4,
        );
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Score number
      ctx.fillStyle = "#374151";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(Math.round(area.value)), LW - 28, nextY + 13);
      ctx.textAlign = "left";

      nextY += 36;
    }
  }

  // ── Footer ──
  const footerY = Math.max(nextY + 30, (H / SCALE) - 60);

  // Divider
  ctx.fillStyle = "#F3F4F6";
  ctx.fillRect(28, footerY - 16, barTotalWidth, 1);

  // URL
  ctx.fillStyle = "#D1D5DB";
  ctx.font = "400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("alopedia.kr", LW / 2, footerY + 4);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}
