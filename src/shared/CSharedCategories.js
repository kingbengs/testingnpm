export const EElementCategories = {
  'NONE': 'NONE',
  'STEP': 'STEP',
  'CONNECTION': 'CONNECTION',
  'TEXT': 'TEXT',
  'SHAPE': 'SHAPE',
  'PANNING': 'PANNING',
  'CLICKING': 'CLICKING'
};

export const EElementTypes = {
  'NONE': 'NONE',
  'PAGE': 'PAGE',
  'EVENT': 'EVENT',
  'SOURCE': 'SOURCE',
  'MISC': 'MISC',
  'DEPENDENT': 'event.dependent',
};

export const EStepConnectionPort = {
  'IN' : 'in',
  'OUT' : 'out',
  'BOTTOM' : 'bottom',
};

export const EExplorerConfigTypes = {
  [EElementTypes.PAGE]: EElementTypes.PAGE,
  [EElementTypes.EVENT]: EElementTypes.EVENT,
  [EElementTypes.SOURCE]: EElementTypes.SOURCE,
  'PAGE_ALL': 'PAGE_ALL',
  'EVENT_ALL': 'EVENT_ALL'
};
