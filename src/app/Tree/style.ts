import { css, jsx } from "@emotion/react"
import { token } from "@atlaskit/tokens"

export const innerButtonStyles = css({
  padding: "var(--grid)",
  paddingRight: 40,
  alignItems: "center",
  display: "flex",
  flexDirection: "row",

  background: token("color.background.neutral.subtle", "transparent"),
  borderRadius: 3
})

export const innerDraggingStyles = css({
  opacity: 0.4
})

export const parentOfInstructionStyles = css({
  background: token("color.background.selected.hovered", "transparent")
})

export const idStyles = css({
  margin: 0,
  color: token("color.text.disabled", "#8993A5")
})

export const labelStyles = css({
  flexGrow: 1,
  overflow: "hidden",
  textAlign: "left",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
})

export const debugStyles = css({
  position: "absolute",
  right: "var(--grid)",
  bottom: 0,
  fontSize: "6px"
})

export const outerButtonStyles = css({
  "--grid": "8px",
  /**
   * Without this Safari renders white text on drag.
   */
  color: token("color.text", "currentColor"),

  border: 0,
  width: "100%",
  position: "relative",
  background: "transparent",
  margin: 0,
  padding: 0,
  borderRadius: 3,
  cursor: "pointer"
})

