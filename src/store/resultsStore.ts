import { create } from 'zustand'
import type { RequestResult } from '../types'

interface ResultsStore {
  results: RequestResult[]
  addResults: (results: RequestResult[]) => void
  clearResults: () => void
}

export const useResultsStore = create<ResultsStore>()(set => ({
  results: [],
  addResults: results =>
    set(state => (results.length === 0 ? state : { results: [...state.results, ...results] })),
  clearResults: () => set({ results: [] }),
}))
