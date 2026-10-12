import React from 'react'
import { Audio, Sequence } from 'remotion'
import { SlideContent, type SlideContentProps } from './SlideContent'

const premountFrames = 45

export const SlideSequence: React.FC<SlideContentProps> = (props) => (
  <Sequence from={props.timing.from} durationInFrames={props.timing.durationInFrames} premountFor={premountFrames}>
    <Audio src={props.timing.slide.audioUrl} pauseWhenBuffering />
    <SlideContent {...props} />
  </Sequence>
)
