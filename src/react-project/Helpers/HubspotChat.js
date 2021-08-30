import React from "react";
import RequestService from "react-project/Helpers/RequestService";
import { useSelector } from "react-redux";
import { selectPermissions } from "react-project/redux/user/selectors";

const requestService = new RequestService();
const TOKEN_KEY = "hubspot_token";

const _getToken = async () => {
  const result = JSON.parse(localStorage.getItem(TOKEN_KEY) || null);

  if (result && new Date(result.expiryDate) > new Date()) {
    return result.token;
  }

  const { token, expiryDate } = await requestService.getHubspotToken();

  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiryDate }));
  return token;
};

const _execute = (action) => {
  // If external API methods are already available, use them.
  if (window.HubSpotConversations) {
    action();
    return;
  }

  /*
    Otherwise, callbacks can be added to the hsConversationsOnReady on the window object.
    These callbacks will be called once the external API has been initialized.
  */
  window.hsConversationsOnReady = window.hsConversationsOnReady || [];
  window.hsConversationsOnReady.push(action);
};

const _load = async (email) => {
  const token = await _getToken();

  window.hsConversationsSettings = window.hsConversationsSettings || {};
  window.hsConversationsSettings.identificationEmail = email;
  window.hsConversationsSettings.identificationToken = token;
  window.HubSpotConversations.widget.load();
};

export const LoadHubspotChat = ({ email }) => {
  const userPermissions = useSelector(selectPermissions);
  if (userPermissions) {
    const hasPermission = userPermissions.some(
      (el) => el.name === 'feature.chat-support' && el.permitted
    );

    if (hasPermission) {
      _execute(() => _load(email));
    }
  }
  return null;
};
