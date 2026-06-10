import { useCallback, useEffect, useRef } from 'react'
import type { RequestConfig, WorkerOutMessage } from '../types'
import { useResultsStore } from '../store/resultsStore'
import { useConfigStore } from '../store/configStore'

export function useLoadRunner() {
  const workerRef = useRef<Worker | null>(null)

  const addResults = useResultsStore(s => s.addResults)
  const setStatus = useConfigStore(s => s.setStatus)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const start = useCallback(
    (config: RequestConfig) => {
      workerRef.current?.terminate()
      const worker = new Worker(new URL('../workers/requestWorker.ts', import.meta.url), {
        type: 'module',
      })
      workerRef.current = worker

      worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        if (e.data.type === 'RESULTS') {
          addResults(e.data.results)
        } else if (e.data.type === 'DONE') {
          setStatus('completed')
        }
      }

      setStatus('running')
      worker.postMessage({ type: 'RUN', config })
    },
    [addResults, setStatus],
  )

  const stop = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setStatus('stopped')
  }, [setStatus])

  return { start, stop }
}
