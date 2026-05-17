import { useState, useEffect, useCallback } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import { VRMExpressionPresetName } from '@pixiv/three-vrm'

interface ExpressionControlsProps {
  vrm: VRM | null
}

const expressionLabels: Record<string, string> = {
  happy: 'Happy',
  angry: 'Angry',
  sad: 'Sad',
  relaxed: 'Relaxed',
  surprise: 'Surprise',
  aa: 'A',
  ih: 'I',
  ou: 'U',
  ee: 'E',
  oh: 'O',
  blink: 'Blink',
  blinkLeft: 'Blink L',
  blinkRight: 'Blink R',
  lookUp: 'Look Up',
  lookDown: 'Look Down',
  lookLeft: 'Look Left',
  lookRight: 'Look Right',
}

export function ExpressionControls({ vrm }: ExpressionControlsProps) {
  const [availableExpressions, setAvailableExpressions] = useState<string[]>([])
  const [expressionValues, setExpressionValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!vrm?.expressionManager) {
      setAvailableExpressions([])
      return
    }

    const expressions: string[] = []
    const presetNames = Object.values(VRMExpressionPresetName)

    presetNames.forEach((preset) => {
      const expr = vrm.expressionManager!.getExpression(preset)
      if (expr) {
        expressions.push(preset)
      }
    })

    vrm.expressionManager.expressions.forEach((expr) => {
      if (!expressions.includes(expr.name)) {
        expressions.push(expr.name)
      }
    })

    setAvailableExpressions(expressions)

    const initialValues: Record<string, number> = {}
    expressions.forEach((name) => {
      const val = vrm.expressionManager!.getValue(name)
      initialValues[name] = val ?? 0
    })
    setExpressionValues(initialValues)
  }, [vrm])

  const handleExpressionChange = useCallback(
    (name: string, value: number) => {
      if (!vrm?.expressionManager) return

      vrm.expressionManager.setValue(name, value)
      setExpressionValues((prev) => ({ ...prev, [name]: value }))
    },
    [vrm]
  )

  const handleResetAll = useCallback(() => {
    if (!vrm?.expressionManager) return

    availableExpressions.forEach((name) => {
      vrm.expressionManager!.setValue(name, 0)
    })
    setExpressionValues((prev) => {
      const reset: Record<string, number> = {}
      Object.keys(prev).forEach((key) => {
        reset[key] = 0
      })
      return reset
    })
  }, [vrm, availableExpressions])

  if (!vrm || availableExpressions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium text-sm">Expressions</h4>
        <button
          onClick={handleResetAll}
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {availableExpressions.map((name) => (
          <div key={name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">{expressionLabels[name] || name}</span>
              <span className="text-white/40">{Math.round((expressionValues[name] || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={expressionValues[name] || 0}
              onChange={(e) => handleExpressionChange(name, parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
