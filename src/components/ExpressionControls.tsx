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

const expressionGroups = {
  Emotions: ['happy', 'angry', 'sad', 'relaxed', 'surprise'],
  Mouth: ['aa', 'ih', 'ou', 'ee', 'oh'],
  Eyes: ['blink', 'blinkLeft', 'blinkRight'],
  Gaze: ['lookUp', 'lookDown', 'lookLeft', 'lookRight'],
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium">No expressions available</p>
        <p className="text-xs mt-1">This model has no expression data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">Expressions</h3>
        <button className="btn btn-ghost btn-xs gap-1.5" onClick={handleResetAll}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All
        </button>
      </div>

      {/* Expression Groups */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
        {Object.entries(expressionGroups).map(([groupName, groupExpressions]) => {
          const available = groupExpressions.filter((name) => availableExpressions.includes(name))
          if (available.length === 0) return null

          const hasActive = available.some((name) => (expressionValues[name] || 0) > 0)

          return (
            <div key={groupName} className="collapse collapse-arrow bg-base-100 rounded-xl border border-base-300">
              <input type="radio" name="expression-accordion" defaultChecked />
              <div className={`collapse-title text-sm font-semibold py-3 min-h-0 flex items-center gap-2 ${hasActive ? 'text-primary' : ''}`}>
                {groupName}
                {hasActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
              </div>
              <div className="collapse-content py-2 space-y-2">
                {available.map((name) => {
                  const value = expressionValues[name] || 0
                  const percentage = Math.round(value * 100)

                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm">{expressionLabels[name] || name}</label>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono w-8 text-right ${percentage > 0 ? 'text-primary font-semibold' : 'text-base-content/40'}`}>
                            {percentage}%
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={percentage}
                            onChange={(e) => handleExpressionChange(name, parseInt(e.target.value) / 100)}
                            className="range range-primary range-xs w-20"
                          />
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1 bg-base-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-150"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
