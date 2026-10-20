export type ProcessingPhase = 'composing' | 'uploading' | 'encoding' | 'finalizing'

export const phaseOrder: ProcessingPhase[] = ['composing', 'uploading', 'encoding', 'finalizing']

export const phaseLabels: Record<ProcessingPhase, { title: string; subtitle: string }> = {
  composing: { title: 'প্রস্তুতি চলছে', subtitle: 'ভিডিও তৈরির জন্য সব কিছু গুছিয়ে নেওয়া হচ্ছে' },
  uploading: { title: 'অডিও সাজানো হচ্ছে', subtitle: 'তিলাওয়াতের অডিও একসাথে করা হচ্ছে' },
  encoding: { title: 'ভিডিও তৈরি হচ্ছে', subtitle: 'ব্যাকগ্রাউন্ড, লেখা আর অডিও মিলিয়ে ভিডিও বানানো হচ্ছে' },
  finalizing: { title: 'প্রায় শেষ', subtitle: 'আর একটু অপেক্ষা করুন, ডাউনলোড প্রস্তুত হচ্ছে' },
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
