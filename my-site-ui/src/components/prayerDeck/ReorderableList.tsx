import React, { useRef, useState, useEffect } from "react";

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  className: string;
  style: React.CSSProperties;
}

interface ReorderableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, dragHandleProps: DragHandleProps) => React.ReactNode;
  className?: string;
}

export function ReorderableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  className,
}: ReorderableListProps<T>) {
  const idOrder = items.map(getId);
  const [order, setOrder] = useState<string[]>(idOrder);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setOrder(items.map(getId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrder.join(",")]);

  const itemsById = new Map(items.map((i) => [getId(i), i]));
  const orderedItems = order
    .map((id) => itemsById.get(id))
    .filter((x): x is T => Boolean(x));

  function handlePointerDown(id: string) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      setDraggingId(id);

      function handlePointerMove(ev: PointerEvent) {
        const y = ev.clientY;
        setOrder((prevOrder) => {
          const dragIndex = prevOrder.indexOf(id);
          let targetIndex = prevOrder.length - 1;

          for (let i = 0; i < prevOrder.length; i++) {
            const el = itemRefs.current.get(prevOrder[i]);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
              targetIndex = i;
              break;
            }
          }
          if (targetIndex === dragIndex) return prevOrder;

          const next = [...prevOrder];
          next.splice(dragIndex, 1);
          next.splice(targetIndex, 0, id);
          return next;
        });
      }

      function handlePointerUp() {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        setDraggingId(null);
        setOrder((finalOrder) => {
          const reordered = finalOrder
            .map((oid) => itemsById.get(oid))
            .filter((x): x is T => Boolean(x));
          onReorder(reordered);
          return finalOrder;
        });
      }

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    };
  }

  return (
    <div className={className}>
      {orderedItems.map((item) => {
        const id = getId(item);
        return (
          <div
            key={id}
            ref={(el) => {
              if (el) itemRefs.current.set(id, el);
              else itemRefs.current.delete(id);
            }}
            className={draggingId === id ? "opacity-50" : ""}
          >
            {renderItem(item, {
              onPointerDown: handlePointerDown(id),
              className: "cursor-grab active:cursor-grabbing touch-none select-none",
              style: { touchAction: "none" },
            })}
          </div>
        );
      })}
    </div>
  );
}
