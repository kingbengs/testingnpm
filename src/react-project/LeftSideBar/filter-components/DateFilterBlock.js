import React, { useEffect, useRef, useState } from "react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import styles from "react-project/LeftSideBar/LeftSideBar.module.scss";
import { iconCalendar } from "react-project/assets/Icons";
import cls from "classnames";
import PropTypes from "prop-types";
import { getDirtyStyle, getFilterAddClass } from "react-project/Util/FilterStyleHelper";
import moment from 'moment';
import {
  FILTER_ITEM_PADDING_WIDTH,
  FILTER_TYPE_COMPARE,
  LEFT_SIDEBAR_WIDTH,
} from 'shared/CSharedConstants';
import { hasScrollBar } from 'react-project/Util/hasScrollBar';
import { getRefPosition } from "react-project/Util/getRefPosiiton";

const dateFormatterToLocale = (rawDate) => {
  return new Date(rawDate).toLocaleDateString("en-US");
};

export const dateFormatter = (rawDate) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(rawDate));
};

const DATEPICKER_OFFSET = 1;

export const DateFilterBlock = ({
  inputStart,
  inputFinish,
  onSelectDate,
  sendToStore,
  type,
  scrollTopPosition,
}) => {
  const [dateOpened, setDateOpened] = useState(false);

  const onSelect = (event, picker) => {
    if (!event) {
      return;
    }

    if (event.type === 'show') {
      setDateOpened(true);
      return;
    }
    if (event.type === 'hide') {
      setDateOpened(false);
      return;
    }

    if (event.type === 'apply') {
      const dateRangeValue = {
        min: dateFormatter(picker.startDate),
        max: dateFormatter(picker.endDate),
      };
      onSelectDate({
        inputStart: dateRangeValue.min,
        inputFinish: dateRangeValue.max,
      });
      setDateOpened(false);
      sendToStore(dateRangeValue);
    }
  };

  const ref = useRef();

  useEffect(() => {
    // This is necessary in order to position the datepicker, if it is open and we scroll the sidebar
    if (dateOpened) {
      const position = getRefPosition(ref);
      const sidebar = document.getElementById('left-sidebar-wrapper');
      const index = (type === FILTER_TYPE_COMPARE) ? 1 : 0;
      const datePicker = document.getElementsByClassName('show-calendar')[index];
      const top = parseFloat(getComputedStyle(datePicker).top);
      const marginTop = -(top - position.y + DATEPICKER_OFFSET);
      datePicker.style.marginTop = `${marginTop}px`;
      datePicker.style.marginLeft = `${
        LEFT_SIDEBAR_WIDTH - (hasScrollBar(sidebar) ? FILTER_ITEM_PADDING_WIDTH : 0)
      }px`;
      datePicker.style.zIndex = 2;
      datePicker.style.position = 'absolute';
    }
  }, [dateOpened, scrollTopPosition]);

  return (
    <div
      className={cls(styles.FiltersItem, getDirtyStyle(type), getFilterAddClass(type), {
        [styles.ActiveFilter]: dateOpened,
      })}
      ref={ref}
    >
      <DateRangePicker
        autoApply={true}
        autoUpdateInput={false}
        initialSettings={{
          opens: 'right',
          startDate: dateFormatterToLocale(inputStart),
          endDate: dateFormatterToLocale(inputFinish),
          locale: {
            applyLabel: 'Ok',
          },
          alwaysShowCalendars: true,
          ranges: {
            Today: [moment(), moment()],
            Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month'),
            ],
          },
        }}
        onEvent={onSelect}
      >
        <div className={cls(styles.ItemsForSelection, { [styles.DatePickerFilter]: dateOpened })}>
          <span className={styles.DateBlock}>
            {dateFormatter(inputStart)} - {dateFormatter(inputFinish)}
          </span>
          <div>{iconCalendar}</div>
        </div>
      </DateRangePicker>
    </div>
  );
};

DateFilterBlock.propType = {
  inputStart: PropTypes.string.isRequired,
  inputFinish: PropTypes.string.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  sendToStore: PropTypes.func.isRequired,
};
