import { PropertyType } from "shared/CSharedConstants";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { RP_EVENT_PROPERTY_CHANGED } from "shared/CSharedEvents";

export const onCloseMenu = ({ inputs, clearInputsState}) => {
  const labelData = inputs.find((el) => el.type === PropertyType.LABEL);
  const urlData = inputs.find((el) => el.type === PropertyType.URL);

  if (labelData) {
    notifyIfValueChanged(labelData);
  }

  if (urlData) {
    notifyIfValueChanged(urlData);
  }

  clearInputsState();
};

export const notifyIfValueChanged = (data) => {
  if (data.currentValue !== data.previousValue) {
    commonSendEventFunction(RP_EVENT_PROPERTY_CHANGED, data);
    return true;
  }
  return false;
};
