import { TreeAction, TreeItem, TreeState } from "./types"

export function treeStateReducer(state: TreeState, action: TreeAction): TreeState {
  return {
    data: dataReducer(state.data, action),
    lastAction: action
  }
}

const dataReducer = (data: TreeItem[], action: TreeAction) => {
  console.log("action", action)

  const item = tree.find(data, action.itemId)
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
      })
  }
}
