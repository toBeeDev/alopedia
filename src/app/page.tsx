"use client";

import Link from "next/link";
import { Star, Camera, BarChart3, MessageCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COPY } from "@/constants/copy";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const AVATARS = [
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    alt: "사용자 1",
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    alt: "사용자 2",
  },
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    alt: "사용자 3",
  },
  {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    alt: "사용자 4",
  },
  {
    src: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face",
    alt: "사용자 5",
  },
] as const;

const FEATURES = [
  {
    icon: Camera,
    title: COPY.FEATURE_AI_TITLE,
    description: COPY.FEATURE_AI_DESC,
    color: "#171717",
  },
  {
    icon: BarChart3,
    title: COPY.FEATURE_TRACK_TITLE,
    description: COPY.FEATURE_TRACK_DESC,
    color: "#22C55E",
  },
  {
    icon: MessageCircle,
    title: COPY.FEATURE_COMMUNITY_TITLE,
    description: COPY.FEATURE_COMMUNITY_DESC,
    color: "#EAB308",
  },
  {
    icon: Trophy,
    title: COPY.FEATURE_RECORD_TITLE,
    description: COPY.FEATURE_RECORD_DESC,
    color: "#A855F7",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-6 sm:px-8 md:max-w-2xl md:px-12 lg:max-w-4xl xl:max-w-5xl">
        {/* ── Hero with HandWrittenTitle ── */}
        <section className="overflow-hidden">
          <HandWrittenTitle title={COPY.APP_NAME} subtitle={COPY.APP_TAGLINE} />
        </section>
      </main>
    </div>
  );
}
