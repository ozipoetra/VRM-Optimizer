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
  'Emotions': ['happy', 'angry', 'sad', 'relaxed', 'surprise'],
  'Mouth': ['aa', 'ih', 'ou', 'ee', 'oh'],
  'Eyes': ['blink', 'blinkLeft', 'blinkRight'],
  'Gaze': ['lookUp', 'lookDown', 'lookLeft', 'lookRight'],
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
      <div className="text-center py-8 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No expressions available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">Expressions</h3>
        <button className="btn btn-ghost btn-xs gap-1" onClick={handleResetAll}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All
        </button>
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
        {Object.entries(expressionGroups).map(([groupName, groupExpressions]) => {
          const available = groupExpressions.filter((name) => availableExpressions.includes(name))
          if (available.length === 0) return null

          return (
            <div key={groupName} className="collapse collapse-arrow bg-base-300/50 rounded-lg">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-sm font-medium py-2 min-h-0">{groupName}</div>
              <div className="collapse-content py-2 space-y-3">
                {available.map((name) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-sm">{expressionLabels[name] || name}</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/50 w-8 text-right">
                          {Math.round((expressionValues[name] || 0) * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round((expressionValues[name] || 0) * 100)}
                          onChange={(e) => handleExpressionChange(name, parseInt(e.target.value) / 100)}
                          className="range range-accent range-xs w-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
