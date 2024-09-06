import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DraggableState,
  Edge,
  Item,
  ItemData,
  ItemEntry,
  ItemPosition,
} from "./type";
import { ListContext } from "./context";
import invariant from "tiny-invariant";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { token } from "@atlaskit/tokens";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Box, Grid, Inline, xcss } from "@atlaskit/primitives";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button";
import mergeRefs from "@atlaskit/ds-lib/merge-refs";
import Avatar from "@atlaskit/avatar";
import Lozenge from "@atlaskit/lozenge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import ReactDOM from "react-dom";
import Image from "next/image";
import Badge from "@atlaskit/badge";

const itemKey = Symbol("item");
const draggingState: DraggableState = { type: "dragging" };

const itemLabelStyles = xcss({
  flexGrow: 1,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  color: "color.text.accent.blue",
});

const listItemPreviewStyles = xcss({
  paddingBlock: "space.050",
  paddingInline: "space.100",
  borderRadius: "border.radius.100",
  backgroundColor: "elevation.surface.overlay",
  maxWidth: "360px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "color.text.accent.blue",
});

const listItemContainerStyles = xcss({
  position: "relative",
  backgroundColor: "elevation.surface",
  borderWidth: "border.width.0",
  borderBottomWidth: token("border.width", "1px"),
  borderStyle: "solid",
  borderColor: "color.border",
  ":last-of-type": {
    borderWidth: "border.width.0",
  },
});

const listItemStyles = xcss({
  position: "relative",
  padding: "space.100",
});

const listItemDisabledStyles = xcss({ opacity: 0.4 });

export function getItemRegistry() {
  const registry = new Map<string, HTMLElement>();

  function register({ itemId, element }: ItemEntry) {
    registry.set(itemId, element);

    return function unregister() {
      registry.delete(itemId);
    };
  }

  function getElement(itemId: string): HTMLElement | null {
    return registry.get(itemId) ?? null;
  }

  return { register, getElement };
}

function useListContext() {
  const listContext = useContext(ListContext);
  invariant(listContext !== null);
  return listContext;
}

function getItemData({
  item,
  index,
  instanceId,
}: {
  item: Item;
  index: number;
  instanceId: symbol;
}): ItemData {
  return {
    [itemKey]: true,
    item,
    index,
    instanceId,
  };
}

export function isItemData(
  data: Record<string | symbol, unknown>
): data is ItemData {
  return data[itemKey] === true;
}

function DropDownContent({
  position,
  index,
}: {
  position: ItemPosition;
  index: number;
}) {
  const { reorderItem, getListLength } = useListContext();

  const isMoveUpDisabled = position === "first" || position === "only";
  const isMoveDownDisabled = position === "last" || position === "only";

  const moveToTop = useCallback(() => {
    reorderItem({
      startIndex: index,
      indexOfTarget: 0,
      closestEdgeOfTarget: null,
    });
  }, [index, reorderItem]);

  const moveUp = useCallback(() => {
    reorderItem({
      startIndex: index,
      indexOfTarget: index - 1,
      closestEdgeOfTarget: null,
    });
  }, [index, reorderItem]);

  const moveDown = useCallback(() => {
    reorderItem({
      startIndex: index,
      indexOfTarget: index + 1,
      closestEdgeOfTarget: null,
    });
  }, [index, reorderItem]);

  const moveToBottom = useCallback(() => {
    reorderItem({
      startIndex: index,
      indexOfTarget: getListLength() - 1,
      closestEdgeOfTarget: null,
    });
  }, [index, getListLength, reorderItem]);

  return (
    <DropdownItemGroup>
      <DropdownItem onClick={moveToTop} isDisabled={isMoveUpDisabled}>
        Move to top
      </DropdownItem>
      <DropdownItem onClick={moveUp} isDisabled={isMoveUpDisabled}>
        Move up
      </DropdownItem>
      <DropdownItem onClick={moveDown} isDisabled={isMoveDownDisabled}>
        Move down
      </DropdownItem>
      <DropdownItem onClick={moveToBottom} isDisabled={isMoveDownDisabled}>
        Move to bottom
      </DropdownItem>
    </DropdownItemGroup>
  );
}

export function ListItem({
  item,
  index,
  position,
}: {
  item: Item;
  index: number;
  position: ItemPosition;
}) {
  const idleState: DraggableState = { type: "idle" };
  const { registerItem, instanceId } = useListContext();

  const ref = useRef<HTMLDivElement>(null);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const dragHandleRef = useRef<HTMLButtonElement>(null);

  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState);

  useEffect(() => {
    const element = ref.current;

    const dragHandle = dragHandleRef.current;

    invariant(element), invariant(dragHandle);

    const data = getItemData({ item, index, instanceId });

    return combine(
      registerItem({ itemId: item.id, element }),
      draggable({
        element: dragHandle,
        getInitialData: () => data,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: token("space.200", "16px"),
              y: token("space.100", "8px"),
            }),
            render({ container }) {
              setDraggableState({ type: "preview", container });

              return () => setDraggableState(draggingState);
            },
          });
        },
        onDragStart() {
          setDraggableState(draggingState);
        },
        onDrop() {
          setDraggableState(idleState);
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return (
            isItemData(source.data) && source.data.instanceId === instanceId
          );
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        onDrag({ self, source }) {
          const isSource = source.element === element;
          if (isSource) {
            setClosestEdge(null);
            return;
          }

          const closestEdge = extractClosestEdge(self.data);

          const sourceIndex = source.data.index;
          invariant(typeof sourceIndex === "number");

          const isItemBeforeSource = index === sourceIndex - 1;
          const isItemAfterSource = index === sourceIndex + 1;

          const isDropIndicatorHidden =
            (isItemBeforeSource && closestEdge === "bottom") ||
            (isItemAfterSource && closestEdge === "top");

          if (isDropIndicatorHidden) {
            setClosestEdge(null);
            return;
          }

          setClosestEdge(closestEdge);
        },
        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop() {
          setClosestEdge(null);
        },
      })
    );
  }, [instanceId, item, index, registerItem, idleState]);

  return (
    <Fragment>
      <Box ref={ref} xcss={listItemContainerStyles}>
        <Grid
          alignItems="center"
          columnGap="space.100"
          templateColumns="auto 1fr auto"
          xcss={[
            listItemStyles,

            draggableState.type === "dragging" && listItemDisabledStyles,
          ]}
        >
          <DropdownMenu
            trigger={({ triggerRef, ...triggerProps }) => (
              <DragHandleButton
                ref={mergeRefs([dragHandleRef, triggerRef])}
                {...triggerProps}
                label={`Reorder ${item.label}`}
              />
            )}
          >
            <DropdownItemGroup>
              <DropDownContent position={position} index={index} />
            </DropdownItemGroup>
          </DropdownMenu>

          <Inline alignBlock="center" space="space.100">
            {/* <Box xcss={itemLabelStyles}>{item.label}</Box> */}
            {/* <Avatar size="small" src={item.avatar} /> */}
            {item.avatar && (
              <Image
                src={item.avatar}
                alt={"user"}
                width={80}
                height={80}
              ></Image>
            )}
            <Badge>{item.id}</Badge>
            <span className="text-emerald-600">{item.label}</span>
            <Lozenge>{index}</Lozenge>
          </Inline>
        </Grid>
        {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
      </Box>
      {draggableState.type === "preview" &&
        ReactDOM.createPortal(
          <>
            <Box xcss={listItemPreviewStyles}>{item.label}</Box>
            <Image
              src={item.avatar || ""}
              alt={"user"}
              width={80}
              height={80}
            ></Image>
          </>,
          draggableState.container
        )}
    </Fragment>
  );
}

export function getItemPosition({
  index,
  items,
}: {
  index: number;
  items: Item[];
}): ItemPosition {
  if (items.length === 1) {
    return "only";
  }

  if (index === 0) {
    return "first";
  }

  if (index === items.length - 1) {
    return "last";
  }

  return "middle";
}
