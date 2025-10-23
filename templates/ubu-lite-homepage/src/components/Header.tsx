import React from 'react';
import { Link } from 'react-router-dom';
import { getUser, logout } from '../../auth';
import styles from '../../styles/home.module.css';

const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <h1>UBU Lite</h1>
            </div>
            <nav className={styles.nav}>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/marketplace">Marketplace</Link></li>
                    <li><Link to="/creatives">Creatives</Link></li>
                    <li><Link to="/services">Services</Link></li>
                    <li><Link to="/bookings">Bookings</Link></li>
                    <li><Link to="/messages">Messages</Link></li>
                    <li><Link to="/wallet">Wallet</Link></li>
                    <li><Link to="/escrows">Escrows</Link></li>
                    {getUser() ? (
                      <>
                        <li>Hi, {getUser()!.username}</li>
                        <li><button onClick={logout} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button></li>
                      </>
                    ) : (
                      <>
                        <li><Link to="/app-login">Login</Link></li>
                        <li><Link to="/app-register">Register</Link></li>
                      </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
