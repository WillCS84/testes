import { createContext } from "react"
import { TreeContextValue } from "./types"

export const TreeContext = createContext<TreeContextValue>({
  dispatch: () => {},
  uniqueContextId: Symbol("uniqueId"),
  getChildrenOfItem: () => [],
  getMoveTargets: () => [],
  getPathToItem: () => [],
  registerTreeItem: () => {}
})
