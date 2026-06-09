'use client'

import { useEffect, useState } from 'react'
import type { GapInputs, GapResults } from '@/lib/calculators/gap'
import type { ValidationWarning } from '@/lib/calculators/validation'

interface GapCalculationData {
  results: GapResults
  warnings: ValidationWarning[]
}

export function useGapCalculation(inputs: GapInputs) {
  const [data, setData] = useState<GapCalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/calculate/gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
        })
        if (!res.ok) throw new Error('Calculation failed')
        const json = (await res.json()) as GapCalculationData
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setError('Unable to calculate. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [inputs])

  return { data, loading, error }
}
