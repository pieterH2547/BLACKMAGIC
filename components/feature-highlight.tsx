import { Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

export function FeatureHighlight() {
  return (
    <Card className="glass-card p-5 border-purple-800/20 card-hover gradient-border">
      <h2 className="heading-md mb-3 text-purple-300 flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Hoe het werkt
      </h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-800/50 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-200">1</span>
          </div>
          <p className="text-sm text-purple-200">Beschrijf je ideale kandidaat of upload een vacature</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-800/50 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-200">2</span>
          </div>
          <p className="text-sm text-purple-200">AI genereert een optimale Boolean zoekopdracht</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-800/50 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-200">3</span>
          </div>
          <p className="text-sm text-purple-200">Bekijk resultaten direct in de app of op LinkedIn</p>
        </div>
      </div>
    </Card>
  )
}
