"use client"

import { useCallback, useMemo, useReducer, useRef, useState } from "react"
import { TreeContext } from "./context"
import { ItemMode, TreeContextValue } from "./types"
import memoizeOne from "memoize-one"
import { createTreeItemRegistry, getInitialTreeState, tree, treeStateReducer } from "./functions"
import { type TreeItem as TreeItemType } from "./types"
import invariant from "tiny-invariant"
import TreeItem from "./TreeItem"

export default function TreeComponent() {
  const [state, updateState] = useReducer(treeStateReducer, null, getInitialTreeState)
  const { data, lastAction } = state
  let lastStateRef = useRef<TreeItemType[]>(data)
  const [{ registry, registerTreeItem }] = useState(createTreeItemRegistry)

  const getChildrenOfItem = useCallback((itemId: string) => {
    const data = lastStateRef.current
    if (itemId === "") {
      return data
    }

    const item = tree.find(data, itemId)
    invariant(item)
    return item.children
  }, [])

  const getMoveTargets = useCallback(({ itemId }: { itemId: string }) => {
    const data = lastStateRef.current

    const targets = []

    const searchStack = Array.from(data)
    while (searchStack.length > 0) {
      const node = searchStack.pop()

      if (!node) {
        continue
      }

      if (node.id === itemId) {
        continue
      }

      if (node.isDraft) {
        continue
      }

      targets.push(node)

      node.children.forEach((childNode) => searchStack.push(childNode))
    }

    return targets
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

  return (
    <TreeContext.Provider value={context}>
      <div style={{ display: "block", justifyContent: "center", padding: 24 }}>
        {data.map((item, index, array) => {
          const type: ItemMode = (() => {
            if (item.children.length && item.isOpen) {
              return "expanded"
            }

            if (index === array.length - 1) {
              return "last-in-group"
            }

            return "standard"
          })()
          return <TreeItem item={item} level={0} key={item.id} mode={type} index={index} />
        })}
      </div>
    </TreeContext.Provider>
  )
}

