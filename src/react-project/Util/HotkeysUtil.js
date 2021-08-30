import { DefaultHotkeys, MacHotkeys } from "react-project/Constants/hotkeys";
import Platform from 'pixi-project/utils/Platform';

export const getHotkeys = () => {
  return Platform.isMacOS() ? MacHotkeys : DefaultHotkeys;
};

export const getHotkeyForAction = (actionName) => {
  const hotkeys = getHotkeys();

  return hotkeys[actionName];
};
