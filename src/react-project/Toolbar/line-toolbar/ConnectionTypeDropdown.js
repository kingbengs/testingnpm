import { DropdownBlock } from "react-project/components/dropdown/DropdownBlock";
import styles from "react-project/Toolbar/Toolbar.module.scss";
import commonDropdownStyles from "react-project/components/dropdown/Dropdown.module.scss";
import { DropdownItem } from "react-project/components/dropdown/DropdownItem";
import { EConnectionLineType } from "pixi-project/base/joint/CConnectionConstants";
import { TEXTS_CONNECTION_LINE_TYPES } from "react-project/Constants/texts";
import { commonSendEventFunction } from "shared/CSharedMethods";
import {
  iconDirectLineType,
  iconDottedLineType,
  iconNoDataLineType,
} from "react-project/assets/Icons";
import React, { forwardRef, useState, useEffect } from "react";
import cls from "classnames";
import { Dropdown } from "react-project/components/dropdown/Dropdown";
import { ClickOutsideCustomComponent } from "../../Util/ClickOutsideCustom";
import { useSelector } from "react-redux";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";
import { RP_EVENT_CONNECTION_LINE_TYPE_CHANGED } from "shared/CSharedEvents";

const LINE_TYPE_INFO = {
  [EConnectionLineType.SOLID]: {
    label: TEXTS_CONNECTION_LINE_TYPES[EConnectionLineType.SOLID],
    icon: iconDirectLineType,
  },
  [EConnectionLineType.DOTTED]: {
    label: TEXTS_CONNECTION_LINE_TYPES[EConnectionLineType.DOTTED],
    icon: iconDottedLineType,
  },
  [EConnectionLineType.NODATA]: {
    label: TEXTS_CONNECTION_LINE_TYPES[EConnectionLineType.NODATA],
    icon: iconNoDataLineType,
  },
};

const ConnectionTypeDropdownTrigger = forwardRef(({ isOpen, value, lineType, ...rest }, ref) => {
  const tabClassName = cls(styles.LineToolbarTab, styles.StepToolbarTab);
  const buttonClassName = cls(styles.LineTypeBtn, {
    [styles.LineTypeBtnActive]: isOpen,
  });

  const { [lineType]: { icon } = {} } = LINE_TYPE_INFO;

  return (
    <div className={tabClassName} {...rest}>
      <div className={buttonClassName}>{icon}</div>
      <span className={styles.ToolbarTabText}>Connection Type</span>
    </div>
  );
});

export const ConnectionTypeDropdown = (props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [lineType, setLineType] = useState(false);
  const currentStep = useSelector(selectCurrentStep);

  const availableLineTypes = currentStep.object.supportedLineTypes;

  useEffect(() => {
    setLineType(currentStep.object.lineType);
  }, [currentStep.object.lineType]);

  const switchConnectionLineType = (lineType) => {
    setLineType(lineType);
    commonSendEventFunction(RP_EVENT_CONNECTION_LINE_TYPE_CHANGED, {
      id: currentStep.stepId,
      lineType,
    });
  };

  const renderLineTypes = () => {
    const mappedLineTypes = availableLineTypes.map((item) => (
      <DropdownItem
        className={cls(commonDropdownStyles.DropdownItem, {
          [commonDropdownStyles.DropdownItemActive]: lineType === item,
        })}
        icon={LINE_TYPE_INFO[item].icon}
        label={LINE_TYPE_INFO[item].label}
        key={LINE_TYPE_INFO[item].label}
        onClick={() => switchConnectionLineType(item)}
      />
    ));

    return <>{mappedLineTypes}</>;
  };

  return (
    <Dropdown
      contentClassName={styles.LineSettingDropdown}
      triggerSlot={<ConnectionTypeDropdownTrigger lineType={lineType} />}
      onToggle={(opened) => setDropdownOpened(opened)}
      isOpen={dropdownOpened}
    >
      <ClickOutsideCustomComponent
        onClickOutside={() => {
          setDropdownOpened(false);
        }}
      >
        <div className={cls(commonDropdownStyles.CommonDropdownItems)}>
          <DropdownBlock>{renderLineTypes()}</DropdownBlock>
        </div>
      </ClickOutsideCustomComponent>
    </Dropdown>
  );
};
