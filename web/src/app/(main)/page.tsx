"use client";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works-section";
import LiveBattlePreview from "@/components/home/live-battle-preview-section";
import Leaderboard from "@/components/home/leaderboard-section";
import XPRankSystemSection from "@/components/home/xp-rank-system-section";
import UpcomingTournamentsSection from "@/components/home/upcoming-tournaments-section";
import CommunitySection from "@/components/home/community-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />
      <HowItWorks />
      <LiveBattlePreview />
      <Leaderboard />
      <XPRankSystemSection />
      <UpcomingTournamentsSection />
      <CommunitySection />
    </div>
  );
}
