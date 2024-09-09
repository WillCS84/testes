import { CleanupFn, Instruction, TreeAction, TreeItem, TreeState, type TreeItem as TreeItemType } from "./types"
import invariant from "tiny-invariant"
import { token } from "@atlaskit/tokens"
import ChevronDownIcon from "@atlaskit/icon/glyph/chevron-down"
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right"
import { ReactElement } from "react"
import { css, jsx } from "@emotion/react"

const iconColor = token("color.icon", "#44546F")

export function treeStateReducer(state: TreeState, action: TreeAction): TreeState {
  return {
    data: dataReducer(state.data, action),
    lastAction: action
  }
}

const dataReducer = (data: TreeItem[], action: TreeAction) => {
  console.log("action", action)

  const item = tree.find(data, action.itemId)
  if (!item) {
    return data
  }

  if (action.type === "instruction") {
    const instruction = action.instruction

    if (instruction.type === "reparent") {
      const path = tree.getPathToItem({
        current: data,
        targetId: action.targetId
      })
      invariant(path)
      const desiredId = path[instruction.desiredLevel]
      let result = tree.remove(data, action.itemId)
      result = tree.insertAfter(result, desiredId, item)
      return result
    }

    if (action.itemId === action.targetId) {
      return data
    }

    if (instruction.type === "reorder-above") {
      let result = tree.remove(data, action.itemId)
      result = tree.insertBefore(result, action.targetId, item)
      return result
    }

    if (instruction.type === "make-child") {
      let result = tree.remove(data, action.itemId)
      result = tree.insertChild(result, action.targetId, item)
      return result
    }

    console.log("TODO: action not implemented", instruction)

    return data
  }

  function toggle(item: TreeItem): TreeItem {
    if (!tree.hasChildren(item)) {
      return item
    }

    if (item.id === action.itemId) {
      return { ...item, isOpen: !item.isOpen }
    }
    return { ...item, children: item.children.map(toggle) }
  }

  if (action.type === "toggle") {
    return data.map(toggle)
  }

  if (action.type === "expand") {
    if (tree.hasChildren(item) && !item.isOpen) {
      return data.map(toggle)
    }
    return data
  }

  if (action.type === "collapse") {
    if (tree.hasChildren(item) && item.isOpen) {
      return data.map(toggle)
    }
    return data
  }

  if (action.type === "modal-move") {
    let result = tree.remove(data, item.id)

    const siblingItems = getChildrenItems(result, action.targetId)

    if (siblingItems.length === 0) {
      if (action.targetId === "") {
        result = [item]
      } else {
        result = tree.insertChild(result, action.targetId, item)
      }
    } else if (action.index === siblingItems.length) {
      const relativeTo = siblingItems[siblingItems.length - 1]

      result = tree.insertAfter(result, relativeTo.id, item)
    } else {
      const relativeTo = siblingItems[action.index]
      result = tree.insertBefore(result, relativeTo.id, item)
    }
    return result
  }
  return data
}

export function getChildrenItems(data: TreeItem[], targetId: string) {
  if (targetId === "") {
    return data
  }

  const targetItem = tree.find(data, targetId)
  invariant(targetItem)

  return targetItem.children
}

export const tree = {
  remove(data: TreeItem[], id: string): TreeItem[] {
    return data
      .filter((item) => item.id !== id)
      .map((item) => {
        if (tree.hasChildren(item)) {
          return {
            ...item,
            children: tree.remove(item.children, id)
          }
        }
        return item
      })
  },
  insertBefore(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap((item) => {
      if (item.id === targetId) {
        return [newItem, item]
      }
      if (tree.hasChildren(item)) {
        return {
          ...item,
          children: tree.insertBefore(item.children, targetId, newItem)
        }
      }
      return item
    })
  },
  insertAfter(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap((item) => {
      if (item.id === targetId) {
        return [item, newItem]
      }
      if (tree.hasChildren(item)) {
        return {
          ...item,
          children: tree.insertAfter(item.children, targetId, newItem)
        }
      }
      return item
    })
  },
  insertChild(data: TreeItem[], targetId: string, newItem: TreeItem): TreeItem[] {
    return data.flatMap((item) => {
      if (item.id === targetId) {
        return {
          ...item,
          isOpen: true,
          children: [newItem, ...item.children]
        }
      }
      if (!tree.hasChildren(item)) {
        return item
      }
      return {
        ...item,
        children: tree.insertChild(item.children, targetId, newItem)
      }
    })
  },
  find(data: TreeItem[], itemId: string): TreeItem | undefined {
    for (const item of data) {
      if (item.id === itemId) {
        return item
      }

      if (tree.hasChildren(item)) {
        const result = tree.find(item.children, itemId)
        if (result) {
          return result
        }
      }
    }
  },
  getPathToItem({
    current,
    targetId,
    parentIds = []
  }: {
    current: TreeItem[]
    targetId: string
    parentIds?: string[]
  }): string[] | undefined {
    for (const item of current) {
      if (item.id === targetId) {
        return parentIds
      }
      const nested = tree.getPathToItem({
        current: item.children,
        targetId: targetId,
        parentIds: [...parentIds, item.id]
      })
      if (nested) {
        return nested
      }
    }
  },
  hasChildren(item: TreeItem): boolean {
    return item.children.length > 0
  }
}

export function getInitialTreeState(): TreeState {
  return { data: getInitialData(), lastAction: null }
}

export function getInitialData(): TreeItem[] {
  return [
    {
      id: "1",
      isOpen: true,
      children: [
        {
          id: "1.3",
          isOpen: true,
          children: [
            {
              id: "1.3.1",
              children: []
            },
            {
              id: "1.3.2",
              isDraft: true,
              children: []
            }
          ]
        },
        { id: "1.4", children: [] }
      ]
    },
    {
      id: "2",
      isOpen: true,
      children: [
        {
          id: "2.3",
          isOpen: true,
          children: [
            {
              id: "2.3.1",
              children: []
            },
            {
              id: "2.3.2",
              children: []
            }
          ]
        }
      ]
    }
  ]
}

export function createTreeItemRegistry() {
  const registry = new Map<string, { element: HTMLElement; actionMenuTrigger: HTMLElement }>()
  const registerTreeItem = ({
    itemId,
    element,
    actionMenuTrigger
  }: {
    itemId: string
    element: HTMLElement
    actionMenuTrigger: HTMLElement
  }): CleanupFn => {
    registry.set(itemId, { element, actionMenuTrigger })
    return () => {
      registry.delete(itemId)
    }
  }
  return { registry, registerTreeItem }
}

export function Icon({ item }: { item: TreeItemType }) {
  if (!item.children.length) {
    return <ChildIcon />
  }
  return <GroupIcon isOpen={item.isOpen ?? false} />
}

function ChildIcon() {
  return (
    <svg aria-hidden={true} width={24} height={24} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={2} fill={iconColor} />
    </svg>
  )
}

function GroupIcon({ isOpen }: { isOpen: boolean }) {
  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon
  return <Icon label="" primaryColor={iconColor} />
}

export declare function DropIndicator({
  instruction
}: DropIndicatorProps): ReactElement<any, string | import("react").JSXElementConstructor<any>> | null

export function getParentLevelOfInstruction(instruction: Instruction): number {
  if (instruction.type === "instruction-blocked") {
    return getParentLevelOfInstruction(instruction.desired)
  }
  if (instruction.type === "reparent") {
    return instruction.desiredLevel - 1
  }
  return instruction.currentLevel - 1
}

const previewStyles = css({
  "--grid": "8px",
  background: token("elevation.surface.raised", "red"),
  padding: "var(--grid)",
  borderRadius: 3
})

export function Preview({ item }: { item: TreeItemType }) {
  return (
    <div
    // css={previewStyles}
    >
      Item {item.id}
    </div>
  )
}

export function delay({ waitMs: timeMs, fn }: { waitMs: number; fn: () => void }): () => void {
  let timeoutId: number | null = window.setTimeout(() => {
    timeoutId = null
    fn()
  }, timeMs)
  return function cancel() {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutId = null
    }
  }
}

export type DropIndicatorProps = {
  instruction: Instruction
}
export declare function DropIndicator({
  instruction
}: DropIndicatorProps): ReactElement<any, string | import("react").JSXElementConstructor<any>> | null

