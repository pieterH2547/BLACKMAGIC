"use client"

import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"

interface ExampleQueriesProps {
  platform: string
  onSelectExample: (query: string) => void
}

export function ExampleQueries({ platform, onSelectExample }: ExampleQueriesProps) {
  // Beperkt tot 2 duidelijke, strakke voorbeelden
  const examples = [
    {
      title: "Senior Developer",
      description: "Senior Java developer met Spring Boot en cloud ervaring",
    },
    {
      title: "UX/UI Designer",
      description: "UX/UI designer met Figma ervaring en e-commerce achtergrond",
    },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-purple-300">Voorbeelden</h3>
      <div className="space-y-2">
        {examples.map((example, index) => (
          <div key={index} className="w-full overflow-hidden rounded-md border border-purple-800/20">
            <Button
              onClick={() => onSelectExample(example.description)}
              className="w-full justify-start text-left bg-black/30 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 p-3 h-auto flex flex-col items-start rounded-none border-0"
            >
              <div className="flex items-center gap-2 mb-1 w-full">
                <Code className="h-3.5 w-3.5 flex-shrink-0 text-purple-400" />
                <span className="font-medium truncate">{example.title}</span>
              </div>
              <span className="text-xs text-purple-300/80 w-full truncate">{example.description}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
