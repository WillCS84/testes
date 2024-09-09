import { useCallback, useMemo, useReducer } from "react"
import { TreeContext } from "./context"
import { TreeContextValue } from "./types"

export default function TreeComponent() {
  const [updateState, setUpdateState] = useReducer(treeStateReducer, null, getnitialState)

  const getChildrenOfItem = useCallback((itemId: string) => {
    const data = lastStateRef.current
    if (itemId === "") {
      return data
    }

    const item = tree.find(data, itemId)
    invariant(item)
    return item.children
  }, [])

  const context = useMemo<TreeContextValue>(
    () => ({
      dispatch: updateState,
      uniqueContextId: Symbol("unique-id"),
      getPathToItem: memoizeOne(
        (targetId: string) => tree.getPathToItem({ current: lastStateRef.current, targetId }) ?? []
      ),
      getMoveTargets,
      getChildrenOfItem,
      registerTreeItem
    }),
    [getMoveTargets, getChildrenOfItem, registerTreeItem]
  )

  return <TreeContext.Provider value={context}></TreeContext.Provider>
}
