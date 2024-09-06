import { StaticImport } from "next/dist/shared/lib/get-img-props";

export type Item = {
  id: string;
  label: string;
  avatar?: string | StaticImport;
};

export type ListState = {
  items: Item[];
  lastCardMoved: {
    item: Item;
    previousIndex: number;
    currentIndex: number;
    numberOfItems: number;
  } | null;
};

export type ItemEntry = { itemId: string; element: HTMLElement };

type CleanupFn = () => void;

export type Edge = "top" | "right" | "bottom" | "left";

export type ListContextValue = {
  getListLength: () => number;
  registerItem: (entry: ItemEntry) => CleanupFn;
  reorderItem: (args: {
    startIndex: number;
    indexOfTarget: number;
    closestEdgeOfTarget: Edge | null;
  }) => void;
  instanceId: symbol;
};

export type ItemPosition = "first" | "last" | "middle" | "only";

export type DraggableState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" };

export type ItemData = {
  [itemKey: symbol]: true;
  item: Item;
  index: number;
  instanceId: symbol;
};
