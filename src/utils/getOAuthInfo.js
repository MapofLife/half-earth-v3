import IdentityManager from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';

export const getOAuthInfo = (countryISO) => {
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
