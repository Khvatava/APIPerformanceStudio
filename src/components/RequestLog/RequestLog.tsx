import { useDeferredValue } from 'react'
import { List, type RowComponentProps } from 'react-window'
import type { RequestResult } from '../../types'
import { useResultsStore } from '../../store/resultsStore'
import './RequestLog.css'

const ROW_HEIGHT = 28

type RowProps = { items: RequestResult[] }

function Row({ index, style, items }: RowComponentProps<RowProps>) {
  const item = items[index]
  const statusClass =
    item.status === 0 || item.status >= 400
      ? 'log__status--error'
      : item.status >= 300
        ? 'log__status--warn'
        : 'log__status--ok'

  return (
    <div className="log__row" style={style}>
      <span className="log__time">{formatTime(item.timestamp)}</span>
      <span className={`log__status ${statusClass}`}>{item.status || 'ERR'}</span>
      <span className="log__latency">{item.latency} ms</span>
      <span className="log__error" title={item.error}>
        {item.error ?? ''}
      </span>
    </div>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

export function RequestLog() {
  const results = useResultsStore(s => s.results)
  const deferredResults = useDeferredValue(results)

  return (
    <section className="log">
      <div className="log__header">
        <span>Время</span>
        <span>Статус</span>
        <span>Latency</span>
        <span>Ошибка</span>
      </div>
      <div className="log__list">
        {deferredResults.length === 0 ? (
          <div className="log__empty">Запусти тест, чтобы увидеть результаты</div>
        ) : (
          <List
            rowComponent={Row}
            rowCount={deferredResults.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{ items: deferredResults }}
            defaultHeight={300}
          />
        )}
      </div>
    </section>
  )
}
