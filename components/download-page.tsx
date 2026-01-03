"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, ArrowLeft, Share2, Sparkles } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface DownloadPageProps {
  imageData: string
  onBack: () => void
}

export function DownloadPage({ imageData, onBack }: DownloadPageProps) {
  const downloadImage = () => {
    const link = document.createElement("a")
    link.download = `purikura-${Date.now()}.png`
    link.href = imageData
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-purikura-pink flex items-center justify-center gap-3">
          <Sparkles className="animate-sparkle" />
          Yay! Your Purikura is Ready!
          <Sparkles className="animate-sparkle" />
        </h1>
        <p className="text-purikura-lavender text-lg">Scan the QR code to download to your phone</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        {/* Strip Preview */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-purikura-pink via-purikura-lavender to-purikura-mint opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-[2rem]" />
          <img
            src={imageData || "/placeholder.svg"}
            alt="Final Photobox Strip"
            className="relative w-[280px] h-[840px] rounded-lg shadow-2xl border-8 border-white"
          />
        </div>

        {/* Actions & QR */}
        <div className="flex flex-col gap-8 items-center md:items-start">
          <Card className="p-8 border-4 border-purikura-mint/20 shadow-xl bg-white flex flex-col items-center gap-4 text-center">
            <div className="bg-purikura-mint/10 p-4 rounded-2xl">
              <QRCodeSVG value={imageData.slice(0, 1000)} size={180} level="L" />
            </div>
            <p className="text-sm font-bold text-purikura-mint uppercase tracking-widest">Scan to share</p>
          </Card>

          <div className="flex flex-col gap-3 w-full">
            <Button
              size="lg"
              onClick={downloadImage}
              className="h-14 rounded-full bg-purikura-pink shadow-lg hover:bg-purikura-pink/90"
            >
              <Download className="mr-2 h-5 w-5" /> Download PNG
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "My Purikura",
                    text: "Check out my Japanese photobox strip!",
                    url: window.location.href,
                  })
                }
              }}
              className="h-14 rounded-full border-purikura-lavender text-purikura-lavender"
            >
              <Share2 className="mr-2 h-5 w-5" /> Share with friends
            </Button>
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-12 rounded-full text-muted-foreground hover:text-purikura-pink"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
