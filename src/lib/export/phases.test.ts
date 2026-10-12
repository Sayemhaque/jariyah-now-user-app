import { describe, it, expect } from 'vitest'
import { stageToPhase } from './phases'

describe('stageToPhase', () => {
  it('maps render stages to phases and overall progress', () => {
    expect(stageToPhase('starting', 0.5)).toEqual({ phase: 'composing', progress: 0.1 })
    expect(stageToPhase('selecting-composition', 0.5)?.phase).toBe('uploading')
    expect(stageToPhase('selecting-composition', 0.5)?.progress).toBeCloseTo(0.15)
    expect(stageToPhase('render-progress', 1)?.phase).toBe('encoding')
    expect(stageToPhase('render-progress', 1)?.progress).toBeCloseTo(0.95)
    expect(stageToPhase('done', 0)).toEqual({ phase: 'finalizing', progress: 1 })
  })

  it('ignores unknown stages', () => {
    expect(stageToPhase('mystery', 0.4)).toBeNull()
  })
})
