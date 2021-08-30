import { CControlPointTypes } from "pixi-project/base/containers/CContainerConstants";
const PADDING_CORNER = 20;
const PADDING_VERTICAL = 30;

export const getStyles = (
  x,
  y,
  widthEl,
  heightEl,
  viewport,
  heightParent,
  position,
  typePosition
) => {
  let paddingVertical = heightParent > 0 ? PADDING_VERTICAL : 0;

  const isOutTop = 0 > y - paddingVertical;
  const topPosition = isOutTop ? PADDING_CORNER : y - paddingVertical;
  const isOutBottom = viewport.height < y + heightEl + paddingVertical;
  const middleElPosition = x - widthEl / 2;
  const leftPosition = position === CControlPointTypes.RIGHT ? x : middleElPosition;

  let forceLeftPosition;

  const isOutLeft = leftPosition < PADDING_CORNER;
  if (isOutLeft) {
    forceLeftPosition = PADDING_CORNER;
  }

  const relativePositionShift = typePosition === "relative" ? widthEl / 2 : 0;
  const maxLeftPoint = viewport.width - widthEl - PADDING_CORNER - relativePositionShift;
  const isOutRight = leftPosition > maxLeftPoint;

  if (isOutRight) {
    forceLeftPosition = maxLeftPoint;
  }

  const startPointY = heightParent ? y : viewport.height;
  const forceTopPosition = startPointY - heightParent - paddingVertical * 3 - heightEl;
  const top = isOutBottom ? forceTopPosition : topPosition;
  const left = forceLeftPosition || leftPosition;

  return {
    isOutTop: isOutTop,
    isOutBottom: isOutBottom,
    isOutLeft: isOutLeft,
    isOutRight: isOutRight,
    style: { top: Math.max(top, PADDING_CORNER), left },
  };
};

export const getStylesRelative = (ContainerData, height) => {
  ContainerData.style.position = "absolute";

  if (ContainerData.isOutBottom) {
    ContainerData.style.top = -20 - height;
    delete ContainerData.style.left;
  } else {
    ContainerData.style.top = 60;
    delete ContainerData.style.left;
  }

  if (ContainerData.isOutLeft) {
    ContainerData.style.left = 0;
  }
  if (ContainerData.isOutRight) {
    ContainerData.style.right = 0;
  }

  return ContainerData;
};
