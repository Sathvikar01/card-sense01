"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpendingAnalysis, AnalysisStatus } from "@/types";
import type { CreditCardListItem } from "@/types/credit-card";

interface AnalysisState {
  status: AnalysisStatus;
  analysis: SpendingAnalysis | null;
  errorMessage: string | null;
  hasHydrated: boolean;
  comparedCardIds: string[];
  comparedCards: CreditCardListItem[];
  selectedMonth: string | null;

  setStatus: (status: AnalysisStatus) => void;
  setAnalysis: (analysis: SpendingAnalysis) => void;
  setError: (message: string) => void;
  reset: () => void;
  toggleCompareCard: (cardId: string, card?: CreditCardListItem) => void;
  clearComparison: () => void;
  setComparisonFromCards: (cards: CreditCardListItem[]) => void;
  setSelectedMonth: (month: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      status: "idle",
      analysis: null,
      errorMessage: null,
      hasHydrated: false,
      comparedCardIds: [],
      comparedCards: [],
      selectedMonth: null,

      setStatus: (status) => set({ status, errorMessage: null }),
      setAnalysis: (analysis) => set({ analysis, status: "complete" }),
      setError: (message) => set({ errorMessage: message, status: "error" }),
      reset: () =>
        set({ status: "idle", analysis: null, errorMessage: null }),

      toggleCompareCard: (cardId, card) => {
        const currentIds = Array.from(new Set(get().comparedCardIds));
        const currentCards = get().comparedCards;

        if (currentIds.includes(cardId)) {
          set({
            comparedCardIds: currentIds.filter((id) => id !== cardId),
            comparedCards: currentCards.filter((c) => c.id !== cardId),
          });
          return;
        }

        if (currentIds.length >= 3) {
          return;
        }

        const nextIds = [...currentIds, cardId];
        const nextCards = card
          ? [...currentCards.filter((c) => c.id !== card.id), card]
          : currentCards;

        set({
          comparedCardIds: nextIds,
          comparedCards: nextCards.slice(0, 3),
        });
      },

      clearComparison: () => set({ comparedCardIds: [], comparedCards: [] }),

      setComparisonFromCards: (cards) => {
        const deduped = Array.from(new Map(cards.map((card) => [card.id, card])).values()).slice(0, 3);
        set({
          comparedCardIds: deduped.map((card) => card.id),
          comparedCards: deduped,
        });
      },

      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "cardsense-analysis-store",
      partialize: (state) => ({
        comparedCardIds: state.comparedCardIds,
        comparedCards: state.comparedCards,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
