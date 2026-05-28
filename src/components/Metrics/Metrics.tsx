// src/components/Metrics/Metrics.tsx
import { useDeferredValue, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useResultsStore } from '../../store/resultsStore'
import { useConfigStore } from '../../store/configStore'
import { calcStats } from '../../utils/stats'
import './Metrics.css'

// Сколько последних точек показываем на графике latency.
// Все 10k не нужны — глаз всё равно не разглядит, а Recharts будет тормозить.
const CHART_WINDOW = 100

export function Metrics() {
  const results = useResultsStore(s => s.results)
  const total = useConfigStore(s => s.config?.totalRequests)

  // useDeferredValue говорит React: рендери эти данные с низким приоритетом.
  // Если апдейты приходят чаще, чем успеваем рисовать (245 RPS → 245 апдейтов/сек),
  // React пропустит промежуточные. UI остаётся отзывчивым, форма не лагает.
  const deferredResults = useDeferredValue(results)

  // calcStats теперь считается ЗДЕСЬ, а не в сторе.
  // useMemo — чтобы не пересчитывать, если deferredResults тот же объект.
  // Поскольку Metrics рендерится только когда useDeferredValue решит "пора"
  // (а не на каждый push в стор), мы вызываем calcStats в разы реже,
  // чем приходят запросы. Главное — main thread не блокируется на каждый result.
  const deferredStats = useMemo(() => calcStats(deferredResults, total), [deferredResults, total])

  // Берём последние N результатов для графика, мемоизируем.
  // index здесь — порядковый номер в окне, не в общем массиве.
  const chartData = useMemo(
    () =>
      deferredResults.slice(-CHART_WINDOW).map((r, i) => ({
        i,
        latency: r.latency,
      })),
    [deferredResults],
  )

  return (
    <section className="metrics">
      <div className="metrics__row">
        <Stat label="Выполнено" value={`${deferredStats.completed} / ${deferredStats.total}`} />
        <Stat label="RPS" value={deferredStats.rps.toFixed(1)} />
        <Stat
          label="Ошибки"
          value={`${deferredStats.errorRate.toFixed(1)}%`}
          tone={deferredStats.errorRate > 0 ? 'bad' : 'ok'}
        />
      </div>

      <div className="metrics__row">
        <Stat label="avg" value={`${deferredStats.avg} ms`} />
        <Stat label="min" value={`${deferredStats.min} ms`} />
        <Stat label="max" value={`${deferredStats.max} ms`} />
        <Stat label="p95" value={`${deferredStats.p95} ms`} />
        <Stat label="p99" value={`${deferredStats.p99} ms`} />
      </div>

      <div className="metrics__chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="i" hide />
            <YAxis stroke="#9ca3af" fontSize={11} width={40} />
            <Tooltip
              contentStyle={{ background: '#1f2028', border: '1px solid #2e303a' }}
              labelStyle={{ color: '#9ca3af' }}
              // Recharts даёт value как ValueType (может быть undefined/массивом),
              // приводим к строке безопасно
              formatter={value => [`${value} ms`, 'latency']}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#c084fc"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className={`stat ${tone ? `stat--${tone}` : ''}`}>
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
    </div>
  )
}
