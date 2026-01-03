"use client"

import { usePurikuraStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, ArrowLeft, Share2, Sparkles } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ResultPage() {
  const { finalImage, reset } = usePurikuraStore()
  const router = useRouter()

  useEffect(() => {
    if (!finalImage) router.push("/")
  }, [finalImage, router])

  if (!finalImage) return null

  const downloadImage = () => {
    const link = document.createElement("a")
    link.download = `purikura-${Date.now()}.png`
    link.href = finalImage
    link.click()
  }

  return (
    <main className="min-h-screen bg-purikura-cream p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-purikura-pink flex items-center justify-center gap-3">
            <Sparkles className="animate-sparkle" />
            Purikura Ready!
            <Sparkles className="animate-sparkle" />
          </h1>
          <p className="text-purikura-lavender text-lg">Download or scan the QR code to save to your phone</p>
        </header>

        <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purikura-pink to-purikura-lavender opacity-20 blur-xl rounded-[2rem]" />
            <img
              src={finalImage || "/placeholder.svg"}
              alt="Final Strip"
              className="relative w-[280px] h-[840px] rounded-lg shadow-2xl border-8 border-white"
            />
          </div>

          <div className="flex flex-col gap-6 items-center md:items-start w-full max-w-sm">
            <Card className="p-8 border-4 border-purikura-pink/10 shadow-xl bg-white flex flex-col items-center gap-4 w-full">
              <div className="bg-purikura-pink/5 p-4 rounded-2xl">
                <QRCodeSVG value={finalImage.slice(0, 1000)} size={200} />
              </div>
              <p className="text-sm font-bold text-purikura-pink tracking-widest uppercase">Scan to save</p>
            </Card>

            <div className="flex flex-col gap-3 w-full">
              <Button size="lg" onClick={downloadImage} className="h-14 rounded-full bg-purikura-pink shadow-lg">
                <Download className="mr-2" /> Download PNG
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-purikura-lavender text-purikura-lavender bg-transparent"
              >
                <Share2 className="mr-2" /> Share
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  reset()
                  router.push("/")
                }}
                className="h-12 rounded-full text-muted-foreground"
              >
                <ArrowLeft className="mr-2" /> Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
