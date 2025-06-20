"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Copy } from "lucide-react"

interface JsonViewerProps {
  data: any
  label?: string
  initialExpanded?: boolean
}

export function JsonViewer({ data, label, initialExpanded = true }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  
  const toggleExpanded = () => setIsExpanded(!isExpanded)
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => {
        alert("JSON copied to clipboard.")
      })
      .catch((error) => {
        console.error("Copy failed:", error)
      })
  }

  return (
    <div className="json-viewer">
      <div className="flex justify-between items-center mb-2">
        {label && <span className="text-muted-foreground text-xs">{label}</span>}
        <div className="flex gap-2">
          <button 
            onClick={toggleExpanded} 
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>Expand</span>
              </>
            )}
          </button>
          <button 
            onClick={copyToClipboard}
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </button>
        </div>
      </div>
      
      {isExpanded ? (
        <pre className="text-xs p-2 overflow-x-auto">{formatJson(data)}</pre>
      ) : (
        <pre className="text-xs p-2 overflow-hidden whitespace-nowrap text-ellipsis">{JSON.stringify(data)}</pre>
      )}
    </div>
  )
}

function formatJson(data: any): React.ReactElement {
  const json = JSON.stringify(data, null, 2)
  
  // Syntax highlighting
  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let className = "text-primary" // Default (numbers)
      
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          className = "text-muted-foreground font-semibold" // Keys
        } else {
          className = "text-primary-foreground" // String values
        }
      } else if (/true|false/.test(match)) {
        className = "text-destructive" // Booleans
      } else if (/null/.test(match)) {
        className = "text-muted-foreground" // null
      }
      
      return `<span class="${className}">${match}</span>`
    }
  )
  
  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
} 