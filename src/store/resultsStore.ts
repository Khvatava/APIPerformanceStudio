// src/store/resultsStore.ts
import { create } from 'zustand'
import type { RequestResult } from '../types'

interface ResultsStore {
  results: RequestResult[]
  // addResults принимает пачку, потому что worker батчит результаты
  // (см. workers/requestWorker.ts). Один immutable-spread на пачку
  // вместо одного на каждый запрос — O(n²/BATCH_SIZE) вместо O(n²).
  addResults: (results: RequestResult[]) => void
  clearResults: () => void
}

export const useResultsStore = create<ResultsStore>()(set => ({
  results: [],
  addResults: results =>
    set(state => (results.length === 0 ? state : { results: [...state.results, ...results] })),
  clearResults: () => set({ results: [] }),
}))
