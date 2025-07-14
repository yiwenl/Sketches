import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import ExperimentList from './components/ExperimentList'
import { getData } from './model/data'

function App() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getData()
        const reversedData = data.experiments.concat().reverse()
        setExperiments(reversedData)
      } catch (error) {
        console.error('Error loading experiments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <main className="main">
      <Header />
      <div className="container">
        <ExperimentList experiments={experiments} />
      </div>
    </main>
  )
}

export default App 