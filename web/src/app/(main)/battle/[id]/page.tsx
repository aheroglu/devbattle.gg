"use client";

import { useParams } from "next/navigation";
import BattleArena from "@/components/battles/battle-arena";

export default function BattlePage() {
  const params = useParams();
  const battleId = params.id as string;

  if (!battleId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Battle not found</h1>
          <p className="text-muted-foreground mt-2">Invalid battle ID</p>
        </div>
      </div>
    );
  }

  return <BattleArena battleId={battleId} />;
}