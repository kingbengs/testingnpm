import { handleActions } from 'redux-actions';
import { produce } from 'immer';
import { ActionTypes } from 'shared/CSharedConstants';
import {
  setAttributeExplorerData,
  setThumbnailIsLoading,
  setNewCurrentStepLabel,
  setNewCurrentStepUrl,
  setNewCurrentStep,
  setNewCurrentStepFilterParams,
  setNewCurrentStepUtmData,
  setNewCurrentStepTrackingUrl,
} from 'react-project/redux/current-step/actions';

const initialState = {
  stepId: 0,
  position: { x: 0, y: 0 },
  thumbnailIsLoading: false,
  object: {
    type: '',
    category: '',
    isTextShape: false,
    supportedLineTypes: [],
    src: '/asset/StepsModal/Pages/webinarLive.svg',
    label: '',
    url: '',
    thumbnail: '',
    filterData: [],
    trackingURL: '',
    utmData: {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
    },
    actionType: ActionTypes.NONE,
    analyticsFilterData: {},
    attributesExplorerData: {},
    selectedAttributes: [],
  },
};

export default handleActions(
  {
    [setNewCurrentStepLabel.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.label = action.payload;
      }),
    [setNewCurrentStepUrl.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.url = action.payload;
      }),
    [setNewCurrentStep.toString()]: (state, action) =>
      produce(state, (draft) => {
        const filters = Array.isArray(action.payload.filterData) > 0 ? action.payload.filterData : [];
        const trackingURL = action.payload.trackingURL ? action.payload.trackingURL : '';
        const utmData = action.payload.utmData
          ? action.payload.utmData
          : {
              source: '',
              medium: '',
              campaign: '',
              content: '',
              term: '',
            };

        draft.position = {
          x: action.payload.x,
          y: action.payload.y,
        };
        draft.stepId = action.payload.stepId;
        draft.object.label = action.payload.label;
        draft.object.url = action.payload.url;
        draft.object.filterData = filters;
        draft.object.trackingURL = trackingURL;
        draft.object.utmData = utmData;
        draft.object.category = action.payload.category;
        draft.object.isTextShape = action.payload.isTextShape;
        draft.object.supportedLineTypes = action.payload.supportedLineTypes;
        draft.object.type = action.payload.type;
        draft.object.actionType = action.payload.actionType;
        draft.object.analyticsFilterData = action.payload.analyticsFilterData;
        draft.object.lineType = action.payload.lineType;
        draft.object.drawLineType = action.payload.drawLineType;

        if (action.payload.shapeData){
          const { shapeStyle : {borderColor, fillColor} = {}} =  action.payload.shapeData;
          draft.object.shapeStyle = {borderColor, fillColor};
        }

      }),
    [setNewCurrentStepFilterParams.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.filterData = action.payload;
      }),
    [setAttributeExplorerData.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.attributesExplorerData = action.payload;
      }),
    [setNewCurrentStepUtmData.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.utmData = action.payload;
      }),
    [setNewCurrentStepTrackingUrl.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.trackingURL = action.payload;
      }),
    [setThumbnailIsLoading.toString()]: (state, action) =>
      produce(state, (draft) => {
        draft.object.thumbnailIsLoading = action.payload;
      }),
  },
  initialState
);
