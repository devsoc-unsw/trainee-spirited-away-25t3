import { useState, useRef } from 'react'
import './CodeDisplay.css'

type Change = {
  lineStart: number
  lineEnd: number
  charStart: number
  charEnd: number
  oldCode: string
  newCode: string
  explanation: string
  comment: string
}

type CodeDisplayProps = {
  code: string
  changes: Change[]
}

type HighlightedSection = {
  startIndex: number
  endIndex: number
  change: Change
  isDeletion?: boolean // True if this change represents a deletion
}

export default function CodeDisplay({ code, changes }: CodeDisplayProps) {
  const [hoveredChange, setHoveredChange] = useState<Change | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)

  // Find highlighted sections by searching for newCode strings in the fixed code
  // This is necessary because the AI's character positions refer to the ORIGINAL code,
  // but we're displaying the FIXED code, so positions don't match
  const getHighlightedSections = (): HighlightedSection[] => {
    if (!code || changes.length === 0) return []

    const sections: HighlightedSection[] = []
    const usedIndices = new Set<number>() // Track which characters we've already highlighted

    changes.forEach((change) => {

      // Strategy: Find newCode in the fixed code and highlight it
      // This works for additions and modifications
      if (change.newCode && change.newCode.trim()) {
        // Use lineStart as a hint for where to start searching
        // This helps when there are multiple identical strings
        const lines = code.split('\n')
        const hintLineIndex = Math.max(0, Math.min(change.lineStart - 1, lines.length - 1))
        
        // Calculate approximate starting position based on line hint
        let hintStartIndex = 0
        for (let i = 0; i < hintLineIndex; i++) {
          hintStartIndex += lines[i]?.length || 0
          hintStartIndex += 1 // newline
        }
        
        let searchStart = Math.max(0, hintStartIndex - 50) // Start searching a bit before the hint
        let found = false
        const searchEnd = Math.min(code.length, hintStartIndex + 200) // Search a reasonable range

        // Try to find newCode, avoiding overlaps with previously highlighted sections
        while (searchStart < searchEnd && !found) {
          const index = code.indexOf(change.newCode, searchStart)
          
          if (index === -1 || index >= searchEnd) {
            // Not found in the expected range, try searching the whole code
            const globalIndex = code.indexOf(change.newCode)
            if (globalIndex !== -1) {
              // Found elsewhere, check for overlap
              const endIndex = globalIndex + change.newCode.length
              let hasOverlap = false
              
              for (let i = globalIndex; i < endIndex; i++) {
                if (usedIndices.has(i)) {
                  hasOverlap = true
                  break
                }
              }

              if (!hasOverlap) {
                sections.push({ 
                  startIndex: globalIndex, 
                  endIndex: endIndex, 
                  change 
                })
                
                for (let i = globalIndex; i < endIndex; i++) {
                  usedIndices.add(i)
                }
                
                found = true
              }
            }
            break
          }

          // Check if this position overlaps with already-used indices
          const endIndex = index + change.newCode.length
          let hasOverlap = false
          
          for (let i = index; i < endIndex; i++) {
            if (usedIndices.has(i)) {
              hasOverlap = true
              break
            }
          }

          if (!hasOverlap) {
            // Found a non-overlapping match!
            sections.push({ 
              startIndex: index, 
              endIndex: endIndex, 
              change 
            })
            
            // Mark these indices as used
            for (let i = index; i < endIndex; i++) {
              usedIndices.add(i)
            }
            found = true
          } else {
            // Overlap detected, continue searching
            searchStart = index + 1
          }
        }

        if (!found) {
          // Could not find newCode in fixed code - this may be a deletion or the code structure changed significantly
        }
      } else {
        
        // Try to find where the deletion occurred by looking for surrounding context
        // We'll use the lineStart to approximate a position
        if (change.lineStart > 0) {
          const lines = code.split('\n')
          const targetLineIndex = Math.min(change.lineStart - 1, lines.length - 1)
          
          if (targetLineIndex >= 0 && lines[targetLineIndex]) {
            // Calculate position at the start of that line
            let deletionMarkerIndex = 0
            for (let i = 0; i < targetLineIndex; i++) {
              deletionMarkerIndex += lines[i]?.length || 0
              deletionMarkerIndex += 1 // newline
            }
            
            // Add a small marker section (just the start of the line)
            // This allows the comment to be shown when hovering near where the deletion occurred
            sections.push({
              startIndex: deletionMarkerIndex,
              endIndex: deletionMarkerIndex + Math.min(10, lines[targetLineIndex]?.length || 0),
              change,
              isDeletion: true,
            })
          }
        }
      }
    })

    // Sort by start index
    return sections.sort((a, b) => a.startIndex - b.startIndex)
  }

  const highlightedSections = getHighlightedSections()

  // Update tooltip position, ensuring it stays within container bounds
  const updateTooltipPosition = (target: HTMLElement) => {
    if (!containerRef.current) return

    const rect = target.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const scrollTop = containerRef.current.scrollTop
    const scrollLeft = containerRef.current.scrollLeft

    // Calculate position relative to container
    let top = rect.top - containerRect.top + scrollTop
    let left = rect.right - containerRect.left + scrollLeft + 10 // 10px offset to the right

    // Ensure tooltip doesn't go outside container bounds
    const tooltipWidth = 350 // Approximate tooltip width
    const containerWidth = containerRef.current.clientWidth

    // If tooltip would overflow to the right, position it to the left of the highlight
    if (left + tooltipWidth > containerWidth + scrollLeft) {
      left = rect.left - containerRect.left + scrollLeft - tooltipWidth - 10
      // If it would overflow to the left, position it at the right edge
      if (left < scrollLeft) {
        left = containerWidth + scrollLeft - tooltipWidth - 10
      }
    }

    // Ensure tooltip doesn't go above container
    if (top < scrollTop) {
      top = scrollTop + 10
    }

    setHoverPosition({ top, left })
  }

  // Render code with highlights
  const renderCodeWithHighlights = () => {
    if (!code) return null

    if (highlightedSections.length === 0) {
      return <code>{code}</code>
    }

    const parts: Array<{ text: string; isHighlighted: boolean; change?: Change; isDeletion?: boolean }> = []
    let lastIndex = 0

    highlightedSections.forEach((section) => {
      // Add text before highlight
      if (section.startIndex > lastIndex) {
        parts.push({
          text: code.substring(lastIndex, section.startIndex),
          isHighlighted: false,
        })
      }

      // Add highlighted text
      parts.push({
        text: code.substring(section.startIndex, section.endIndex),
        isHighlighted: true,
        change: section.change,
        isDeletion: section.isDeletion,
      })

      lastIndex = section.endIndex
    })

    // Add remaining text
    if (lastIndex < code.length) {
      parts.push({
        text: code.substring(lastIndex),
        isHighlighted: false,
      })
    }

    return (
      <code>
        {parts.map((part, index) => {
          if (part.isHighlighted && part.change) {
            return (
              <span
                key={index}
                className={part.isDeletion ? "highlighted-code deletion-marker" : "highlighted-code"}
                title={part.isDeletion ? "This area had code deleted - hover for details" : undefined}
                onMouseEnter={(e) => {
                  setHoveredChange(part.change || null)
                  updateTooltipPosition(e.currentTarget)
                }}
                onMouseLeave={() => {
                  setHoveredChange(null)
                  setHoverPosition(null)
                }}
                onMouseMove={(e) => {
                  if (part.change) {
                    updateTooltipPosition(e.currentTarget)
                  }
                }}
              >
                {part.text}
              </span>
            )
          }
          return <span key={index}>{part.text}</span>
        })}
      </code>
    )
  }

  return (
    <div className="code-display-container" ref={containerRef}>
      <pre className="code-display" ref={codeRef}>
        {renderCodeWithHighlights()}
      </pre>
      {hoveredChange && hoverPosition && (
        <div
          className="comment-tooltip"
          style={{
            top: `${hoverPosition.top}px`,
            left: `${hoverPosition.left}px`,
          }}
        >
          <div className="comment-header">
            <span className="comment-title">AI Comment</span>
          </div>
          <div className="comment-content">
            <div className="comment-text">{hoveredChange.comment || hoveredChange.explanation}</div>
            {(hoveredChange.oldCode || hoveredChange.newCode) && (
              <div className="comment-code-diff">
                {hoveredChange.oldCode && (
                  <div className="code-diff-line">
                    <span className="diff-label">Before:</span>
                    <code className="old-code">{hoveredChange.oldCode}</code>
                  </div>
                )}
                {hoveredChange.newCode && hoveredChange.newCode.trim() ? (
                  <div className="code-diff-line">
                    <span className="diff-label">After:</span>
                    <code className="new-code">{hoveredChange.newCode}</code>
                  </div>
                ) : hoveredChange.oldCode ? (
                  <div className="code-diff-line">
                    <span className="diff-label">After:</span>
                    <code className="deleted-code">[Deleted]</code>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

