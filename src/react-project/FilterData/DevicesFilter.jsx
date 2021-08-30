import React, { Component } from 'react';
import PropTypes from "prop-types";
import styles from './FilterData.module.scss';
import { connect } from 'react-redux';
import { FILTER_ITEM_PADDING_WIDTH, HEADER_HEIGHT, LEFT_SIDEBAR_WIDTH } from 'shared/CSharedConstants';
import { hasScrollBar } from 'react-project/Util/hasScrollBar';
import { getRefPosition } from "react-project/Util/getRefPosiiton";
import { selectCurrentStep } from "../redux/current-step/selectors";
import { selectFunnelConfiguration } from "../redux/funnel-configuration/selectors";

class DevicesFilter extends Component {

    constructor(props) {
        super(props);
        const devicesList = ['all devices', 'mobile', 'desktop'];
        let device = props.selectedDevice;

        this.state = {
            selectedDevice: device,
            devicesList: devicesList
        }
    }

    setDevice = (type) => {
        this.setState({
            selectedDevice: type
        })
        this.props.setSelectedDevice(type);
    }

    render() {
        const SectionItems = this.state.devicesList.map((Item, i) => {
            return (
                <div key={Item + i}
                     className={`${styles.SectionItem} ${styles.DeviceSectionItem} ${this.state.selectedDevice === Item ? styles.ActiveItem : ''} `}
                     onClick={() => {
                         this.setDevice(Item);
                     }}>
                    <div className={styles.FlexBlock}>
                        <span className={styles.CircleIcon}></span>
                        <span className={styles.CapitalizeTitle}>{Item}</span>
                    </div>
                </div>
            )
        })

        const sidebar = document.getElementById('left-sidebar-wrapper');
        const position = getRefPosition(this.props.innerRef);

        return (
          <div
            className={styles.DevicesList}
            style={{
              position: 'absolute',
              top: position.y - HEADER_HEIGHT,
              left: LEFT_SIDEBAR_WIDTH + (hasScrollBar(sidebar) ? 0 : FILTER_ITEM_PADDING_WIDTH),
              zIndex: 2,
            }}
          >
            {SectionItems}
          </div>
        );
    }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
    funnelConfiguration: selectFunnelConfiguration(state),
  };
}

DevicesFilter.propTypes = {
  selectedDevice: PropTypes.string.isRequired,
  setSelectedDevice: PropTypes.func.isRequired,
  funnel: PropTypes.shape({
    projectId: PropTypes.string.isRequired
  })
};

export default connect(mapStateToProps)(DevicesFilter);
