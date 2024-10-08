/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListContextValue, ListState, Edge } from "../../Lib/type";
import { defaultItems } from "../../Lib/mock";
import {
  getItemPosition,
  getItemRegistry,
  isItemData,
  ListItem,
} from "../Card/functions";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { ListContext } from "../../Lib/context";
import { Stack } from "@atlaskit/primitives";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";
import * as liveRegion from "@atlaskit/pragmatic-drag-and-drop-live-region";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { containerStyles } from "./styles";

export default function Cards() {
  const [{ items, lastCardMoved }, setListState] = useState<ListState>({
    items: defaultItems,
    lastCardMoved: null,
  });
  console.log("lastCardMoved", lastCardMoved);

  const [registry] = useState(getItemRegistry);

  const [instanceId] = useState(() => Symbol("instance-id"));

  const getListLength = useCallback(() => items.length, [items.length]);

  const reorderItem = useCallback(
    ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number;
      indexOfTarget: number;
      closestEdgeOfTarget: Edge | null;
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: "vertical",
      });

      if (finishIndex === startIndex) {
        return;
      }

      setListState((listState) => {
        const item = listState.items[Number(startIndex)];

        return {
          items: reorder({
            list: listState.items,
            startIndex,
            finishIndex,
          }),
          lastCardMoved: {
            item,
            previousIndex: startIndex,
            currentIndex: finishIndex,
            numberOfItems: listState.items.length,
          },
        };
      });
    },
    []
  );

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId;
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;
        if (!isItemData(sourceData) || !isItemData(targetData)) {
          return;
        }

        const indexOfTarget = items.findIndex(
          (item) => item.id === targetData.item.id
        );
        if (indexOfTarget < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        reorderItem({
          startIndex: sourceData.index,
          indexOfTarget,
          closestEdgeOfTarget,
        });
      },
    });
  }, [instanceId, items, reorderItem]);

  useEffect(() => {
    if (lastCardMoved === null) {
      return;
    }

    const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved;
    const element = registry.getElement(item.id);
    if (element) {
      triggerPostMoveFlash(element);
    }

    liveRegion.announce(
      `You've moved ${item.label} from position ${
        previousIndex + 1
      } to position ${currentIndex + 1} of ${numberOfItems}.`
    );
  }, [lastCardMoved, registry]);

  useEffect(() => {
    return function cleanup() {
      liveRegion.cleanup();
    };
  }, []);

  const contextValue: ListContextValue = useMemo(() => {
    return {
      registerItem: registry.register,
      reorderItem,
      instanceId,
      getListLength,
    };
  }, [registry.register, reorderItem, instanceId, getListLength]);

  return (
    <div className="w-[80%] bg-green-300 h-full flex justify-center items-center">
      <ListContext.Provider value={contextValue}>
        <Stack xcss={containerStyles}>
          <div className="bg-white w-[20rem]">
            {items.map((item, index) => (
              <ListItem
                key={item.id}
                item={item}
                index={index}
                position={getItemPosition({ index, items })}
              />
            ))}
          </div>
        </Stack>
      </ListContext.Provider>
    </div>
  );
}
