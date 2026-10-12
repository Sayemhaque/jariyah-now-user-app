export type ProcessingPhase = 'composing' | 'uploading' | 'encoding' | 'finalizing'

export const phaseOrder: ProcessingPhase[] = ['composing', 'uploading', 'encoding', 'finalizing']

export const phaseLabels: Record<ProcessingPhase, { title: string; subtitle: string }> = {
  composing: { title: 'Preparing render', subtitle: 'Staging assets and validating the export job' },
  uploading: { title: 'Building audio', subtitle: 'Collecting recitation audio and preparing the timeline' },
  encoding: { title: 'Encoding video', subtitle: 'Compositing the background, overlays, and final audio' },
  finalizing: { title: 'Finalizing', subtitle: 'Almost done — preparing the finished MP4 download' },
}

export function stageToPhase(stage: string, overall: number): { phase: ProcessingPhase; progress: number } | null {
  switch (stage) {
    case 'starting':
      return { phase: 'composing', progress: Math.min(0.1, overall) }
    case 'opening-browser':
    case 'selecting-composition':
      return { phase: 'uploading', progress: 0.1 + overall * 0.1 }
    case 'render-progress':
      return { phase: 'encoding', progress: 0.2 + overall * 0.75 }
    case 'uploading':
      return { phase: 'finalizing', progress: 0.95 + overall * 0.04 }
    case 'done':
      return { phase: 'finalizing', progress: 1 }
    default:
      return null
  }
}
