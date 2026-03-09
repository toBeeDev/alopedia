/** Board / Community related types */

export const BOARD_TYPE = {
  MEDICATION_REVIEW: "medication_review",
  PROCEDURE_REVIEW: "procedure_review",
  QNA: "qna",
  LOUNGE: "lounge",
} as const;

export type BoardType = typeof BOARD_TYPE[keyof typeof BOARD_TYPE];

export interface PostListItem {
  id: string;
  board: BoardType;
  title: string;
  tags: string[];
  voteCount: number;
  commentCount: number;
  authorNickname: string;
  authorLevel: number;
  createdAt: string;
  hasImages: boolean;
}

export interface PostDetail extends PostListItem {
  content: string;
  images: { url: string; thumbnailUrl: string }[] | null;
  scanId: string | null;
  isAdopted: boolean;
}

export interface CommentItem {
  id: string;
  content: string;
  authorNickname: string;
  authorLevel: number;
  voteCount: number;
  createdAt: string;
  parentId: string | null;
  replies: CommentItem[];
}
