"use client";

import { Reorder } from "framer-motion";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export type Entry = { id: string; primary: string; secondary: string; meta: string };

/**
 * Drag-to-reorder list used by Education, Experience and Works.
 *
 * Uses framer-motion's Reorder, which is already a dependency — a dedicated
 * dnd library would be ~35KB for something we already have. Arrow buttons sit
 * alongside for keyboard and touch, which drag alone does not serve.
 */
export default function EntryList({
  entries,
  onReorder,
  onDelete,
  onEdit,
  editLabel = "Edit",
}: {
  entries: Entry[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  editLabel?: string;
}) {
  const [items, setItems] = useState(entries);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const persist = (next: Entry[]) => {
    setItems(next);
    startTransition(async () => {
      await onReorder(next.map((item) => item.id));
    });
  };

  const move = (index: number, delta: number) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-400">
        Nothing here yet.
      </p>
    );
  }

  return (
    <Reorder.Group axis="y" values={items} onReorder={persist} className="space-y-2">
      {items.map((entry, index) => (
        <Reorder.Item
          key={entry.id}
          value={entry}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <span className="cursor-grab select-none text-neutral-300" aria-hidden>
            ≡
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{entry.primary}</p>
            <p className="truncate text-sm text-neutral-500">{entry.secondary}</p>
          </div>

          <span className="hidden shrink-0 text-xs uppercase tracking-[0.2em] text-neutral-400 sm:block">
            {entry.meta}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Move up"
              onClick={() => move(index, -1)}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Move down"
              onClick={() => move(index, 1)}
            >
              ↓
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(entry.id)}>
              {editLabel}
            </Button>

            {confirming === entry.id ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  startTransition(async () => {
                    setItems((current) => current.filter((i) => i.id !== entry.id));
                    setConfirming(null);
                    await onDelete(entry.id);
                  })
                }
              >
                Confirm
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(entry.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
