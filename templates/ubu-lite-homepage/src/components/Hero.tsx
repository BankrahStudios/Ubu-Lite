import React from 'react';
import styles from '../styles/home.module.css';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <h1>Freelance Creative Marketplace</h1>
                <p>Book designers, painters, musicians and more — fast.</p>
                <Link to="/services" className={styles.ctaButton as any}>Browse Services</Link>
            </div>
        </section>
    );
};

export default Hero;
