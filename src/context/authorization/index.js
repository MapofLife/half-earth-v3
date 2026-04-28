import IdentityManager from "@arcgis/core/identity/IdentityManager"
import OAuthInfo from "@arcgis/core/identity/OAuthInfo"
import Portal from "@arcgis/core/portal/Portal"
import useJWTToken from 'hooks/useJWTToken';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import { createContext, useCallback, useEffect, useState } from "react";
import { getOAuthInfo } from 'utils/getOAuthInfo';

const AuthorizationContext = createContext();

function AuthorizationProvider(props) {
  const {countryISO} = props;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = () => {
    const portal = new Portal();
    portal.authMode = 'immediate';
    portal.load().then(async (response) => {
      // setLoggedIn(true);
      setUser(portal.user);
      setIsAuthorized(true);

      // Example of using the token to make an authenticated request to the backend
      const refreshedCredential = await portal.credential.refreshToken();
      console.log('Token refreshed:', refreshedCredential.token);
      const token = refreshedCredential.token;
      setToken(token);
      console.log('Obtained token:', token);

      fetch(DASHBOARD_URLS.ARCGIS_USER_INFO_URL, {
        method: 'GET',
        ISO3: countryISO,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('User info from backend:', data);
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
        });
        //
    });
  };

  useEffect(() => {
      const oauthInfo = getOAuthInfo(countryISO.toUpperCase());
      IdentityManager.registerOAuthInfos([oauthInfo]);
      IdentityManager.checkSignInStatus(oauthInfo.portalUrl)
        .then(handleLoginSuccess)
        .catch((error) => {
          console.log('Not signed in:', error);
          throw Error(error);
      });
    },
    [countryISO],
  );

  return (
    <AuthorizationContext.Provider value={{ isAuthorized, setIsAuthorized, token, setToken, countryISO }}>
      {props.children}
    </AuthorizationContext.Provider>
  );
}

export { AuthorizationContext, AuthorizationProvider };
