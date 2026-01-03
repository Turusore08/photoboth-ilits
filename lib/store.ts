import useSWR from "swr"

export type FrameConfig = {
  id: string
  name: string
  url: string
  slots: { x: number; y: number; width: number; height: number }[]
}

// lib/store.ts
export const FRAMES: FrameConfig[] = [
  {
    id: "force-x",
    name: "Force x Illits",
    url: "/images/force-20x-20illits.png",
    slots: [
      { x: 72, y: 70, width: 460, height: 450 }, // Slot 1 (Atas)
      { x: 72, y: 560, width: 460, height: 450 }, // Slot 2 (Tengah)
      { x: 72, y: 1050, width: 460, height: 450 }, // Slot 3 (Bawah)
    ],
  },
  {
    id: "calon-anak",
    name: "Calon Anak ITS",
    url: "/images/calon-20anak-20its.png",
    slots: [
      { x: 50, y: 150, width: 500, height: 450 },
      { x: 50, y: 650, width: 500, height: 450 },
      { x: 50, y: 1150, width: 500, height: 450 },
    ],
  },
];

export function usePurikuraStore() {
  const { data: selectedFrameId, mutate: setSelectedFrameId } = useSWR("frame", null, { fallbackData: FRAMES[0].id })
  const { data: photos, mutate: setPhotos } = useSWR("photos", null, { fallbackData: [] as string[] })
  const { data: finalImage, mutate: setFinalImage } = useSWR("finalImage", null, {
    fallbackData: null as string | null,
  })

  const selectedFrame = FRAMES.find((f) => f.id === selectedFrameId) || FRAMES[0]

  return {
    selectedFrame,
    setSelectedFrame: (id: string) => setSelectedFrameId(id),
    photos,
    setPhotos: (newPhotos: string[]) => setPhotos(newPhotos),
    finalImage,
    setFinalImage: (img: string | null) => setFinalImage(img),
    reset: () => {
      setPhotos([])
      setFinalImage(null)
    },
  }
}
