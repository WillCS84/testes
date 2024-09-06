import { xcss } from "@atlaskit/primitives";
import { token } from "@atlaskit/tokens";

export const containerStyles = xcss({
  maxWidth: "600px",
  borderWidth: "border.width",
  borderStyle: "solid",
  borderColor: "color.border",
});

export const itemLabelStyles = xcss({
  flexGrow: 1,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  color: "color.text.accent.blue",
});

export const listItemPreviewStyles = xcss({
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

export const listItemContainerStyles = xcss({
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

export const listItemStyles = xcss({
  position: "relative",
  padding: "space.100",
});
