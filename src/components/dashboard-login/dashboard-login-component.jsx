import React, { useContext, useEffect } from 'react';

import { useT } from '@transifex/react';

import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import Portal from '@arcgis/core/portal/Portal';
import { FormControl, TextField } from '@mui/material';
import useJWTToken from 'hooks/useJWTToken';
import Button from 'components/button';

import styles from './dashboard-login-styles.module.scss';
import { DASHBOARD_URLS } from 'constants/layers-urls';
import { AuthorizationContext } from 'context/authorization'

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
};

// TODO: Research why storing appId in .env file returns undefined

function DashboardLoginComponent(props) {
  const { setLoggedIn, setUser, countryISO } = props;
  const { isAuthorized, setIsAuthorized } = useContext(AuthorizationContext);
  // const [email, setEmail] = React.useState('');
  // const [password, setPassword] = React.useState('');
  const t = useT();
  const info = getOAuthInfo(countryISO.toUpperCase());

  const { getToken } = useJWTToken();

  const handleLogin = () => {
    IdentityManager.getCredential(info.portalUrl);
  };

  const handleLoginSuccess = () => {
    const portal = new Portal();
    portal.authMode = 'immediate';
    portal.load().then(async (response) => {
      // setLoggedIn(true);
      setUser(portal.user);
      setIsAuthorized(true);


      // Example of using the token to make an authenticated request to the backend
      const token = await getToken();
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // Your code to fire the event goes here
      handleLogin();
    }
  };

  useEffect(() => {
    IdentityManager.registerOAuthInfos([info]);
    IdentityManager.checkSignInStatus(info.portalUrl)
      .then(handleLoginSuccess)
      .catch((error) => {
        console.log('Not signed in:', error);
        throw Error(error);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h1 className={styles.title}>{t('Login')}</h1>
        {/* <FormControl variant="standard">
          <TextField
            label={t('Email address')}
            value={email}
            onKeyDown={handleKeyPress}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </FormControl>
        <FormControl variant="standard">
          <TextField
            label={t('Password')}
            type="password"
            value={password}
            onKeyDown={handleKeyPress}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </FormControl> */}
        <Button
          className={styles.saveButton}
          type="rectangular"
          label={t('Login')}
          handleClick={handleLogin}
        />
      </div>
    </div>
  );
}

export default DashboardLoginComponent;
