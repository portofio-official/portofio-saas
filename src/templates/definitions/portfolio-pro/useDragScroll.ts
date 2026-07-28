import { useRef } from "react";

// Mouse drag-to-scroll for horizontal carousels — shared by Resume/Courses/Projects.
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    if (!ref.current) return;
    dragging.current = true;
    moved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    startScroll.current = ref.current.scrollLeft;
  }
  function onMouseLeaveOrUp() {
    dragging.current = false;
    setTimeout(() => (moved.current = false), 50);
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 5) moved.current = true;
    ref.current.scrollLeft = startScroll.current - walk;
  }
  return { ref, onMouseDown, onMouseLeave: onMouseLeaveOrUp, onMouseUp: onMouseLeaveOrUp, onMouseMove, wasDragged: () => moved.current };
}
