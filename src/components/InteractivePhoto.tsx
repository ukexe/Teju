import {
  useRef,
  useState,
  type ImgHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react'
import { Hand, Maximize2, Minus, Plus } from 'lucide-react'
import './interactive-photo.css'

type InteractivePhotoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'draggable'
> & {
  compact?: boolean
}

type Point = {
  x: number
  y: number
}

type PhotoTransform = Point & {
  scale: number
}

const MIN_SCALE = 0.65
const MAX_SCALE = 4

const clampScale = (value: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))

export default function InteractivePhoto({
  alt,
  compact = false,
  ...imageProps
}: InteractivePhotoProps) {
  const [transform, setTransform] = useState<PhotoTransform>({
    x: 0,
    y: 0,
    scale: 1,
  })
  const [adjusting, setAdjusting] = useState(false)
  const pointers = useRef(new Map<number, Point>())
  const previousGesture = useRef<{
    center: Point
    distance: number | null
  } | null>(null)

  const fitPhoto = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  const zoomBy = (factor: number) => {
    setTransform((current) => ({
      ...current,
      scale: clampScale(current.scale * factor),
    }))
  }

  const getGesture = () => {
    const points = [...pointers.current.values()]
    if (points.length === 0) return null

    const center = points.reduce(
      (total, point) => ({
        x: total.x + point.x / points.length,
        y: total.y + point.y / points.length,
      }),
      { x: 0, y: 0 },
    )

    if (points.length === 1) {
      return { center, distance: null }
    }

    const first = points[0]
    const second = points[1]
    return {
      center,
      distance: Math.hypot(second.x - first.x, second.y - first.y),
    }
  }

  const beginPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' && !adjusting) return

    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    previousGesture.current = getGesture()
  }

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const currentGesture = getGesture()
    const previous = previousGesture.current
    if (!currentGesture || !previous) {
      previousGesture.current = currentGesture
      return
    }

    const deltaX = currentGesture.center.x - previous.center.x
    const deltaY = currentGesture.center.y - previous.center.y
    const scaleFactor =
      currentGesture.distance && previous.distance
        ? currentGesture.distance / previous.distance
        : 1

    setTransform((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
      scale: clampScale(current.scale * scaleFactor),
    }))
    previousGesture.current = currentGesture
  }

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    previousGesture.current = getGesture()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!adjusting && !event.ctrlKey) return
    event.preventDefault()
    zoomBy(event.deltaY < 0 ? 1.12 : 0.89)
  }

  return (
    <div
      className={`interactive-photo${adjusting ? ' is-adjusting' : ''}${
        compact ? ' is-compact' : ''
      }`}
      role="group"
      aria-label={`Movable photo: ${alt}`}
      onPointerDown={beginPointer}
      onPointerMove={movePointer}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onWheel={handleWheel}
      onDoubleClick={fitPhoto}
    >
      <img
        {...imageProps}
        alt={alt}
        draggable={false}
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        }}
      />
      <div
        className="photo-controls"
        aria-label={`Controls for ${alt}`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setAdjusting((current) => !current)}
          aria-pressed={adjusting}
          aria-label={adjusting ? 'Finish moving photo' : 'Move photo'}
          title={adjusting ? 'Finish moving photo' : 'Move photo'}
        >
          <Hand aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.82)}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1.22)}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={fitPhoto}
          aria-label="Fit complete photo"
          title="Fit complete photo"
        >
          <Maximize2 aria-hidden="true" />
        </button>
      </div>
      {adjusting && (
        <span className="photo-instruction" role="status">
          Drag or pinch the photo
        </span>
      )}
    </div>
  )
}
