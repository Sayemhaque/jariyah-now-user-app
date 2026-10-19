import React from 'react'
import { Audio, Sequence } from 'remotion'
import type { SlideSequence } from './layout'

const premountFrames = 45

export const SlideTrack: React.FC<{ timing: SlideSequence; children: React.ReactNode }> = ({ timing, children }) => (
  <Sequence from={timing.from} durationInFrames={timing.durationInFrames} premountFor={premountFrames}>
    <Audio src={timing.slide.audioUrl} pauseWhenBuffering />
    {children}
  </Sequence>
)
