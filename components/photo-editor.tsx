"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { FrameConfig } from "@/app/page"
import { Camera, Upload, Sparkles, Wand2 } from "lucide-react"
import Webcam from "react-webcam"
import { cn } from "@/lib/utils"

interface PhotoEditorProps {
  frames: FrameConfig[]
  selectedFrame: FrameConfig
  onSelectFrame: (frame: FrameConfig) => void
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  onGenerate: (imageData: string) => void
}

export function PhotoEditor({
  frames,
  selectedFrame,
  onSelectFrame,
  photos,
  onPhotosChange,
  onGenerate,
}: PhotoEditorProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc && photos.length < 3) {
      onPhotosChange([...photos, imageSrc])
    }
  }, [webcamRef, photos, onPhotosChange])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (photos.length < 3) {
          onPhotosChange([...photos, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const generateStrip = async () => {
    setIsProcessing(true)
    const canvas = document.createElement("canvas")
    canvas.width = 600
    canvas.height = 1800
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 1. Draw Photos
    for (let i = 0; i < 3; i++) {
      if (photos[i]) {
        const img = new Image()
        img.src = photos[i]
        await new Promise((resolve) => (img.onload = resolve))

        const slot = selectedFrame.slots[i]
        // Center crop and draw
        const scale = Math.max(slot.width / img.width, slot.height / img.height)
        const w = img.width * scale
        const h = img.height * scale
        const x = slot.x + (slot.width - w) / 2
        const y = slot.y + (slot.height - h) / 2

        ctx.drawImage(img, x, y, w, h)
      }
    }

    // 2. Draw Frame Overlay
    const frameImg = new Image()
    frameImg.crossOrigin = "anonymous"
    frameImg.src = selectedFrame.url
    await new Promise((resolve) => (frameImg.onload = resolve))
    ctx.drawImage(frameImg, 0, 0, 600, 1800)

    onGenerate(canvas.toDataURL("image/png"))
    setIsProcessing(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 max-w-6xl mx-auto items-start">
      {/* Left Panel: Preview */}
      <div className="flex flex-col items-center gap-4 sticky top-8">
        <h2 className="text-2xl font-bold text-purikura-pink">Preview</h2>
        <div className="relative w-[300px] h-[900px] bg-white rounded-lg shadow-2xl overflow-hidden border-8 border-white ring-4 ring-purikura-pink/20">
          {/* Photos Layer moved BEFORE Frame Background to allow transparency if frames have cutouts, 
              but since the user asked to "merge", we ensure photos are rendered in their designated slots. */}
          <div className="absolute inset-0 z-0">
            {selectedFrame.slots.map((slot, i) => (
              <div
                key={i}
                className="absolute bg-purikura-lavender/5 flex items-center justify-center overflow-hidden transition-all duration-500"
                style={{
                  left: `${(slot.x / 600) * 100}%`,
                  top: `${(slot.y / 1800) * 100}%`,
                  width: `${(slot.width / 600) * 100}%`,
                  height: `${(slot.height / 1800) * 100}%`,
                }}
              >
                {photos[i] ? (
                  <img
                    src={photos[i] || "/placeholder.svg"}
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                    alt={`Photo ${i + 1}`}
                  />
                ) : (
                  <Camera className="text-purikura-pink/10 w-12 h-12" />
                )}
              </div>
            ))}
          </div>

          <img
            src={selectedFrame.url || "/placeholder.svg"}
            alt="Selected Frame"
            className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
          />
        </div>
      </div>

      {/* Right Panel: Controls */}
      <div className="flex flex-col gap-6">
        <Card className="p-6 border-purikura-pink/20 shadow-xl bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 text-purikura-pink">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-xl font-bold">Step 1: Choose Your Frame</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => onSelectFrame(frame)}
                className={cn(
                  "relative aspect-[1/3] rounded-lg overflow-hidden border-4 transition-all hover:scale-105",
                  selectedFrame.id === frame.id
                    ? "border-purikura-pink ring-4 ring-purikura-pink/20"
                    : "border-transparent",
                )}
              >
                <img src={frame.url || "/placeholder.svg"} className="w-full h-full object-cover" alt={frame.name} />
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1 text-center font-sans">
                  {frame.name}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-purikura-lavender/20 shadow-xl bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 text-purikura-lavender">
            <Camera className="w-6 h-6" />
            <h3 className="text-xl font-bold">Step 2: Take 3 Photos</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-purikura-pink text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Photo {photos.length} / 3
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={capture}
                disabled={photos.length >= 3}
                className="flex-1 h-12 rounded-full bg-gradient-to-r from-purikura-pink to-purikura-lavender hover:opacity-90 transition-opacity"
              >
                <Camera className="mr-2 h-5 w-5" /> Capture
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full border-purikura-pink text-purikura-pink bg-transparent"
                onClick={() => onPhotosChange([])}
              >
                Reset
              </Button>
              <label className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-dashed border-purikura-lavender text-purikura-lavender cursor-pointer hover:bg-purikura-lavender/5">
                <Upload className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          disabled={photos.length < 3 || isProcessing}
          onClick={generateStrip}
          className="h-16 text-xl rounded-full bg-gradient-to-r from-purikura-pink via-purikura-lavender to-purikura-mint shadow-xl hover:scale-105 active:scale-95 transition-all animate-sparkle"
        >
          {isProcessing ? <Wand2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
          Generate Photobox strip
        </Button>
      </div>
    </div>
  )
}
