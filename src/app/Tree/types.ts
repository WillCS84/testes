import { attachInstruction, extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"
import { DropIndicator } from "./functions"

export type Instruction =
  | {
      type: "reorder-above"
      currentLevel: number
      indentPerLevel: number
    }
  | {
      type: "reorder-below"
      currentLevel: number
      indentPerLevel: number
    }
  | {
      type: "make-child"
      currentLevel: number
      indentPerLevel: number
    }
  | {
      type: "reparent"
      currentLevel: number
      indentPerLevel: number
      desiredLevel: number
    }
  | {
      type: "instruction-blocked"
      desired: Exclude<Instruction, { type: "instruction-blocked" }>
    }

export type TreeAction =
  | {
      type: "instruction"
      instruction: Instruction
      itemId: string
      targetId: string
    }
  | {
      type: "toggle"
      itemId: string
    }
  | {
      type: "expand"
      itemId: string
    }
  | {
      type: "collapse"
      itemId: string
    }
  | {
      type: "modal-move"
      itemId: string
      targetId: string
      index: number
    }

export type TreeItem = {
  id: string
  isDraft?: boolean
  children: TreeItem[]
  isOpen?: boolean
}

export type TreeContextValue = {
  dispatch: (action: TreeAction) => void
  uniqueContextId: Symbol
  getPathToItem: (itemId: string) => string[]
  getMoveTargets: ({ itemId }: { itemId: string }) => TreeItem[]
  getChildrenOfItem: (itemId: string) => TreeItem[]
  registerTreeItem: (args: { itemId: string; element: HTMLElement; actionMenuTrigger: HTMLElement }) => void
}

export type TreeState = {
  lastAction: TreeAction | null
  data: TreeItem[]
}

export type CleanupFn = () => void

export type ItemMode = "standard" | "expanded" | "last-in-group"

export type DependencyContextType = {
  DropIndicator: typeof DropIndicator
  attachInstruction: typeof attachInstruction
  extractInstruction: typeof extractInstruction
}

export type DropIndicatorProps = {
  instruction: Instruction
}

