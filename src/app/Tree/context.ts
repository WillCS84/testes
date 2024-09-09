import { createContext } from "react"
import { DependencyContextType, TreeContextValue } from "./types"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/tree-item"
import { attachInstruction, extractInstruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item"

export const TreeContext = createContext<TreeContextValue>({
  dispatch: () => {},
  uniqueContextId: Symbol("uniqueId"),
  getChildrenOfItem: () => [],
  getMoveTargets: () => [],
  getPathToItem: () => [],
  registerTreeItem: () => {}
})

export const DependencyContext = createContext<DependencyContextType>({
  DropIndicator: DropIndicator,
  attachInstruction: attachInstruction,
  extractInstruction: extractInstruction
})

