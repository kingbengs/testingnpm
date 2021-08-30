import React, { useEffect, useMemo, useState } from 'react';
import Header from 'react-project/Header/Header';
import Main from 'react-project/Main/Main';
import { BottomBar } from 'react-project/BottomBar/BottomBar';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserId } from 'react-project/redux/auth/selectors';
import { loadUserData, loadPermissionAsync } from 'react-project/redux/user/actions';

export const Funnel = ({ match }) => {
  const [isNumbersActive, setIsNumbersActive] = useState(false);
  const [isFullScreenActive, setFullScreenStatus] = useState(true);
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);

  useEffect(() => {
    dispatch(
      loadPermissionAsync({
        scopeId: userId,
        permission: 'feature.chat-support',
        scope: 'user',
        projectId: match.params.funnelId,
      })
    );
    dispatch(loadUserData({ userId }));
  }, []);

  useEffect(() => {
    if (isNumbersActive && !isFullScreenActive) {
      const element = document.getElementById('hubspot-messages-iframe-container');
      const shadowContainer = document.getElementsByClassName('shadow-container')[0];
      if (element) {
        element.classList.add('ChatWithOpacity');
        if (shadowContainer.classList.contains('active')) {
          element.classList.add('OpenedChat');
        }
      }
    } else {
      const element = document.getElementById('hubspot-messages-iframe-container');
      if (element) {
        element.classList.remove('ChatWithOpacity');
      }
    }
  }, [isNumbersActive, isFullScreenActive]);

  return (
    <div>
      <Header
        funnelId={match.params.funnelId}
        isNumbersActive={isNumbersActive}
        setIsNumbersActive={setIsNumbersActive}
        isFullScreenActive={isFullScreenActive}
        setFullScreenStatus={setFullScreenStatus}
      />
      <Main funnelId={match.params.funnelId} />
      <BottomBar
        funnelId={match.params.funnelId}
        isHidden={!isNumbersActive || isFullScreenActive}
      />
    </div>
  );
};
