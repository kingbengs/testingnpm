import { DropdownBlock } from "react-project/components/dropdown/DropdownBlock";
import styles from "react-project/Toolbar/Toolbar.module.scss";
import commonDropdownStyles from "react-project/components/dropdown/Dropdown.module.scss";
import { iconStraightLine, iconBeizerLine } from "react-project/assets/Icons";
import { DropdownItem } from "react-project/components/dropdown/DropdownItem";
import { TEXTS_STRAIGHT_LINE_TYPES, TEXTS_BEZIER_LINE_TYPES } from "react-project/Constants/texts";
import React, { forwardRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import cls from "classnames";
import { Dropdown } from "react-project/components/dropdown/Dropdown";
import { ClickOutsideCustomComponent } from "../../Util/ClickOutsideCustom";
import { RP_EVENT_DRAW_LINE_TYPE_CHANGED } from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { EConnectionDrawLineType } from "pixi-project/base/joint/CConnectionConstants";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";

const LineTypeDropdownTrigger = forwardRef(({ isOpen, value, drawLineType, ...rest }, ref) => {
  const tabClassName = cls(styles.LineToolbarTab, styles.StepToolbarTab);
  const buttonClassName = cls(styles.LineTypeBtn, {
    [styles.LineTypeBtnActive]: isOpen,
  });

  const icon =
    drawLineType === EConnectionDrawLineType.STRAIGHT ? iconStraightLine : iconBeizerLine;

  return (
    <div className={tabClassName} {...rest}>
      <div className={buttonClassName}>{icon}</div>
      <span className={styles.ToolbarTabText}>Line Type</span>
    </div>
  );
});

export const DrawLineTypeDropdown = (props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [drawLineType, setDrawLineType] = useState(false);
  const currentStep = useSelector(selectCurrentStep);

  useEffect(() => {
    setDrawLineType(currentStep.object.drawLineType);
  }, [currentStep.object.drawLineType]);

  const switchDrawLineType = (lineType) => {
    setDrawLineType(lineType);
    commonSendEventFunction(RP_EVENT_DRAW_LINE_TYPE_CHANGED, {
      id: currentStep.stepId,
      lineType,
    });
  };

  return (
    <Dropdown
      contentClassName={styles.LineSettingDropdown}
      triggerSlot={<LineTypeDropdownTrigger drawLineType={drawLineType} />}
      onToggle={(opened) => setDropdownOpened(opened)}
      isOpen={dropdownOpened}
    >
      <ClickOutsideCustomComponent
        onClickOutside={() => {
          setDropdownOpened(false);
        }}
      >
        <div className={cls(commonDropdownStyles.CommonDropdownItems)}>
          <DropdownBlock>
            <DropdownItem
              className={cls(commonDropdownStyles.DropdownItem, {
                [commonDropdownStyles.DropdownItemActive]:
                  drawLineType === EConnectionDrawLineType.STRAIGHT,
              })}
              onClick={() => switchDrawLineType(EConnectionDrawLineType.STRAIGHT)}
              icon={iconStraightLine}
              label={TEXTS_STRAIGHT_LINE_TYPES}
              key={0}
            />
            <DropdownItem
              className={cls(commonDropdownStyles.DropdownItem, {
                [commonDropdownStyles.DropdownItemActive]:
                  drawLineType === EConnectionDrawLineType.BEZIER,
              })}
              onClick={() => switchDrawLineType(EConnectionDrawLineType.BEZIER)}
              icon={iconBeizerLine}
              label={TEXTS_BEZIER_LINE_TYPES}
              key={1}
            />
          </DropdownBlock>
        </div>
      </ClickOutsideCustomComponent>
    </Dropdown>
  );
};
