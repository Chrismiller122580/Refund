'use client'

import { useEffect, useState } from 'react'
import type { FreedomInputs, FreedomResults } from '@/lib/calculators/freedom'
import type { FreedomRecommendation } from '@/lib/calculators/recommendation'
import type { ValidationWarning } from '@/lib/calculators/validation'

interface FreedomCalculationData {
  results: FreedomResults
  warnings: ValidationWarning[]
  recommendation: FreedomRecommendation
}

export function useFreedomCalculation(inputs: FreedomInputs) {
  const [data, setData] = useState<FreedomCalculationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/calculate/freedom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
        })
        if (!res.ok) throw new Error('Calculation failed')
        const json = (await res.json()) as FreedomCalculationData
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
