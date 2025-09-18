import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.mainLoader}>
                <div className={styles.ringContainer}>
                    <div className={styles.ring}></div>
                    <div className={styles.ring2}></div>
                    <div className={styles.centerJewel}></div>
                </div>

                <div className={styles.textContainer}>
                    <h1 className={styles.brandText}>NEXORA</h1>
                    <p className={styles.tagline}>Jewels</p>
                </div>

                <div className={styles.dotsContainer}>
                    <div className={`${styles.dot} ${styles.dot1}`}></div>
                    <div className={`${styles.dot} ${styles.dot2}`}></div>
                    <div className={`${styles.dot} ${styles.dot3}`}></div>
                </div>
            </div>

            <div className={styles.loadingLine}>
                <div className={styles.loadingProgress}></div>
            </div>
        </div>
    );
};

export default Loader;