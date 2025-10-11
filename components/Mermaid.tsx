'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        maxTextSize: 1000000,
      })
    }
  }, [isClient])

  useEffect(() => {
    if (isClient && ref.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg
        }
      })
    }
  }, [chart, isClient])

  if (!isClient) {
    return null
  }

  return (
    <div className="my-6 flex justify-center">
      <div ref={ref} className="mermaid" />
    </div>
  )
}
