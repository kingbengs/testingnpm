import { EConnectionLineType } from "pixi-project/base/joint/CConnectionConstants";
import { EShapeTypes } from "shared/CSharedConstants";

export const TEXT_LOAD_MORE_USERS = 'Load More Users';
export const TEXT_LOAD_MORE = 'Load More';

export const TEXT_INFO_PEOPLE_PERFORMED = 'Click a step on the canvas';
export const TEXT_CLEAR_PEOPLE_PERFORMED = 'Clear step';

export const TEXT_ADD_STEP = 'Add Step';
export const TEXT_PASTE_OBJECT = 'Paste';
export const TEXT_UNDO_ACTION = 'Undo';
export const TEXT_REDO_ACTION = 'Redo';
export const TEXT_FIT_TO_SCREEN = 'Fit to screen';
export const TEXT_ZOOM_IN = 'Zoom in';
export const TEXT_ZOOM_OUT = 'Zoom out';
export const TEXT_ZOOM_DEFAULT = 'Zoom to 100%';
export const TEXT_VERSION_HISTORY = 'Version history';

export const TEXT_SETTINGS_LABEL = 'Label';
export const TEXT_SETTINGS_THUMBNAIL_URL = 'Create a thumbnail from a URL';

export const TEXTS_TOOLTIP = {
  HIDE_PANELS: 'Hide panels',
  SHOW_PANELS: 'Show panels',
  HELP: 'Help',
  ZOOM_VIEW_OPTIONS: 'Zoom/View options',
  REFRESH_ANALYTICS: 'Refresh Analytics',
  ACTIVATE_ANALYTICS: 'Activate analytics',
  SELECT: 'Select',
  PAN: 'Pan',
  ADD_STEP: 'Add a step',
  ADD_TEXT: 'Add Text',
  EXPORT_PNG: 'Export PNG',
  DRAW_RECTANGLE: 'Draw a rectangle',
  DRAW_TRIANGLE: 'Draw a triangle',
  DRAW_CIRCLE: 'Draw a circle',
  MORE: 'More',
  BORDER_COLOR: 'Border color',
  FILL_COLOR: 'Fill color',
  ADVANCED_TRACKING_SETUP_UNAVAILABLE :'Advanced tracking setup is not yet available in beta canvas'
};

export const TEXTS_STRAIGHT_LINE_TYPES = 'Straight Line';
export const TEXTS_BEZIER_LINE_TYPES = 'Bezier Line';

export const TEXTS_SHAPES = {
  [EShapeTypes.ELLIPSE]: 'Ellipse',
  [EShapeTypes.RECTANGLE]: 'Rectangle',
  [EShapeTypes.TRIANGLE]: 'Triangle',
};

export const TEXTS_CONNECTION_LINE_TYPES = {
  [EConnectionLineType.SOLID]: 'Direct connection',
  [EConnectionLineType.DOTTED]: 'Skip steps',
  [EConnectionLineType.NODATA]: 'No data',
};
