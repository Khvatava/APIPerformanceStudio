import { RequestBuilder } from './components/RequestBuilder'
import { Metrics } from './components/Metrics'
import { RequestLog } from './components/RequestLog'
import './App.css'

function App() {
  return (
    <main className="app">
      <h1 className="app__title">API Performance Studio</h1>
      <div className="app__grid">
        <div className="app__col">
          <RequestBuilder />
        </div>
        <div className="app__col">
          <Metrics />
          <RequestLog />
        </div>
      </div>
    </main>
  )
}

export default App
