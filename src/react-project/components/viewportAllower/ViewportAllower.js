import React, { useState, useRef, memo, useEffect } from "react";
import PropTypes from "prop-types";
import { getStyles, getStylesRelative } from "react-project/Util/MenuStyle";
import { CControlPointTypes } from 'pixi-project/base/containers/CContainerConstants';
/**
 * Takes a coordinates element and check do not allow outside of viewport
 * @param {Integer} startX start position x of element, if 0 - get from ref
 * @param {Integer} startY start position y of element, if 0 - get from ref
 * @param {Integer} upperElHeight if we have above the element and position against it
 * @param {Integer} widthEl width of element, if 0 - get from ref
 * @param {Integer} heightEl height position y of element, if 0 - get from ref
 * @returns div with style top & left
 */
const ViewportAllowerComponent = ({
  children,
  className,
  startX = 0,
  startY = 0,
  upperElHeight = 0,
  position = CControlPointTypes.BOTTOM,
  type = "absolute",
  widthEl = 0,
  heightEl = 0,
  style = {}
}) => {
  const refEl = useRef(null);
  const { innerWidth, innerHeight } = window;
  const viewport = { width: innerWidth, height: innerHeight };

  const [cord, setCord] = useState({ x: startX, y: startY });
  const [size, setSize] = useState({ width: widthEl, height: heightEl });

  useEffect(() => {
    setCord({ x: startX, y: startY});
  }, [startX, startY]);

  useEffect(() => {
    setSize({ width: widthEl, height: heightEl});
  }, [widthEl, heightEl]);

  let containerData =
    size.width > 0
      ? getStyles(cord.x, cord.y, size.width, size.height, viewport, upperElHeight, position, type)
      : {};

  if (type === "relative" && containerData.style) {
    containerData = getStylesRelative(containerData, size.height);
  }

  // for flexibility if we change size or position element, setup size from ref
  // correct identify out of viewport 
  const getRef = (ref) => {
    if (size.width === 0) {
      const widthRef = ref !== null && ref.offsetWidth ? ref.offsetWidth : 0;
      const heightRef = ref !== null && ref.offsetHeight ? ref.offsetHeight : 0;

      if (size.width != widthRef && widthRef !== 0) {
        setSize({ width: widthRef, height: heightRef });

        if (!cord.x && !cord.y) {
          const { x: startX, y: startY } = ref.getBoundingClientRect();
          setCord({ x: startX, y: startY });
        }
      }
    }
  };

  return (
    <div ref={(refEl) => getRef(refEl)} className={className} style={{...style, ...containerData.style}}>
      {children}
    </div>
  );
};

ViewportAllowerComponent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string.isRequired,
  startX : PropTypes.number,
  startY : PropTypes.number,
  upperElHeight : PropTypes.number,
  position : PropTypes.string,
  type : PropTypes.string,
  widthEl : PropTypes.number,
  heightEl : PropTypes.number,
};

const compareEqual = (prevState, nextState) => {
  return prevState.startX === nextState.startX && prevState.startY === nextState.startY && prevState.children === nextState.children;
};

export const ViewportAllower = memo(ViewportAllowerComponent, compareEqual);
