import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

interface BoardDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BoardDetailLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    );
  const column = isUuid ? "id" : "slug";

  const { data: post } = await supabase
    .from("posts")
    .select("title, content, slug")
    .eq(column, id)
    .single();

  if (!post) {
    return { title: "게시글을 찾을 수 없어요" };
  }

  const description = post.content.slice(0, 150).replace(/\n/g, " ");

  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} | Alopedia 커뮤니티`,
      description,
      url: `${SITE_URL}/board/${post.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: post.title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/board/${post.slug}`,
    },
  };
}

export default function BoardDetailLayout({
  children,
}: BoardDetailLayoutProps): ReactElement {
  return <>{children}</>;
}
