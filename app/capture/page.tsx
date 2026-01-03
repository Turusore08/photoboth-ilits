"use client"

import { useRef, useCallback, useState } from "react"
import Webcam from "react-webcam"
import { usePurikuraStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, ArrowLeft, Wand2, Sparkles, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CapturePage() {
  const { selectedFrame, photos, setPhotos, setFinalImage } = usePurikuraStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const router = useRouter()

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc && photos.length < 3) {
      setPhotos([...photos, imageSrc])
    }
  }, [photos, setPhotos])

  const generateStrip = async () => {
    setIsProcessing(true)
    
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 600
      canvas.height = 1800
      const ctx = canvas.getContext("2d")
      
      if (!ctx) throw new Error("Could not get canvas context")

      // 1. Setup Background (Putih)
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Load & Draw Frame (Background Layer)
      // Kita bungkus dalam Promise yang bisa Reject jika gagal
      const frameImg = new Image()
      frameImg.crossOrigin = "anonymous"
      frameImg.src = selectedFrame.url

      try {
        await new Promise((resolve, reject) => {
            frameImg.onload = resolve
            frameImg.onerror = () => reject(new Error(`Failed to load frame: ${selectedFrame.url}`))
        })
        // Validasi tambahan: pastikan gambar punya dimensi
        if (frameImg.naturalWidth > 0) {
            ctx.drawImage(frameImg, 0, 0, 600, 1800)
        }
      } catch (e) {
        console.error("Frame error:", e)
        // Jika frame gagal, kita lanjut saja agar user minimal dapat fotonya (Graceful Degradation)
      }

      // 3. Load & Draw Photos (Overlay Layer)
      for (let i = 0; i < 3; i++) {
        if (photos[i]) {
          const img = new Image()
          img.src = photos[i]
          
          try {
            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = () => reject(new Error(`Failed to load photo index ${i}`))
            })

            const slot = selectedFrame.slots[i]
            if (slot && img.naturalWidth > 0) {
                // --- UPDATE PENTING DI SINI ---
                
                // 1. Simpan state canvas sebelum melakukan manipulasi aneh-aneh
                ctx.save()

                // 2. Buat jalur kotak (Path) sesuai ukuran Slot
                ctx.beginPath()
                ctx.rect(slot.x, slot.y, slot.width, slot.height)
                
                // 3. Aktifkan mode "Gunting" (Clip)
                // Apapun yang digambar setelah ini HANYA akan muncul di dalam kotak di atas
                ctx.clip()

                // 4. Hitung Dimensi (Logic Object-Cover)
                const scale = Math.max(slot.width / img.width, slot.height / img.height)
                const w = img.width * scale
                const h = img.height * scale
                
                // Tengahkan gambar (Center Alignment)
                const x = slot.x + (slot.width - w) / 2
                const y = slot.y + (slot.height - h) / 2
                
                // 5. Gambar Foto
                // Meskipun x/y melebar kemana-mana, canvas akan otomatis memotongnya
                ctx.drawImage(img, x, y, w, h)

                // 6. Kembalikan state canvas agar slot berikutnya tidak terpengaruh clipping ini
                ctx.restore()
            }
          } catch (e) {
            console.error(`Photo ${i} skipped:`, e)
          }
        }
      }

      // 4. Finalisasi
      const dataUrl = canvas.toDataURL("image/png")
      setFinalImage(dataUrl)
      router.push("/result")

    } catch (error) {
      console.error("Critical error generating strip:", error)
      alert("Gagal memproses gambar. Silakan coba lagi.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-purikura-cream p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 max-w-6xl mx-auto">
      
      {/* SECTION 1: Real-time Preview */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-purikura-pink">Live Preview</h2>
        
        <div className="relative w-[300px] h-[900px] bg-white rounded-lg shadow-2xl overflow-hidden border-8 border-white ring-4 ring-purikura-pink/20">
          
          {/* --- PERBAIKAN LOGIKA CSS (VISUAL) --- */}
          
          {/* LAYER 1 (BAWAH): Frame Gambar */}
          {/* Z-Index 0 agar berada di belakang */}
          <img
            src={selectedFrame.url}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            alt="Frame Background"
          />

          {/* LAYER 2 (ATAS): Slot Foto */}
          {/* Z-Index 10 agar foto muncul DI ATAS frame yang tidak transparan */}
          <div className="absolute inset-0 z-10">
            {selectedFrame.slots.map((slot, i) => (
              <div
                key={i}
                // Hapus background gray jika ingin terlihat menyatu, atau biarkan untuk debug
                className="absolute flex items-center justify-center overflow-hidden"
                style={{
                  left: `${(slot.x / 600) * 100}%`,
                  top: `${(slot.y / 1800) * 100}%`,
                  width: `${(slot.width / 600) * 100}%`,
                  height: `${(slot.height / 1800) * 100}%`,
                }}
              >
                {photos[i] ? (
                  <img
                    src={photos[i]}
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95"
                    alt={`Capture ${i + 1}`}
                  />
                ) : (
                  // Opsional: Border putus-putus agar user tahu di mana posisi foto akan muncul
                  <div className="w-full h-full border-2 border-dashed border-white/50 flex items-center justify-center">
                      <Camera className="text-white/50 w-8 h-8 drop-shadow-md" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div> 

      {/* SECTION 2: Camera Controls */}
      <div className="space-y-6">
        <Card className="p-6 border-purikura-pink/20 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-purikura-pink">Take 3 Photos</h3>
            <div className="bg-purikura-pink text-white px-4 py-1 rounded-full font-bold">
              {photos.length} / 3
            </div>
          </div>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white mb-6">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={capture}
              disabled={photos.length >= 3}
              className="flex-1 h-16 text-xl rounded-full bg-purikura-pink hover:bg-purikura-pink/90 shadow-lg"
            >
              <Camera className="mr-2 h-6 w-6" /> Capture
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setPhotos([])}
              className="h-16 w-16 rounded-full border-purikura-pink text-purikura-pink"
            >
              <RefreshCw className="h-6 w-6" />
            </Button>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")} 
            className="h-14 rounded-full text-purikura-lavender"
          >
            <ArrowLeft className="mr-2" /> Change Frame
          </Button>
          <Button
            size="lg"
            disabled={photos.length < 3 || isProcessing}
            onClick={generateStrip}
            className="flex-1 h-14 text-xl rounded-full bg-gradient-to-r from-purikura-pink to-purikura-lavender shadow-xl"
          >
            {isProcessing ? (
              <Wand2 className="mr-2 animate-spin" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Generate Strip
          </Button>
        </div>
      </div>
    </main>
  )
}