"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { supabase } from "./supabase";

interface UseProjectsSyncOptions<TRow, TItem> {
  initialItems: TItem[];
  select: string;
  mapRow: (row: TRow) => TItem;
  missingClientMessage?: string | null;
  syncOnFocus?: boolean;
  realtime?: boolean;
}

interface UseProjectsSyncResult<TItem> {
  items: TItem[];
  setItems: Dispatch<SetStateAction<TItem[]>>;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useProjectsSync<TRow, TItem>({
  initialItems,
  select,
  mapRow,
  missingClientMessage = null,
  syncOnFocus = true,
  realtime = true,
}: UseProjectsSyncOptions<TRow, TItem>): UseProjectsSyncResult<TItem> {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      if (missingClientMessage) setError(missingClientMessage);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("projects")
      .select(select)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setItems(((data ?? []) as TRow[]).map(mapRow));
    setError(null);
    setLoading(false);
  }, [mapRow, missingClientMessage, select]);

  useEffect(() => {
    let alive = true;

    const wrappedRefresh = async () => {
      if (!alive) return;
      await refresh();
    };

    void wrappedRefresh();

    if (!supabase) {
      return () => {
        alive = false;
      };
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void wrappedRefresh();
      }
    };

    if (syncOnFocus) {
      window.addEventListener("focus", wrappedRefresh);
      document.addEventListener("visibilitychange", onVisible);
    }

    const channel = realtime
      ? supabase
          .channel(`projects-sync-${Math.random().toString(36).slice(2)}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "projects" },
            () => {
              void wrappedRefresh();
            }
          )
          .subscribe()
      : null;

    return () => {
      alive = false;
      if (syncOnFocus) {
        window.removeEventListener("focus", wrappedRefresh);
        document.removeEventListener("visibilitychange", onVisible);
      }
      if (channel) supabase.removeChannel(channel);
    };
  }, [realtime, refresh, syncOnFocus]);

  return {
    items,
    setItems,
    error,
    loading,
    refresh,
  };
}
