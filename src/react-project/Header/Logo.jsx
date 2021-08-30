import React from "react";

import { logo } from '../assets/Icons';
import styles from './Logo.module.scss'

function Logo(props) {
    return (
        <div className={styles.Wrapper}>{logo}</div>
    );
}

export default Logo;