import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "react-project/components/colorPicker/ColorPicker.module.scss";
import { ColorPickerConfig } from "shared/CSharedConstants";
import { ColorPickerItem } from "./ColorPickerItem";

import { commonSendEventFunction } from "shared/CSharedMethods";
import { PR_EVENT_SHAPE_STYLE_CHANGED } from "shared/CSharedEvents";

const ColorPickerComponent = ({ type, color }) => {
  
  const [activeColor, setActiveColor] = useState("");

  useEffect(() => {
    if (activeColor !== "") {
      commonSendEventFunction(PR_EVENT_SHAPE_STYLE_CHANGED, { [type]: activeColor });
    }
  }, [activeColor]);

  return (
    <div className={styles.ColorPickerTab}>
      <div className={styles.Wrapper}>
        {ColorPickerConfig.map((item) => (
          <ColorPickerItem
            key={item.class}
            setActive={setActiveColor}
            isActive={color === item.color}
            value={item}
          />
        ))}
      </div>
    </div>
  );
};

ColorPickerComponent.propTypes = {
  type: PropTypes.string
};

export const ColorPicker = ColorPickerComponent;
