import React from 'react'
import { SlideContent, type SlideContentProps } from './SlideContent'
import { SlideTrack } from './SlideTrack'

export const SlideSequence: React.FC<SlideContentProps> = (props) => (
  <SlideTrack timing={props.timing}>
    <SlideContent {...props} />
  </SlideTrack>
)
