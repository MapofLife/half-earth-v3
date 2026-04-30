import React, { useContext, useEffect, useState } from 'react';

import { useT, T } from '@transifex/react';
import Button from 'components/button';
import cx from 'classnames';
// import styles from '../../dashboard-trends-sidebar-styles.module.scss';
import styles from '../../containers/sidebars/dashboard-trends-sidebar/dashboard-trends-sidebar-styles.module.scss';
import { LightModeContext } from 'context/light-mode'

const DownloadGbifReport = ({type}) => {
  const t = useT();
  const { lightMode } = useContext(LightModeContext);

  const downloadReport = async () => {
    let url = 'dashboard/gbif/per/PER_spi_es_report.pdf';
    let fileName = 'PER_spi_es_report.pdf';
    if (type === 'shi') {
      url = 'dashboard/gbif/per/PER_shi_es_report.pdf';
      fileName = 'PER_shi_es_report.pdf';
    } else if(type === 'sii') {
      url = 'dashboard/gbif/per/PER_sii_es_report.pdf';
      fileName = 'PER_sii_es_report.pdf';
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobURL;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  return (
    <Button
      type="rectangular"
      className={cx(styles.saveButton, styles.notActive)}
      label={t('Descargar informe de GBIF')}
      handleClick={() => downloadReport()}
    />
  )
}

export default DownloadGbifReport
