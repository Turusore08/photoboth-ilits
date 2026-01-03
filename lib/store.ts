import useSWR from "swr"

export type FrameConfig = {
  id: string
  name: string
  url: string
  slots: { x: number; y: number; width: number; height: number }[]
}

export const FRAMES: FrameConfig[] = [
  {
    id: "force-x",
    name: "Force x Illits",
    url: "/images/force-20x-20illits.png",
    slots: [
      { x: 135, y: 50, width: 330, height: 350 },
      { x: 135, y: 310, width: 330, height: 350 },
      { x: 135, y: 575, width: 330, height: 350 },
    ],
  },
  {
    id: "calon-anak",
    name: "Calon Anak ITS",
    url: "/images/calon-20anak-20its.png",
    slots: [
      { x: 135, y: 50, width: 330, height: 350 },
      { x: 135, y: 310, width: 330, height: 350 },
      { x: 135, y: 575, width: 330, height: 350 },
    ],
  },
]

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
