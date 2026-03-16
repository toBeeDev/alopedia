/** AI Analysis related types */

export interface GeminiAnalysisRequest {
  scanId: string;
  images: {
    type: "top" | "front" | "side";
    base64: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  }[];
}

export interface ScalpRegion {
  imageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AreaScores {
  crown: number;
  hairline: number;
  density: number;
}

export interface GeminiAnalysisResponse {
  norwoodGrade: number;
  score: number;
  hairline: string;
  density: string;
  thickness: string;
  scalpCondition: string;
  advice: string;
  scalpRegions: ScalpRegion[];
  comparison?: string;
  areaScores: AreaScores;
}

export interface AnalysisResultView {
  id: string;
  scanId: string;
  grade: number;
  score: number;
  gradeLabel: string;
  gradeColor: string;
  hairline: string;
  density: string;
  thickness: string;
  scalpCondition: string;
  advice: string;
  createdAt: string;
  showHospitalPopup: boolean;
}
