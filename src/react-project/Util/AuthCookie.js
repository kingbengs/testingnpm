import Cookies from 'js-cookie';

export const parseAuthCookie = () => {
  try {
    const flxAuthCookie = Cookies.get('flx_auth');
    const parsedCookie = JSON.parse(flxAuthCookie);

    return {
      id: parsedCookie.id,
      accessToken: parsedCookie.access_token
    };
  }
  catch {
    return null;
  }
};

export const getAuthToken = () => {
  const parsedCookie = parseAuthCookie();

  return parsedCookie? parsedCookie.accessToken : null;
};

export const removeAuthCookie = () => {
  Cookies.remove('flx_auth');
};
