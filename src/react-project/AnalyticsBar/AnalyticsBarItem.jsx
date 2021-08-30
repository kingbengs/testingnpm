import React from 'react';
import styles from './ToolsBox.module.scss';
import {iconArrow} from "../assets/Icons";

function ToolsItem({icon, extended, open, openExtended, type, createObject, createTextObject, event, panning, setState, active}) {

    const someNewClick = (elType, e) => {
        createObject && createObject(elType, e);
        panning && panning(elType);
    }

    const someNewDragEnd = (elType, e) => {
        createObject && createObject(elType, e);
        createTextObject && createTextObject(elType, e);
    }

    let ActiveClass = active ? styles.Active : null;

    return (
        <li className={`${styles.Item} ${ActiveClass}`}>
            <div draggable={true}
                className={styles.Icon}
                onClick={() => openExtended ? openExtended(type) : event && event()}
                onDragEnd={(e) => someNewDragEnd(type, e)}
            >
                {icon}
            </div>

            {extended &&
            <>
                <span
                    className={styles.Arrow}
                    style={open ? {transform: 'rotate(180deg)'} : {}}
                >
                    {iconArrow}
                </span>

                {open && <ul className={styles.ExtendedWrapp}>
                    {extended.map((el, i) => {
                        return <li draggable={true} key={el.type} onDragEnd={(e) => someNewDragEnd(el.type, e)} onClick={(e) => someNewClick(el.type, e)}>{el.icon}</li>
                    })}
                </ul>
                }
            </>
            }
        </li>
    );
}

export default ToolsItem;