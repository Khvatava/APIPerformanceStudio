import { create } from 'zustand'
import type { RequestConfig, RunStatus } from '../types'

interface ConfigStore {
  config: RequestConfig | null
  status: RunStatus
  setConfig: (config: RequestConfig) => void
  setStatus: (status: RunStatus) => void
}

export const useConfigStore = create<ConfigStore>()(set => ({
  config: null,
  status: 'idle',
  setConfig: config => set({ config }),
  setStatus: status => set({ status }),
}))
