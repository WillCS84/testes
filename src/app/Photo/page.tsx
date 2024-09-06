"use client";

import {
  createContext,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { css, jsx, type SerializedStyles } from "@emotion/react";
import invariant from "tiny-invariant";

import { easeInOut } from "@atlaskit/motion/curves";
import { smallDurationMs } from "@atlaskit/motion/durations";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { token } from "@atlaskit/tokens";
import Image, { StaticImageData } from "next/image";

import battery from "../../../public/battery.png";
import drill from "../../../public/drill.png";
import koala from "../../../public/koala.png";
import ui from "../../../public/ui.png";
import wallet from "../../../public/wallet.png";
import yeti from "../../../public/yeti.png";

function getInstanceId() {
  return Symbol("instance-id");
}

const InstanceIdContext = createContext<symbol | null>(null);

const itemStyles = css({
  objectFit: "cover",
  width: "100%",
  boxSizing: "border-box",
  background: token("elevation.surface.raised", "#FFF"),
  padding: token("space.050", "4px"),
  borderRadius: token("border.radius.100", "4px"),
  boxShadow: token("elevation.shadow.raised", "none"),
  transition: `all ${smallDurationMs}ms ${easeInOut}`,
  "-webkit-touch-callout": "none", // needed to avoid a "save image" popup on iOS
});

type State = "idle" | "dragging" | "over";

const itemStateStyles: { [Key in State]: undefined | SerializedStyles } = {
  idle: css({
    // eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-selectors -- Ignored via go/DSP-18766
    ":hover": {
      background: token("elevation.surface.overlay", "#FFF"),
      boxShadow: token("elevation.shadow.overlay", "none"),
    },
  }),
  dragging: css({
    filter: "grayscale(0.8)",
  }),
  over: css({
    transform: "scale(1.1) rotate(8deg)",
    filter: "brightness(1.15)",
    boxShadow: token("elevation.shadow.overlay", "none"),
  }),
};

const Item = memo(function Item({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<State>("idle");

  const instanceId = useContext(InstanceIdContext);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ type: "grid-item", src, instanceId }),
        onDragStart: () => setState("dragging"),
        onDrop: () => setState("idle"),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ src }),
        getIsSticky: () => true,
        canDrop: ({ source }) =>
          source.data.instanceId === instanceId &&
          source.data.type === "grid-item" &&
          source.data.src !== src,
        onDragEnter: () => setState("over"),
        onDragLeave: () => setState("idle"),
        onDrop: () => setState("idle"),
      })
    );
  }, [instanceId, src]);

  return (
    <div className="px-12 py-2 mt-4">
      <Image width={120} height={120} ref={ref} src={src} alt={"text"} />{" "}
    </div>
  );
});

const gridStyles = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 96px)",
  gap: "var(--grid)",
});

type resource = {
  id: string;
  url: StaticImageData;
};

export default function Photos() {
  const [items, setItems] = useState<String[]>(() => [
    battery.src,
    drill.src,
    koala.src,
    wallet.src,
    ui.src,
    yeti.src,
  ]);

  const [instanceId] = useState(getInstanceId);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data.instanceId === instanceId;
      },
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) {
          return;
        }
        console.log("destinationSrc", destination);
        const destinationSrc = destination.data.src;
        const startSrc = source.data.src;

        if (typeof destinationSrc !== "string") {
          return;
        }

        if (typeof startSrc !== "string") {
          return;
        }

        // swapping item positions
        const updated = [...items];
        updated[items.indexOf(startSrc)] = destinationSrc;
        updated[items.indexOf(destinationSrc)] = startSrc;

        setItems(updated);
      },
    });
  }, [instanceId, items]);

  return (
    <InstanceIdContext.Provider value={instanceId}>
      <div>
        {items.map((src, index) => (
          <Item src={String(src)} key={index} />
        ))}
      </div>
    </InstanceIdContext.Provider>
  );
}
