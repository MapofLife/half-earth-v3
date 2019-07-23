import React, { useState } from 'react';
import cx from 'classnames';
import { WebScene } from '@esri/react-arcgis';
import styles from 'styles/themes/scene-theme.module.scss';
const { REACT_APP_ARGISJS_API_VERSION:API_VERSION } = process.env

const GlobeComponent = ({ sceneId, sceneSettings, onLoad, children, loadElement }) => {
  const [ sceneMap, setMap ] = useState(null);
  const [ sceneView, setView ] = useState(null);
  const [ sceneLoaded, setLoaded ] = useState(false);

  const handleOnLoad = (map, view) => {
    setMap(map);
    setView(view);
    setLoaded(true);
    onLoad && onLoad(map, view);
  }

  return (
    <WebScene
      style={{ backgroundColor: '#0A212E' }}
      className={cx(styles.sceneContainer)}
      id={sceneId}
      onLoad={handleOnLoad}
      onFail={ e => console.warn(e)}
      viewProperties={sceneSettings}
      loaderOptions={{ url: `https://js.arcgis.com/${API_VERSION}` }}
      loadElement={loadElement}
    >
      <div className={styles.content}>
        {sceneLoaded && React.Children.map(children || null, (child, i) => {
          return child && <child.type key={i} map={sceneMap} view={sceneView} {...child.props}/>;
        })}
      </div>
    </WebScene>
  )
}

export default GlobeComponent;