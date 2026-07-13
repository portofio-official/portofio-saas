import { Trash } from "@phosphor-icons/react/dist/ssr";
import { FormPanel } from "@/components/ui/FormPanel";

export function RepeatableSection<T>({
  eyebrow,
  title,
  items,
  onChange,
  newItem,
  renderRow,
  addLabel,
  removeLabel,
}: {
  eyebrow: string;
  title: string;
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

  return (
    <FormPanel eyebrow={eyebrow} title={title}>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-black/[0.07]"
          >
            {renderRow(item, (patch) => updateRow(index, patch))}
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="inline-flex w-max items-center gap-1.5 text-[13px] text-ink-soft hover:text-danger"
            >
              <Trash size={14} weight="light" />
              {removeLabel}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="inline-flex w-max items-center gap-1.5 rounded-full bg-black/[0.04] px-4 py-2 text-sm font-medium text-ink hover:bg-black/[0.07]"
        >
          {addLabel}
        </button>
      </div>
    </FormPanel>
  );
}
