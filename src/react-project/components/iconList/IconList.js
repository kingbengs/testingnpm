import React from 'react';
import flattenDeep from 'lodash/flattenDeep';
import styles from './IconList.module.scss';
import { ActionTypes, IconsConfig } from 'shared/CSharedConstants';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-project/components/tooltip/Tooltip';
import { isCommerceAction } from "react-project/Constants/commerceAction";

const IconListComponent = ({
  type,
  colls = 6,
  textSearch = '',
  onIconClick,
  onDragEnd,
  isDisabledMapTab,
  withSpecialItems = false,
}) => {
  const classGrid = cls(
    styles.IconsSet,
    { [styles.FiveColls]: colls === 5 },
    { [styles.SixColls]: colls === 6 }
  );

  const isAllIcons = textSearch.length > 0 && isDisabledMapTab;
  const allIcons = Object.values(IconsConfig).reduce((res, curr) => res.concat(curr));
  const keys = Object.keys(IconsConfig).filter((el) => el.includes(type));
  const iconsWithSpecialItems = [];
  keys.forEach((key) => iconsWithSpecialItems.push(IconsConfig[key]));

  const icons = withSpecialItems ? flattenDeep(iconsWithSpecialItems) : IconsConfig[type];
  const iconsList = isAllIcons ? allIcons : icons;

  const itemsFilterData = iconsList.filter((icon) => {
    const iconNameLower = icon.name.toLowerCase();
    const textSearchLower = textSearch.toLowerCase();

    return iconNameLower.indexOf(textSearchLower) > -1;
  });

  const transformName = (name) => {
    switch (name) {
      case 'googleads':
        return 'googlenotblocked';
      case 'adnetwork':
        return 'network';
      case 'printad':
        return 'print';
      default:
        return name;
    }
  };

  return (
    <div className={cls(styles.IconsSection, { [styles.LowSection]: colls === 6 })}>
      <div className={classGrid}>
        {itemsFilterData.map((icon, i) => {
          const nameWithoutSpaces = icon.name.split(' ').join('').toLowerCase();
          const mappedName = transformName(nameWithoutSpaces);
          const src = `${process.env.PUBLIC_URL}${icon.src}${mappedName}.svg`;
          const srcPixi = `${process.env.PUBLIC_URL}${icon.srcPixi}${mappedName}.png`;
          return (
            <Tooltip key={icon.name + i} label={icon.name}>
              <div className={styles.ListItem}>
                <div
                  draggable={true}
                  className={styles.IconContainer}
                  onClick={() =>
                    onIconClick({
                      src: srcPixi.substring(7, srcPixi.length),
                      title: icon.name,
                      type,
                      actionType: isCommerceAction(icon.id) ? ActionTypes.COMMERCE : ActionTypes.NONE
                    })
                  }
                  onDragEnd={(e) =>
                    onDragEnd(e.clientX, e.clientY, {
                      src: srcPixi.substring(7, srcPixi.length),
                      title: icon.name,
                      type,
                    })
                  }
                >
                  <img name={icon.name} src={src} alt="" />
                </div>
                <div className={styles.IconTitle}>{icon.name}</div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

IconListComponent.propTypes = {
  type: PropTypes.string.isRequired,
  colls: PropTypes.number,
  textSearch: PropTypes.string,
  onIconClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  isDisabledMapTab: PropTypes.bool,
};

export const IconList = IconListComponent;
