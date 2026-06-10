import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HTTP_METHODS, LIMITS, requestSchema, type RequestFormData } from './schema'
import { formDataToConfig } from '../../utils/formDataToConfig'
import { useConfigStore } from '../../store/configStore'
import { useResultsStore } from '../../store/resultsStore'
import { useLoadRunner } from '../../hooks/useLoadRunner'
import './RequestBuilder.css'

const METHODS_WITH_BODY: ReadonlyArray<RequestFormData['method']> = ['POST', 'PUT', 'PATCH']

export function RequestBuilder() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      url: '',
      method: 'GET',
      headers: [],
      body: '',
      bodyIsJson: false,
      concurrency: 10,
      totalRequests: 100,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'headers' })

  const setConfig = useConfigStore(s => s.setConfig)
  const status = useConfigStore(s => s.status)
  const clearResults = useResultsStore(s => s.clearResults)
  const { start, stop } = useLoadRunner()

  const method = useWatch({ control, name: 'method' })
  const showBody = METHODS_WITH_BODY.includes(method)

  const isRunning = status === 'running'

  const onSubmit = (data: RequestFormData) => {
    if (isRunning) return

    const config = formDataToConfig(data)
    setConfig(config)
    clearResults() 
    start(config)
  }

  return (
    <form className="request-builder" onSubmit={handleSubmit(onSubmit)}>
      <div className="row row--url">
        <select className="select" {...register('method')} disabled={isRunning}>
          {HTTP_METHODS.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="input input--url"
          type="url"
          placeholder="https://api.example.com/endpoint"
          {...register('url')}
          disabled={isRunning}
        />
      </div>
      {errors.url && <span className="error">{errors.url.message}</span>}

      <fieldset className="fieldset">
        <legend>Headers</legend>
        {fields.map((field, index) => (
          <div key={field.id} className="row row--header">
            <input
              className="input"
              placeholder="Header"
              {...register(`headers.${index}.key`)}
              disabled={isRunning}
            />
            <input
              className="input"
              placeholder="Value"
              {...register(`headers.${index}.value`)}
              disabled={isRunning}
            />
            <button
              type="button"
              className="btn btn--icon"
              onClick={() => remove(index)}
              disabled={isRunning}
              aria-label="Удалить header"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => append({ key: '', value: '' })}
          disabled={isRunning}
        >
          + Добавить header
        </button>
      </fieldset>

      {showBody && (
        <label className="field">
          <span className="field__label-row">
            Body
            <span className="checkbox">
              <input type="checkbox" {...register('bodyIsJson')} disabled={isRunning} />
              JSON
            </span>
          </span>
          <textarea
            className="textarea"
            rows={6}
            placeholder='{ "key": "value" }'
            {...register('body')}
            disabled={isRunning}
          />
          {errors.body && <span className="error">{errors.body.message}</span>}
        </label>
      )}

      <div className="row row--load">
        <label className="field">
          <span>Concurrency</span>
          <input
            className="input"
            type="number"
            min={LIMITS.concurrency.min}
            max={LIMITS.concurrency.max}
            {...register('concurrency', { valueAsNumber: true })}
            disabled={isRunning}
          />
          {errors.concurrency && <span className="error">{errors.concurrency.message}</span>}
        </label>
        <label className="field">
          <span>Всего запросов</span>
          <input
            className="input"
            type="number"
            min={LIMITS.totalRequests.min}
            max={LIMITS.totalRequests.max}
            {...register('totalRequests', { valueAsNumber: true })}
            disabled={isRunning}
          />
          {errors.totalRequests && <span className="error">{errors.totalRequests.message}</span>}
        </label>
      </div>

      <div className="row row--actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isRunning}
          hidden={isRunning}
        >
          Start
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={e => {
            e.preventDefault()
            stop()
          }}
          disabled={!isRunning}
          hidden={!isRunning}
        >
          Stop
        </button>
        <span className="status">Статус: {status}</span>
      </div>
    </form>
  )
}
