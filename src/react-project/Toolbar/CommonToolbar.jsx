import React, { Component } from "react";
import styles from "react-project/Toolbar/Toolbar.module.scss";
import {
  iconHorizontalAlignment,
  iconVerticalAlignment,
} from "react-project/assets/Icons";
import { connect } from "react-redux";
import {
  RP_EVENT_CONNECTION_LINE_TYPE_CHANGED,
  RP_EVENT_VERTICAL_ALIGNMENT,
  RP_EVENT_HORIZONTAL_ALIGNMENT,
} from "shared/CSharedEvents";
import { commonSendEventFunction } from "shared/CSharedMethods";
import { ContextMenu } from "./ContextMenu";
import cls from "classnames";
import { ViewportAllower } from "react-project/components/viewportAllower/ViewportAllower";
import { DrawLineTypeDropdown } from './line-toolbar/DrawLineTypeDropdown';
import { ConnectionTypeDropdown } from './line-toolbar/ConnectionTypeDropdown';
import { setNewCurrentStepLabel } from "react-project/redux/current-step/actions";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";

class CommonToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multiSelect: this.props.multiSelect,
      urlValue: this.props.currentStep.object.url,
      isTextShape: this.props.currentStep.object.isTextShape,
    };
  }

  render() {
    const { sectionStyle: { height: upperElHeight } = {} } = this.props;

    const horizontalAlignment = () => {
      commonSendEventFunction(RP_EVENT_HORIZONTAL_ALIGNMENT, { id: this.props.currentStep.stepId });
    };

    const verticalAlignment = () => {
      commonSendEventFunction(RP_EVENT_VERTICAL_ALIGNMENT, { id: this.props.currentStep.stepId });
    };

    const selectingTypeOfToolbar = () => {
      if (this.state.multiSelect) {
        const tabClassName = cls(styles.IconAlignment, styles.StepToolbarTab);

        return (
          <div className={styles[this.props.currentStep.object.type]}>
            <ViewportAllower
              className={`${styles.Toolbar} ${styles.ToolbarMultiple}`}
              startX={this.props.position.x}
              startY={this.props.position.y}
              upperElHeight={upperElHeight}
            >
              <div className={tabClassName} onClick={() => verticalAlignment()}>
                {iconVerticalAlignment}{" "}
                <span className={styles.ToolbarTabText}>Align vertical center</span>
              </div>
              <div className={tabClassName} onClick={() => horizontalAlignment()}>
                {iconHorizontalAlignment}{" "}
                <span className={styles.ToolbarTabText}>Align horizontal center</span>
              </div>
              <ContextMenu />
            </ViewportAllower>
          </div>
        );
      } else if (this.props.currentStep.object.supportedLineTypes) {

        return (
          <div className={styles[this.props.currentStep.object.type]}>
            <ViewportAllower
              className={`${styles.Toolbar} ${styles.ToolbarMultiple}`}
              startX={this.props.position.x}
              startY={this.props.position.y}
              upperElHeight={upperElHeight}
            >
              <DrawLineTypeDropdown/>
              <ConnectionTypeDropdown/>
            </ViewportAllower>
          </div>
        );
      }

      return null;
    };

    return <div>{selectingTypeOfToolbar()}</div>;
  }
}

function mapStateToProps(state) {
  return {
    currentStep: selectCurrentStep(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetNewCurrentStepLabel: (newValue) => dispatch(setNewCurrentStepLabel(newValue)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommonToolbar);
