import React, { useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import cx from 'classnames';
import ShareModalButton from 'components/share-modal';
import styles from './featured-map-card-styles.module.scss'
import { ReactComponent as ChevronIcon } from 'icons/arrow_right.svg';

const FeaturesMapCardComponent = ({ 
  view,
  className,
  selectedSidebar,
  isLandscapeMode,
  isFullscreenActive,
  featuredMap,
  handleAllMapsClick,
  selectedFeaturedPlace,
  spinGlobe,
  handle
}) => {
  const isOpen = selectedSidebar === 'featuredMapCard';
  const isOnScreen = isOpen && !isLandscapeMode && !isFullscreenActive && !selectedFeaturedPlace;
  const animationConfig = { mass: 5, tension: 2000, friction: 200 }
  const slide = useSpring({
    config: animationConfig,
    from: { marginLeft: -400 },
    marginLeft: isOnScreen ? 0 : -400,
    delay: isOnScreen ? 400 : 0
  })

  const handleClick = () => {
    handleAllMapsClick();
    view.goTo({ zoom: 1 }).then(() => { spinGlobe(view) });
  }

  // if we first arrive to all maps screen
  useEffect(() => {
    if(!handle && !isOpen) { spinGlobe(view) }
  }, []);

  return (
    <animated.div className={cx(className, styles.cardContainer)} style={slide}>
      <section
        className={styles.titleSection}
        style={ {backgroundImage: `linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.3)), url(${featuredMap.image})`}}
      >
        <ShareModalButton theme={{ shareButton: styles.shareButton}} view={view} />
        <h2 className={styles.title}>{featuredMap.title}</h2>
      </section>
      <section className={styles.descriptionSection}>
        <p className={styles.description}>{featuredMap.description}</p>
        <button
          className={styles.allMapsButton}
          onClick={handleClick}
        >
          <span className={styles.buttonText}>All maps</span>
          <ChevronIcon className={styles.arrowIcon}/>
        </button>
      </section>
    </animated.div>
  )
}

export default FeaturesMapCardComponent;