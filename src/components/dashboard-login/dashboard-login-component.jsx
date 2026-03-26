import React, { useEffect } from 'react';

import { useT } from '@transifex/react';

import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import Portal from '@arcgis/core/portal/Portal';
import { FormControl, TextField } from '@mui/material';
import useJWTToken from 'hooks/useJWTToken';
import Button from 'components/button';

import styles from './dashboard-login-styles.module.scss';

// TODO: Research why storing appId in .env file returns undefined
const info = new OAuthInfo({
  appId: '2g74U2WEt7zh0Kpx',//'zhWvIGYPUcFL8BbC',
  popup: false,
  portalUrl: 'https://guyana.maps.arcgis.com',
});

function DashboardLoginComponent(props) {
  const { setLoggedIn, setUser } = props;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const t = useT();

  const { getToken } = useJWTToken();

  const handleLogin = () => {
    IdentityManager.getCredential(info.portalUrl);
    // if (email.includes('@yale.edu') && password === 'nbis') {
    //   setLoggedIn(true);
    // }
  };

  const handleLoginSuccess = () => {
    const portal = new Portal();
    portal.authMode = 'immediate';
    portal.load().then(async (response) => {
      setLoggedIn(true);
      setUser(portal.user);


      // Example of using the token to make an authenticated request to the backend
      const token = await getToken();
      console.log('Obtained token:', token);

      fetch('https://test-api-dot-api-2-x-dot-map-of-life.appspot.com/2.x/nbis/get-arcgis-user-info', {
        method: 'GET',
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
        <FormControl variant="standard">
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
        </FormControl>
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
