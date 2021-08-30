import { CANVAS_ACTION_NAMES } from "./canvasActionNames";

export const DefaultHotkeys = {
  [CANVAS_ACTION_NAMES.DUPLICATE]: { keys: ['ctrl', 'd'], separator: '+' },
  [CANVAS_ACTION_NAMES.COPY]: { keys: ['ctrl', 'c'], separator: '+' },
  [CANVAS_ACTION_NAMES.PASTE]: { keys: ['ctrl', 'v'], separator: '+' },
  [CANVAS_ACTION_NAMES.RESET_ZOOM]: { keys: ['ctrl', '0'], separator: '+' },
  [CANVAS_ACTION_NAMES.ZOOM_IN]: { keys: ['ctrl', '+'], separator: '+' },
  [CANVAS_ACTION_NAMES.ZOOM_OUT]: { keys: ['ctrl', '-'], separator: '+' },
  [CANVAS_ACTION_NAMES.DELETE]: { keys: ['del', 'backspace'], separator: 'or' },
  [CANVAS_ACTION_NAMES.UNDO]: { keys: ['ctrl', 'z'], separator: '+' },
  [CANVAS_ACTION_NAMES.REDO]: { keys: ['ctrl', 'y'], separator: '+' },
  [CANVAS_ACTION_NAMES.PAN]: { keys: ['space']},
};

export const MacHotkeys = {
  [CANVAS_ACTION_NAMES.DUPLICATE]: { keys: ['⌘', 'd'], separator: '+' },
  [CANVAS_ACTION_NAMES.COPY]: { keys: ['⌘', 'c'], separator: '+' },
  [CANVAS_ACTION_NAMES.PASTE]: { keys: ['⌘', 'v'], separator: '+' },
  [CANVAS_ACTION_NAMES.RESET_ZOOM]: { keys: ['⌘', '0'], separator: '+' },
  [CANVAS_ACTION_NAMES.ZOOM_IN]: { keys: ['⌘', '+'], separator: '+' },
  [CANVAS_ACTION_NAMES.ZOOM_OUT]: { keys: ['⌘', '-'], separator: '+' },
  [CANVAS_ACTION_NAMES.DELETE]: { keys: ['del', 'backspace'], separator: 'or' },
  [CANVAS_ACTION_NAMES.UNDO]: { keys: ['⌘', 'z'], separator: '+' },
  [CANVAS_ACTION_NAMES.REDO]: { keys: ['⌘', 'shift', 'z'], separator: '+' },
  [CANVAS_ACTION_NAMES.PAN]: { keys: ['space']},
};
