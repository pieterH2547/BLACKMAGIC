"use client"

import type React from "react"
import { Linkedin, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Platform } from "@/app/actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlatformSelectorProps {
  selectedPlatform: Platform
  onSelectPlatform: (platform: Platform) => void
}

export function PlatformSelector({ selectedPlatform, onSelectPlatform }: PlatformSelectorProps) {
  const platforms: { id: Platform; icon: React.ReactNode; label: string; tooltip: string }[] = [
    {
      id: "linkedin",
      icon: <Linkedin className="h-5 w-5" />,
      label: "LinkedIn",
      tooltip: "site:linkedin.com/in - Zoek naar professionele profielen via Google X-ray search",
    },
    {
      id: "facebook",
      icon: <Facebook className="h-5 w-5" />,
      label: "Facebook",
      tooltip: "Facebook Zoeken - Zoek naar mensen op Facebook (beperkte functionaliteit)",
    },
  ]

  return (
    <div className="space-y-3">
      <label className="form-label">Platform</label>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {platforms.map((platform) => (
            <Tooltip key={platform.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectPlatform(platform.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                    "hover:bg-purple-800/50",
                    selectedPlatform === platform.id
                      ? "bg-gradient-to-r from-purple-700/80 to-purple-800/80 text-white shadow-lg shadow-purple-900/20 border border-purple-500/30"
                      : "bg-black/30 text-purple-300 border border-purple-800/20",
                  )}
                  title={platform.label}
                  aria-label={`Selecteer ${platform.label}`}
                >
                  <div className={selectedPlatform === platform.id ? "relative" : ""}>
                    {platform.icon}
                    {selectedPlatform === platform.id && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                    )}
                  </div>
                  <span>{platform.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black/90 border-purple-800/30 text-purple-100">
                <p>{platform.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  )
}
