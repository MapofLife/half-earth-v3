import IdentityManager from "@arcgis/core/identity/IdentityManager"
import OAuthInfo from "@arcgis/core/identity/OAuthInfo"
import Portal from "@arcgis/core/portal/Portal"
import useJWTToken from 'hooks/useJWTToken';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import { createContext, useCallback, useEffect, useState } from "react"

const AuthorizationContext = createContext();

const getOAuthInfo = (countryISO) => {
  if(countryISO === 'GUY'){
    return new OAuthInfo({
      appId: '2g74U2WEt7zh0Kpx',
      popup: false,
      portalUrl: 'https://guyana.maps.arcgis.com',
    });
  }

  if(countryISO === 'COD'){
    return new OAuthInfo({
      appId: 'qLC0Ks0swCJPymuu',
      popup: false,
      portalUrl: 'https://iccn.maps.arcgis.com/',
    });
  }

  if(countryISO === 'GIN'){
    return new OAuthInfo({
      appId: 'lxtJIxf04Acx574x',
      popup: false,
      portalUrl: 'https://guinee.maps.arcgis.com/',
    });
  }

  if(countryISO === 'PER'){
    return new OAuthInfo({
      appId: 'H0lqwISTHVGxKWeG',
      popup: false,
      portalUrl: 'https://mols.maps.arcgis.com/',
    });
  }
};

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
