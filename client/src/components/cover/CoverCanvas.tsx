import { useEffect, useRef, useState } from "react";
import {
  coverWidth,
  COVER_HEIGHT,
  COVER_WIDTH,
  coverLayout,
  textLabels,
  type CoverProject,
  type CoverView,
  type TextKey,
} from "@/lib/cover/model";
import { renderCover, type TextBox } from "@/lib/cover/render";
type Props = {
  project: CoverProject;
  view: CoverView;
  guides: boolean;
  selected: TextKey;
  onSelect: (key: TextKey) => void;
  onChange: (p: CoverProject, record?: boolean) => void;
  onCheckpoint: () => void;
  onReady: (image: HTMLImageElement | null) => void;
  onError: (message: string) => void;
};
export default function CoverCanvas({
  project,
  view,
  guides,
  selected,
  onSelect,
  onChange,
  onCheckpoint,
  onReady,
  onError,
}: Props) {
  const geometry = coverLayout(project, view);
  const canvas = useRef<HTMLCanvasElement>(null);
  const boxes = useRef<TextBox[]>([]);
  const drag = useRef<{
    key: TextKey;
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let active = true;
    setImage(null);
    onReady(null);
    if (project.image) {
      const img = new Image();
      img.src = project.image.data;
      img
        .decode()
        .then(() => {
          if (active) {
            setImage(img);
            onReady(img);
          }
        })
        .catch(() => {
          if (active)
            onError("Tallennettua kuvaa ei voitu avata. Lisää kuva uudelleen.");
        });
    }
    return () => {
      active = false;
    };
  }, [project.image?.data, onReady, onError]);
  useEffect(() => {
    if (!canvas.current) return;
    boxes.current = renderCover(canvas.current, project, view, {
      image,
      guides,
      selected,
    });
  }, [project, view, image, guides, selected]);
  function coordinates(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * geometry.canvasWidth,
      y: ((e.clientY - r.top) / r.height) * geometry.canvasHeight,
    };
  }
  return (
    <canvas
      ref={canvas}
      className={"cover-art " + (view === "spread" ? "cover-art-spread" : "")}
      width={1200}
      height={Math.round((1200 / geometry.canvasWidth) * geometry.canvasHeight)}
      style={{
        aspectRatio: String(geometry.canvasWidth / geometry.canvasHeight),
      }}
      tabIndex={0}
      aria-label={
        (view === "front"
          ? "Etukansi"
          : view === "back"
            ? "Takakansi"
            : "Koko kansi") +
        ". Valittu teksti: " +
        textLabels[selected] +
        ". Siirrä tekstiä nuolinäppäimillä, tarkemmin tekstiasetuksista."
      }
      onPointerDown={e => {
        const point = coordinates(e);
        const hit = [...boxes.current]
          .reverse()
          .find(
            b =>
              point.x >= b.x - 8 &&
              point.x <= b.x + b.width + 8 &&
              point.y >= b.y - 8 &&
              point.y <= b.y + b.height + 8
          );
        if (!hit) return;
        onSelect(hit.key);
        if (hit.key === "spine") return;
        onCheckpoint();
        const pos = project.positions[hit.key];
        drag.current = {
          key: hit.key,
          x: point.x,
          y: point.y,
          px: pos.x,
          py: pos.y,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.focus();
      }}
      onPointerMove={e => {
        const d = drag.current;
        if (!d) return;
        const point = coordinates(e);
        const x = Math.max(
            0.08,
            Math.min(0.92, d.px + (point.x - d.x) / COVER_WIDTH)
          ),
          y = Math.max(
            0.06,
            Math.min(0.92, d.py + (point.y - d.y) / geometry.height)
          );
        onChange(
          {
            ...project,
            positions: {
              ...project.positions,
              [d.key]: { ...project.positions[d.key], x, y },
            },
          },
          false
        );
      }}
      onPointerUp={e => {
        drag.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={e => {
        if (
          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        )
          return;
        if (
          (view === "back" && selected !== "back") ||
          (view === "front" && (selected === "back" || selected === "spine"))
        )
          return;
        e.preventDefault();
        const step = e.shiftKey ? 0.025 : 0.005;
        const pos = project.positions[selected];
        onChange({
          ...project,
          positions: {
            ...project.positions,
            [selected]: {
              ...pos,
              x: Math.max(
                0.08,
                Math.min(
                  0.92,
                  pos.x +
                    (e.key === "ArrowLeft"
                      ? -step
                      : e.key === "ArrowRight"
                        ? step
                        : 0)
                )
              ),
              y: Math.max(
                0.06,
                Math.min(
                  0.92,
                  pos.y +
                    (e.key === "ArrowUp"
                      ? -step
                      : e.key === "ArrowDown"
                        ? step
                        : 0)
                )
              ),
            },
          },
        });
      }}
    >
      Esikatselu tarvitsee selaimen piirto-ominaisuuden. Kannen muokkaamiseen
      voi käyttää myös viereisiä tekstikenttiä.
    </canvas>
  );
}
