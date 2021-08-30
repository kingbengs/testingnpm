import React from "react";
import { TooltipPopup, useTooltip } from "@reach/tooltip";
import styles from "./Tooltip.module.scss";
import { tooltipTriangle } from "../../assets/Icons";
import { Portal } from "@reach/portal";

const BOTTOM_TOOLTIP_TOP_MARGIN = 8;
const MAX_LEFT_TOOLTIP_MARGIN = 8;
const TOP_TOOLTIP_TOP_MARGIN = 50;
const TOP_TRIGGER_TOP_MARGIN = 58;
const BOTTOM_TRIGGER_TOP_MARGIN = 1;
const TRIGGER_LEFT_MARGIN = 50;

const bottomCentered = (triggerRect, tooltipRect) => {
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const left = triggerCenter - tooltipRect.width / 2;
  const maxLeft = window.innerWidth - tooltipRect.width - MAX_LEFT_TOOLTIP_MARGIN;
  return {
    left: Math.min(Math.max(MAX_LEFT_TOOLTIP_MARGIN, left), maxLeft) + window.scrollX,
    top: triggerRect.bottom + BOTTOM_TOOLTIP_TOP_MARGIN + window.scrollY,
  };
};

const topCentered = (triggerRect, tooltipRect) => {
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const left = triggerCenter - tooltipRect.width / 2;
  const maxLeft = window.innerWidth - tooltipRect.width - MAX_LEFT_TOOLTIP_MARGIN;
  return {
    left: Math.min(Math.max(MAX_LEFT_TOOLTIP_MARGIN, left), maxLeft) + window.scrollX,
    top: triggerRect.top - TOP_TOOLTIP_TOP_MARGIN + window.scrollY,
  };
};

const positions = {
  default: bottomCentered,
  top: topCentered,
  bottom: bottomCentered,
};

const getTrianglePosition = (triggerRect, position) => {
  switch (position) {
    case "top":
      return {
        left: triggerRect && triggerRect.left - TRIGGER_LEFT_MARGIN + triggerRect.width / 2,
        top: triggerRect && triggerRect.top + window.scrollY - TOP_TRIGGER_TOP_MARGIN,
        transform: "rotate(180deg)",
      };
    case "bottom":
      return {
        left: triggerRect && triggerRect.left - TRIGGER_LEFT_MARGIN + triggerRect.width / 2,
        top: triggerRect && triggerRect.bottom + window.scrollY - BOTTOM_TRIGGER_TOP_MARGIN,
      };
    default:
      return {
        left: triggerRect && triggerRect.left - TRIGGER_LEFT_MARGIN + triggerRect.width / 2,
        top: triggerRect && triggerRect.bottom + window.scrollY - BOTTOM_TRIGGER_TOP_MARGIN,
      };
  }
};

export const Tooltip = ({ children, label, "aria-label": ariaLabel, position }) => {
  const [trigger, tooltip] = useTooltip();
  const { isVisible, triggerRect } = tooltip;
  const trianglePosition = getTrianglePosition(triggerRect, position);

  return (
    <>
      {React.cloneElement(children, trigger)}
      {isVisible && label && (
        <Portal>
          <div style={trianglePosition} className={styles.Triangle}>
            {tooltipTriangle}
          </div>
        </Portal>
      )}
      {label && (
        <TooltipPopup
          {...tooltip}
          label={label}
          aria-label={ariaLabel}
          style={{
            background: "#636e84",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 15px",
            zIndex: 100,
            marginTop: "5px",
            fontSize: "12px",
            fontWeight: 500,
          }}
          position={position ? positions[position] : positions.default}
        />
      )}
    </>
  );
};
