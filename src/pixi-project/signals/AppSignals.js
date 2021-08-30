import * as signals from 'signals';

export default {
  viewportChanged: new signals.Signal(),
  viewportClicked: new signals.Signal(),
  assetsLoadingComplete: new signals.Signal(),
  loadingProgress: new signals.Signal(),
  setTextEditMode: new signals.Signal(),
  setInEditMode: new signals.Signal(),
  setOutEditMode: new signals.Signal(),
  positionObject: new signals.Signal(),
  resizePointPressed: new signals.Signal(),
  resizePointReleased: new signals.Signal(),
  elementChanged: new signals.Signal(),
  commandCreated: new signals.Signal(),
  stageBeforeRendered: new signals.Signal(),
  connectionMoved : new signals.Signal(),
};
