/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormPanel } from "@/components/ui/FormPanel";
import { useState } from "react";

export function RepeatableSection<T>({
  eyebrow,
  title,
  description,
  items,
  onChange,
  newItem,
  renderRow,
  addLabel,
  removeLabel,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
  removeLabel: string;
}) {
  function addRow() {
    onChange([...items, newItem()]);
  }

  function updateRow(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Slightly delay class addition so the drag ghost looks normal
    setTimeout(() => {
      (e.target as HTMLElement).classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(null);
    (e.target as HTMLElement).classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    onChange(newItems);
  };

  return (
    <FormPanel title={title} description={description}>
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-black/[0.02] border border-dashed border-black/10 rounded-xl text-center">
            <span className="text-[12px] text-ink-soft mb-3 leading-relaxed">
              {description || `Add your first ${title ? title.toLowerCase() : "item"} to get started.`}
            </span>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              {addLabel}
            </button>
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex flex-col gap-3 rounded-[1rem] p-4 ring-1 bg-white shadow-sm transition-all relative ${
                  draggedIndex === index ? "ring-accent border-dashed opacity-50" : "ring-black/5 hover:ring-black/10"
                }`}
              >
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink-soft px-1 hidden md:block">
                  <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                </div>
                <div className="md:pl-6">
                  {renderRow(item, (patch) => updateRow(index, patch))}
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="inline-flex w-max items-center gap-1.5 text-[12px] font-semibold text-danger/70 hover:text-danger transition-colors mt-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    {removeLabel}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="inline-flex w-full justify-center items-center gap-1.5 rounded-[1rem] bg-black/[0.03] px-4 py-2.5 text-[12px] font-bold text-ink hover:bg-black/[0.06] transition-colors"
            >
              {addLabel}
            </button>
          </>
        )}
      </div>
    </FormPanel>
  );
}
