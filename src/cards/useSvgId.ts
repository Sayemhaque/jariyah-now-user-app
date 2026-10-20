import React from 'react'

export function useSvgId(prefix: string) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  return (name: string) => `${prefix}${name}${id}`
}
