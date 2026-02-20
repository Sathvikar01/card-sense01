"use client";

import { create } from "zustand";
import type { SpendingAnalysis, AnalysisStatus } from "@/types";
import type { CreditCardListItem } from "@/types/credit-card";

interface AnalysisState {
  status: AnalysisStatus;
  analysis: SpendingAnalysis | null;
  errorMessage: string | null;
  comparedCardIds: string[];
  comparedCards: CreditCardListItem[];
  selectedMonth: string | null;

  setStatus: (status: AnalysisStatus) => void;
  setAnalysis: (analysis: SpendingAnalysis) => void;
  setError: (message: string) => void;
  reset: () => void;
  toggleCompareCard: (cardId: string, card?: CreditCardListItem) => void;
  clearComparison: () => void;
  setSelectedMonth: (month: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  status: "idle",
  analysis: null,
  errorMessage: null,
  comparedCardIds: [],
  comparedCards: [],
  selectedMonth: null,

  setStatus: (status) => set({ status, errorMessage: null }),
  setAnalysis: (analysis) => set({ analysis, status: "complete" }),
  setError: (message) => set({ errorMessage: message, status: "error" }),
  reset: () =>
    set({ status: "idle", analysis: null, errorMessage: null }),

  toggleCompareCard: (cardId, card) => {
    const current = get().comparedCardIds;
    const currentCards = get().comparedCards;
    if (current.includes(cardId)) {
      set({
        comparedCardIds: current.filter((id) => id !== cardId),
        comparedCards: currentCards.filter((c) => c.id !== cardId),
      });
    } else if (current.length < 3) {
      set({
        comparedCardIds: [...current, cardId],
        comparedCards: card ? [...currentCards, card] : currentCards,
      });
    }
  },
  clearComparison: () => set({ comparedCardIds: [], comparedCards: [] }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
