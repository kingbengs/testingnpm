import React, { Component } from "react";
import { iconFocusStep /*, iconForecast, iconLayers, iconSplitLink*/ } from "../assets/Icons";
import styles from "./AnalyticsBar.module.scss";
import { RP_EVENT_TOGGLE_PANEL_STATUS } from "../../shared/CSharedEvents";
import { Tooltip } from "react-project/components/tooltip/Tooltip";
import { TEXTS_TOOLTIP } from "react-project/Constants/texts";

class AnalyticsBar extends Component {
  state = {
    isFlowActive: false,
    isForecastActive: false,
  };

  setActive = (type) => {
    this.setState({
      [type]: !this.state[type],
    });
    setTimeout(() => {
      const event = new CustomEvent(RP_EVENT_TOGGLE_PANEL_STATUS, {
        detail: {
          numbers: this.props.isNumbersActive,
          flow: this.state.isFlowActive,
          forecast: this.state.isForecastActive,
        },
      });
      document.dispatchEvent(event);
    }, 0);
  };

  toggleNumbersLayer = () => {
    this.props.setIsNumbersActive(!this.props.isNumbersActive);
    const event = new CustomEvent(RP_EVENT_TOGGLE_PANEL_STATUS, {
      detail: {
        numbers: !this.props.isNumbersActive,
        flow: this.state.isFlowActive,
        forecast: this.state.isForecastActive,
      },
    });
    document.dispatchEvent(event);
  };

  componentDidMount() {}

  render() {
    let isActiveNumbersClass = this.props.isNumbersActive ? styles.Active : "";
    /* let isActiveFlowClass = this.state.isFlowActive ? styles.Active : '';
        let isActiveForecastClass = this.state.isForecastActive ? styles.Active : '';*/

    return (
      <div className={styles.Wrapper}>
        <div className={styles.AnalyticsControl}>
          <div
            className={`${styles.AnalyticsControlItem} ${isActiveNumbersClass} ${styles.IconNumber}`}
          >
            <Tooltip label={!this.props.isNumbersActive ? TEXTS_TOOLTIP.ACTIVATE_ANALYTICS : ""}>
              <div className={styles.SwitchWrapper}>
                <label className={`${styles.Switch}`}>
                  <input onClick={this.toggleNumbersLayer} type="checkbox" />
                  <span className={styles.SliderRound}></span>
                </label>
              </div>
            </Tooltip>
            <span>{iconFocusStep}</span>
            <span className={styles.Title}>Analytics</span>
          </div>
          {/*NEW-84: hide unimplemented features */}
          {/*<div className={`${styles.AnalyticsControlItem} ${isActiveFlowClass} ${styles.IconSplitLink}`}>*/}
          {/*    <span>{iconSplitLink}</span>*/}
          {/*    <label className={`${styles.Switch}`}>*/}
          {/*        <input type="checkbox" onClick={() => this.setActive('isFlowActive')}/>*/}
          {/*        <span className={styles.SliderRound}></span>*/}
          {/*    </label>*/}
          {/*    <span className={styles.Title}>Flow</span>*/}
          {/*</div>*/}
          {/*<div className={`${styles.AnalyticsControlItem} ${isActiveForecastClass} ${styles.IconForecast}`}>*/}
          {/*    <span >{iconForecast}</span>*/}
          {/*    <label className={`${styles.Switch}`}>*/}
          {/*        <input type="checkbox" onClick={() => this.setActive('isForecastActive')}/>*/}
          {/*        <span className={styles.SliderRound}></span>*/}
          {/*    </label>*/}
          {/*    <span className={styles.Title}>Forecast</span>*/}
          {/*</div>*/}
        </div>
      </div>
    );
  }
}

export default AnalyticsBar;
