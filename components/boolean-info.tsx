"use client"

import { Info, Code } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function BooleanInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-purple-400 hover:text-white hover:bg-purple-900/50 z-20"
        >
          <Info className="h-5 w-5" />
          <span className="sr-only">Zoek informatie</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/95 border-purple-800/30 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-300 flex items-center gap-2">
            <Code className="h-5 w-5" />
            Boolean Zoeken Gids
          </DialogTitle>
          <DialogDescription className="text-purple-200/90">
            Leer hoe je krachtige zoekopdrachten maakt voor professionele sourcing
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-3">Basis Boolean Operatoren</h3>
            <div className="overflow-hidden rounded-md border border-purple-800/30">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-purple-800/50 bg-purple-900/30">
                    <th className="text-left py-2 px-4 text-purple-200">Operator</th>
                    <th className="text-left py-2 px-4 text-purple-200">Uitleg</th>
                    <th className="text-left py-2 px-4 text-purple-200">Voorbeeld</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">AND</td>
                    <td className="py-2 px-4">Beide termen moeten aanwezig zijn</td>
                    <td className="py-2 px-4 font-mono text-green-400">Java AND Spring</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">OR</td>
                    <td className="py-2 px-4">Eén van de termen moet aanwezig zijn</td>
                    <td className="py-2 px-4 font-mono text-green-400">React OR Vue</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">NOT</td>
                    <td className="py-2 px-4">Sluit termen uit</td>
                    <td className="py-2 px-4 font-mono text-green-400">DevOps NOT AWS</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">""</td>
                    <td className="py-2 px-4">Exacte woordgroep</td>
                    <td className="py-2 px-4 font-mono text-green-400">"full stack developer"</td>
                  </tr>
                  <tr className="hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">()</td>
                    <td className="py-2 px-4">Groeperen van termen</td>
                    <td className="py-2 px-4 font-mono text-green-400">
                      ("Java developer" OR "backend engineer") AND Spring
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-3">X-ray Zoek Operatoren</h3>
            <div className="overflow-hidden rounded-md border border-purple-800/30">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-purple-800/50 bg-purple-900/30">
                    <th className="text-left py-2 px-4 text-purple-200">Operator</th>
                    <th className="text-left py-2 px-4 text-purple-200">Doel</th>
                    <th className="text-left py-2 px-4 text-purple-200">Voorbeeld</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">site:</td>
                    <td className="py-2 px-4">Beperk je zoekopdracht tot 1 domein</td>
                    <td className="py-2 px-4 font-mono text-green-400">site:linkedin.com/in</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">intitle:</td>
                    <td className="py-2 px-4">Term in de paginatitel</td>
                    <td className="py-2 px-4 font-mono text-green-400">intitle:"DevOps"</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">inurl:</td>
                    <td className="py-2 px-4">Term in de URL</td>
                    <td className="py-2 px-4 font-mono text-green-400">inurl:"github"</td>
                  </tr>
                  <tr className="border-b border-purple-800/20 hover:bg-purple-900/10">
                    <td className="py-2 px-4 font-mono text-purple-300">*</td>
                    <td className="py-2 px-4">Wildcard: onbekende term</td>
                    <td className="py-2 px-4 font-mono text-green-400">developer * Kubernetes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-purple-900/20 p-4 rounded-md border border-purple-800/30">
            <h3 className="font-medium text-purple-300 mb-2">LinkedIn X-ray tips</h3>
            <ul className="space-y-2 text-purple-200/90 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></div>
                <span>
                  Begin altijd met <code className="bg-black/30 px-1 py-0.5 rounded">site:linkedin.com/in</code> om
                  alleen profielen te vinden
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></div>
                <span>
                  Gebruik <code className="bg-black/30 px-1 py-0.5 rounded">intitle:</code> voor functietitels die in de
                  LinkedIn titel staan
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></div>
                <span>
                  Sluit recruiters uit met{" "}
                  <code className="bg-black/30 px-1 py-0.5 rounded">-recruiter -"talent acquisition" -HR</code>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
