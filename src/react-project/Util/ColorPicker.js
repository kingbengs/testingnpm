import { ColorPickerConfig } from "shared/CSharedConstants";

export const getColorClass = (color) => {
  const activeColor = ColorPickerConfig.filter((item) => item.color === color);

  if (activeColor.length) {
    const { 0: currentColorPicker } = activeColor;
    return currentColorPicker.class;
  } else {
    return {};
  }
};
