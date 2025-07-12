import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Battle, BattleMessage, Profile } from "@/types";
import { useAuth } from "./use-auth";

export function useBattle(battleId: string | null) {
  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch battle data
  const fetchBattle = useCallback(async () => {
    if (!battleId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("battles")
        .select(`
          *,
          problem:problems(*),
          player1:profiles!battles_player1_id_fkey(*),
          player2:profiles!battles_player2_id_fkey(*),
          winner:profiles!battles_winner_id_fkey(*)
        `)
        .eq("id", battleId)
        .single();

      if (error) throw error;
      setBattle(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching battle:", err);
    } finally {
      setIsLoading(false);
    }
  }, [battleId, supabase]);

  // Fetch battle messages
  const fetchMessages = useCallback(async () => {
    if (!battleId) return;

    try {
      const { data, error } = await supabase
        .from("battle_messages")
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq("battle_id", battleId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
    }
  }, [battleId, supabase]);

  // Send message
  const sendMessage = useCallback(async (message: string, messageType: 'chat' | 'system' | 'code_share' = 'chat') => {
    if (!battleId || !user) return;

    try {
      const { error } = await supabase
        .from("battle_messages")
        .insert({
          battle_id: battleId,
          sender_id: user.id,
          message,
          message_type: messageType
        });

      if (error) throw error;
    } catch (err: any) {
      console.error("Error sending message:", err);
    }
  }, [battleId, user, supabase]);

  // Update battle code
  const updateCode = useCallback(async (code: string, language: string) => {
    if (!battleId || !user || !battle) return;

    const isPlayer1 = battle.player1_id === user.id;
    const updateField = isPlayer1 ? 'player1_code' : 'player2_code';
    const languageField = isPlayer1 ? 'player1_language' : 'player2_language';

    try {
      const { error } = await supabase
        .from("battles")
        .update({
          [updateField]: code,
          [languageField]: language
        })
        .eq("id", battleId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error updating code:", err);
    }
  }, [battleId, user, battle, supabase]);

  // Submit solution
  const submitSolution = useCallback(async (code: string, language: string) => {
    if (!battleId || !user || !battle) return;

    const isPlayer1 = battle.player1_id === user.id;
    const updateField = isPlayer1 ? 'player1_code' : 'player2_code';
    const languageField = isPlayer1 ? 'player1_language' : 'player2_language';
    const submittedField = isPlayer1 ? 'player1_submitted_at' : 'player2_submitted_at';

    try {
      const { error } = await supabase
        .from("battles")
        .update({
          [updateField]: code,
          [languageField]: language,
          [submittedField]: new Date().toISOString()
        })
        .eq("id", battleId);

      if (error) throw error;

      // Send system message
      await sendMessage(`${isPlayer1 ? battle.player1?.username : battle.player2?.username} submitted their solution!`, 'system');
    } catch (err: any) {
      console.error("Error submitting solution:", err);
    }
  }, [battleId, user, battle, supabase, sendMessage]);

  // Join battle as player 2
  const joinBattle = useCallback(async () => {
    if (!battleId || !user || !battle || battle.player2_id) return;

    try {
      const { error } = await supabase
        .from("battles")
        .update({
          player2_id: user.id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq("id", battleId);

      if (error) throw error;

      // Send system message
      await sendMessage(`${user.user_metadata?.name || 'Player'} joined the battle!`, 'system');
    } catch (err: any) {
      console.error("Error joining battle:", err);
    }
  }, [battleId, user, battle, supabase, sendMessage]);

  // Join as spectator
  const joinAsSpectator = useCallback(async () => {
    if (!battleId || !user) return;

    try {
      const { error } = await supabase
        .from("battle_spectators")
        .insert({
          battle_id: battleId,
          spectator_id: user.id
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violation
        throw error;
      }
    } catch (err: any) {
      console.error("Error joining as spectator:", err);
    }
  }, [battleId, user, supabase]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!battleId) return;

    setIsConnected(false);

    // Subscribe to battle updates
    const battleChannel = supabase
      .channel(`battle-${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`,
        },
        (payload) => {
          console.log('Battle updated:', payload);
          fetchBattle();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_messages',
          filter: `battle_id=eq.${battleId}`,
        },
        (payload) => {
          console.log('New message:', payload);
          fetchMessages();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to battle channel');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Failed to connect to battle channel');
        }
      });

    return () => {
      battleChannel.unsubscribe();
      setIsConnected(false);
    };
  }, [battleId, supabase, fetchBattle, fetchMessages]);

  // Initial data fetch
  useEffect(() => {
    if (battleId) {
      fetchBattle();
      fetchMessages();
    }
  }, [battleId, fetchBattle, fetchMessages]);

  return {
    battle,
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    updateCode,
    submitSolution,
    joinBattle,
    joinAsSpectator,
    refetch: fetchBattle
  };
}