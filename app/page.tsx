"use client"

import { usePurikuraStore, FRAMES } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function FrameSelectionPage() {
  const { selectedFrame, setSelectedFrame } = usePurikuraStore()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-purikura-cream p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-purikura-pink flex items-center justify-center gap-2">
            <Sparkles className="text-purikura-lavender" />
            Pick Your Frame
            <Sparkles className="text-purikura-lavender" />
          </h1>
          <p className="text-purikura-lavender">Select a cute design to start your photoshoot</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FRAMES.map((frame) => (
            <Card
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className={cn(
                "relative group cursor-pointer overflow-hidden border-4 transition-all hover:scale-[1.02]",
                selectedFrame.id === frame.id
                  ? "border-purikura-pink ring-8 ring-purikura-pink/20"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <div className="aspect-[1/3] relative">
                <img src={frame.url || "/placeholder.svg"} alt={frame.name} className="w-full h-full object-cover" />
                <div
                  className={cn(
                    "absolute inset-0 bg-purikura-pink/10 transition-opacity",
                    selectedFrame.id === frame.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                />
              </div>
              <div className="p-4 text-center bg-white">
                <h3 className="text-xl font-bold text-purikura-pink">{frame.name}</h3>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            onClick={() => router.push("/capture")}
            className="h-16 px-12 text-xl rounded-full bg-purikura-pink shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Next Step <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  )
}
