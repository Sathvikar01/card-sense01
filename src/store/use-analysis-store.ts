"use client";

import { create } from "zustand";
import type { SpendingAnalysis, AnalysisStatus } from "@/types";

interface AnalysisState {
  status: AnalysisStatus;
  analysis: SpendingAnalysis | null;
  errorMessage: string | null;
  comparedCardIds: string[];
  selectedMonth: string | null;

  setStatus: (status: AnalysisStatus) => void;
  setAnalysis: (analysis: SpendingAnalysis) => void;
  setError: (message: string) => void;
  reset: () => void;
  toggleCompareCard: (cardId: string) => void;
  clearComparison: () => void;
  setSelectedMonth: (month: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  status: "idle",
  analysis: null,
  errorMessage: null,
  comparedCardIds: [],
  selectedMonth: null,

  setStatus: (status) => set({ status, errorMessage: null }),
  setAnalysis: (analysis) => set({ analysis, status: "complete" }),
  setError: (message) => set({ errorMessage: message, status: "error" }),
  reset: () =>
    set({ status: "idle", analysis: null, errorMessage: null }),

  toggleCompareCard: (cardId) => {
    const current = get().comparedCardIds;
    if (current.includes(cardId)) {
      set({ comparedCardIds: current.filter((id) => id !== cardId) });
    } else if (current.length < 3) {
      set({ comparedCardIds: [...current, cardId] });
    }
  },
  clearComparison: () => set({ comparedCardIds: [] }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
