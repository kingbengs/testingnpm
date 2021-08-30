import React, { Component } from "react";
import ToolsItem from "./ToolsItem";
import {
  iconCircleTiny,
  iconPanTool,
  iconPaste,
  iconPlus,
  iconRedo,
  iconSaveBtn,
  iconSelect,
  iconSquare,
  iconText,
  iconTriangle,
  iconUndo,
} from "../assets/Icons";
import styles from "./ToolsBox.module.scss";
import dropdownStyles from "react-project/components/dropdown/Dropdown.module.scss";
import {
  PR_EVENT_CONNECTION_IN_EMPTY_SPACE,
  PR_EVENT_EDIT_MODE,
  PR_EVENT_TEXT_EDITING_FINISH,
  RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION,
  RP_EVENT_CREATE_OBJECT,
  RP_EVENT_CURSOR_TYPE,
  RP_EVENT_OBJECT_DRAG_START,
  PR_EVENT_QUICK_PANNING_MODE_CHANGED,
  PR_EVENT_TOOLBOX_STATE_CHANGED,
  RP_EVENT_PASTE_PRESSED,
  PR_EVENT_SHAPE_DRAWING_ENDED,
  RP_EVENT_SAVE_TO_PNG,
  RP_EVENT_EMPTY_CANVAS_POINTER_UP,
  RP_EVENT_ESC_PRESSED,
  RP_EVENT_EMPTY_CANVAS_DOUBLE_CLICK,
  RP_EVENT_UNDO_CLICKED,
  RP_EVENT_REDO_CLICKED,
  PR_EVENT_UNDO_REDO_ACTIONS_UPDATED,
  RP_EVENT_ELEMENT_RIGHT_CLICK,
} from "shared/CSharedEvents";
import { EElementCategories } from "shared/CSharedCategories";
import { commonSendEventFunction } from "shared/CSharedMethods";
import StepsModal from "react-project/StepsModal/StepsModal";
import {
  TEXT_ADD_STEP,
  TEXT_PASTE_OBJECT,
  TEXT_REDO_ACTION,
  TEXT_UNDO_ACTION,
  TEXTS_SHAPES,
  TEXTS_TOOLTIP,
} from "react-project/Constants/texts";
import {
  DEFAULT_TEXT_VALUE,
  ACTIVE_STATE_DEFAULT,
  ACTIVE_STATE_SELECT,
  ACTIVE_STATE_PAN,
  ACTIVE_STATE_DRAW,
  ACTIVE_STATE_TEXT,
  EShapeTypes,
  FILTER_TYPE_COMPARE,
  FILTER_TYPE_DEFAULT,
} from "shared/CSharedConstants";
import { ViewportAllower } from "react-project/components/viewportAllower/ViewportAllower";
import { DropdownBlock } from "react-project/components/dropdown/DropdownBlock";
import { DropdownItem } from "react-project/components/dropdown/DropdownItem";
import { setStepFilterOpened } from "react-project/redux/focused-step/actions";
import { connect } from "react-redux";
import {
  selectCompareStepFocused,
  selectStepFocused,
} from "react-project/redux/focused-step/selectors";
import { ContextMenu } from "react-project/Toolbar/ContextMenu";
import { ItemsWithLabelCustomization } from "react-project/Constants/step-settings";
import { selectCurrentStep } from "react-project/redux/current-step/selectors";
import { selectInputValues } from "react-project/redux/inputs/selectors";
import { clearInputsState } from "react-project/redux/inputs/actions";
import { setPerfectShapeGuideStatus, setPanGuideStatus } from "react-project/redux/notification-alerts/actions";
import { notifyIfValueChanged, onCloseMenu } from "react-project/Util/InputHelpers";
import { CANVAS_ACTION_NAMES } from "react-project/Constants/canvasActionNames";

class ToolsBox extends Component {
  state = {
    contextMenuOpened: false,
    contextElementMenuOpened: false,
    position: {
      x: 0,
      y: 0,
    },
    contextElementMenuPosition: {
      x: 0,
      y: 0,
    },
    showSteps: false,
    showToolBoxSteps: false,
    open: {
      draw: false,
    },
    prevActiveState: '',
    activeState: ACTIVE_STATE_SELECT,
    selectedDrawItem: {
      icon: iconCircleTiny,
      actionName: CANVAS_ACTION_NAMES.DRAW_CIRCLE,
      tooltipLabel: TEXTS_TOOLTIP.DRAW_CIRCLE,
      label: TEXTS_SHAPES[EShapeTypes.ELLIPSE],
      type: EShapeTypes.ELLIPSE
    },
    isEditMode: false,
    port: '',
    canPaste: false,
    canUndo: false,
    canRedo: false,
  };

  categoryText = EElementCategories.TEXT;
  categoryStep = EElementCategories.STEP;
  categoryClicking = EElementCategories.CLICKING;
  categoryPanning = EElementCategories.PANNING;
  categoryNone = EElementCategories.NONE;

  openExtended = (state) => {
    this.setActiveState(state);
    this.forceCloseExtended();
    this.setState({
      open: {
        ...this.state.open,
        [state]: !this.state.open[state],
      },
    });
  };

  portCleaning = () => {
    this.setState({
      port: "",
    });
  };

  forceCloseExtended = () => {
    this.setState({
      open: {
        select: false,
        draw: false,
      },
    });
    if (this.state.port) {
      commonSendEventFunction(RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION, {});
      this.portCleaning();
    }
    if (
      this.state.activeState !== ACTIVE_STATE_DRAW &&
      this.state.activeState !== ACTIVE_STATE_TEXT &&
      this.state.activeState !== ACTIVE_STATE_PAN
    ) {
      this.setActiveState(ACTIVE_STATE_SELECT);
    }
  };

  onTextEditingFinish = () => {
    this.setActiveState(ACTIVE_STATE_SELECT);
  };

  onDrawShapeEnded = () => {
    this.setActiveState(ACTIVE_STATE_SELECT);
  };

  onESCPressed = (e) => {
    this.setActiveState(ACTIVE_STATE_SELECT);
    this.props.onSetStepOpened({ id: FILTER_TYPE_COMPARE, selectedStep: this.props.compareStepFocused.selectedValue, value: false});
    this.props.onSetStepOpened({ id: FILTER_TYPE_DEFAULT, selectedStep: this.props.stepFocused.selectedValue, value: false});
  };

  setIcon = (activeIcon) => {
    this.setState({
      iconType: activeIcon,
    });
  };

  toggleTextTool = () => {
    const newActiveState =
      this.state.activeState !== this.categoryText ? this.categoryText : ACTIVE_STATE_DEFAULT;

    this.setActiveState(newActiveState);
  };


  closeNotificationAlarm = (activeState) => {
    if (activeState !== ACTIVE_STATE_PAN){
      this.props.setPanGuideStatus(false);
    }
  }

  setActiveState = (activeState) => {

    this.closeNotificationAlarm(activeState);
    this.props.setPerfectShapeGuideStatus(activeState === ACTIVE_STATE_DRAW);

    this.setState({prevActiveState : this.state.activeState});

    if (activeState !== this.categoryStep) {
      this.props.openModal(false);
    }

    if(activeState === ACTIVE_STATE_SELECT || activeState === ACTIVE_STATE_DRAW) {
      this.panning(this.categoryClicking);
    }

    this.setState({
      activeState: activeState,
    });

    commonSendEventFunction(PR_EVENT_TOOLBOX_STATE_CHANGED, { state: activeState });
  };

  editModeHandler = (e) => {
    this.setState({
      isEditMode: e.detail.value,
    });
  };

  onSelectDrawItem = (item) => {
    this.setState({ selectedDrawItem: item });
  };

  getShapeTooltip = (icon) => {
    switch (icon) {
      case iconSquare:
        return TEXTS_TOOLTIP.DRAW_RECTANGLE;
      case iconCircleTiny:
        return TEXTS_TOOLTIP.DRAW_CIRCLE;
      case iconTriangle:
        return TEXTS_TOOLTIP.DRAW_TRIANGLE;
      default:
        return TEXTS_TOOLTIP.DRAW_CIRCLE;
    }
  };

  createTextObject = (category, e) => {
    if (this.state.isEditMode) {
      return;
    }

    commonSendEventFunction(RP_EVENT_CREATE_OBJECT, {
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      object: {
        category: category,
        text: DEFAULT_TEXT_VALUE,
      },
    });

    if (this.state.activeState === this.categoryText) {
      this.toggleTextTool();
    }
  };

  notifyDragStarted = (category) => {
    commonSendEventFunction(RP_EVENT_OBJECT_DRAG_START, { object: { category: category, text: DEFAULT_TEXT_VALUE } });

    //TODO this is a hack , a proper state needs to be set once we drop the text item on the canvas.
    // but that will be done after refactoring some code
    this.setActiveState(ACTIVE_STATE_DEFAULT);
  };

  forcePanningMode = (e) => {
    let isPanning = e.detail['isPanning'];
    this.props.onPanningActive(isPanning);
    if (isPanning) {
      this.setActiveState(ACTIVE_STATE_PAN);
    } else {
      this.setActiveState(this.state.prevActiveState);
    }
  };

  panning = (category) => {
    category === this.categoryPanning
      ? this.props.onPanningActive(true)
      : this.props.onPanningActive(false);

    commonSendEventFunction(RP_EVENT_CURSOR_TYPE, { category: category });
  };

  updateContextMenuActionsAvailability = (detail) => {
    this.setState({
      canPaste: !!detail.canPaste,
      canRedo: !!detail.canRedo,
      canUndo: !!detail.canUndo,
    });
  };

  onUndoRedoActionUpdated = (e) => {
    this.setState({ canUndo: e.detail.canUndo, canRedo: e.detail.canRedo });
  };

  onEmptyCanvasPointerUp = (e) => {
    if (e.detail.isRight) {
      const data = e.detail;
      e.detail.originalEvent.stopPropagation();
      this.openContextMenu(data);
    }
  };

  //todo: need to be refactored
  onCanvasClick = (e) => {
    this.closeContextElementMenu();
    this.setStateOfContextmenu(false);
    this.showSteps(false);
    this.forceCloseExtended();
    this.props.openModal(false);
    switch (this.state.activeState) {
      case this.categoryPanning:
        break;
      case ACTIVE_STATE_DRAW:
        commonSendEventFunction(RP_EVENT_CREATE_OBJECT, {
          position: { x: e.clientX, y: e.clientY },
          object: { category: EElementCategories.SHAPE, type: this.state.selectedDrawItem.type },
        });
        break;
      case this.categoryText:
        this.createTextObject(this.categoryText, e);
        break;
      default:
    }
  };

  closeContextElementMenu() {
    if(this.props.inputs) {
      onCloseMenu({ inputs: this.props.inputs, clearInputsState: this.props.clearInputsState});
    }
    this.setContextElementMenuOpened(false);
  }

  setStateOfContextmenu = (value) => {
    this.setState({
      contextMenuOpened: value,
    });
  };

  setContextElementMenuOpened = (value) => {
    this.setState({
      contextElementMenuOpened: value,
    });
  };

  showToolBoxSteps = (value) => {
    if (value) {
      this.setState({
        showToolBoxSteps: value,
      });
    } else {
      this.setState({
        showToolBoxSteps: !this.state.showToolBoxSteps,
      });
    }
  };

  showSteps = (value) => {
    this.setState({
      showSteps: value,
    });
  };

  onCloseShowSteps = () => {
    this.showSteps(false);
    this.portCleaning();
    if (this.state.port) {
      commonSendEventFunction(RP_EVENT_CANCEL_NEW_STEP_FROM_CONNECTION, {});
    }
  };

  saveToPNG = () => {
    commonSendEventFunction(RP_EVENT_SAVE_TO_PNG);
  };

  openContextMenu = (data) => {
    this.setState({
      position: {
        x: data.originalEvent.x,
        y: data.originalEvent.y,
      },
      contextMenuOpened: true,
    });
    this.onContextMenuOpened(data);
  };

  onContextMenuOpened = (data) => {
    this.updateContextMenuActionsAvailability(data);
  };

  eventConnectionHandler = (e) => {
    e.preventDefault();
    this.setState({
      position: {
        x: e.detail.position.x - 8,
        y: e.detail.position.y - 165,
      },
    });
    if (e.detail.port) {
      this.setState({
        port: e.detail.port,
      });
    }
    this.showSteps(!this.state.showSteps);
  };

  onEmptyCanvasDoubleClick = (e) => {
    let position = e.detail;
    this.setState({
      position: {
        x: position.x,
        y: position.y,
      },
    });
    this.showSteps(!this.state.showSteps);
  };

  onUndoAction = () => {
    commonSendEventFunction(RP_EVENT_UNDO_CLICKED);
  };

  onRedoAction = () => {
    commonSendEventFunction(RP_EVENT_REDO_CLICKED);
  };

  onElementRightClick = (e) => {
    const coords = e.detail.position || { x: 0, y: 0 };
    this.setState({
      contextElementMenuPosition: { ...coords },
    });

    this.setContextElementMenuOpened(true);
  };

  componentDidMount() {
    const canvasElement = document.getElementById("canvas");
    canvasElement.addEventListener("pointerdown", this.onCanvasClick);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener(PR_EVENT_EDIT_MODE, this.editModeHandler, false);
    document.addEventListener(PR_EVENT_CONNECTION_IN_EMPTY_SPACE, this.eventConnectionHandler, false);
    document.addEventListener(PR_EVENT_QUICK_PANNING_MODE_CHANGED, this.forcePanningMode, false);
    document.addEventListener(PR_EVENT_TEXT_EDITING_FINISH, this.onTextEditingFinish, false);
    document.addEventListener(PR_EVENT_SHAPE_DRAWING_ENDED, this.onDrawShapeEnded, false);

    document.addEventListener(RP_EVENT_ESC_PRESSED, this.onESCPressed, false);
    document.addEventListener(RP_EVENT_EMPTY_CANVAS_POINTER_UP, this.onEmptyCanvasPointerUp, false);
    document.addEventListener(RP_EVENT_EMPTY_CANVAS_DOUBLE_CLICK, this.onEmptyCanvasDoubleClick, false);
    document.addEventListener(PR_EVENT_UNDO_REDO_ACTIONS_UPDATED, this.onUndoRedoActionUpdated, false);
    document.addEventListener(RP_EVENT_ELEMENT_RIGHT_CLICK, this.onElementRightClick, false);
  }

  componentDidUpdate() {
    if (this.props.activateSelectTool) {
      this.setActiveState(ACTIVE_STATE_SELECT);
    }
  }

  componentWillUnmount() {
    document.removeEventListener(PR_EVENT_EDIT_MODE, this.editModeHandler);
    document.removeEventListener(PR_EVENT_CONNECTION_IN_EMPTY_SPACE, this.eventConnectionHandler);
    document.removeEventListener(PR_EVENT_QUICK_PANNING_MODE_CHANGED, this.forcePanningMode);
    document.removeEventListener(RP_EVENT_ESC_PRESSED, this.onESCPressed);
    document.removeEventListener(PR_EVENT_TEXT_EDITING_FINISH, this.onTextEditingFinish, false);
    document.removeEventListener(PR_EVENT_SHAPE_DRAWING_ENDED, this.onDrawShapeEnded, false);
    document.removeEventListener(RP_EVENT_EMPTY_CANVAS_POINTER_UP, this.onEmptyCanvasPointerUp, false);
    document.removeEventListener(RP_EVENT_EMPTY_CANVAS_DOUBLE_CLICK, this.onEmptyCanvasDoubleClick, false);
    document.removeEventListener(PR_EVENT_UNDO_REDO_ACTIONS_UPDATED, this.onUndoRedoActionUpdated, false);
    document.removeEventListener(RP_EVENT_ELEMENT_RIGHT_CLICK, this.onElementRightClick, false);
  }

  render() {
    const drawExtended = [
      {
        type: EShapeTypes.RECTANGLE,
        icon: iconSquare,
        label: TEXTS_SHAPES[EShapeTypes.RECTANGLE],
        actionName: CANVAS_ACTION_NAMES.DRAW_RECTANGLE,
        tooltipLabel: TEXTS_TOOLTIP.DRAW_RECTANGLE,
      },
      {
        type: EShapeTypes.ELLIPSE,
        icon: iconCircleTiny,
        label: TEXTS_SHAPES[EShapeTypes.ELLIPSE],
        actionName: CANVAS_ACTION_NAMES.DRAW_CIRCLE,
        tooltipLabel: TEXTS_TOOLTIP.DRAW_CIRCLE,
      },
      {
        type: EShapeTypes.TRIANGLE,
        icon: iconTriangle,
        label: TEXTS_SHAPES[EShapeTypes.TRIANGLE],
        actionName: CANVAS_ACTION_NAMES.DRAW_TRIANGLE,
        tooltipLabel: TEXTS_TOOLTIP.DRAW_TRIANGLE,
      },
    ];

    const ContextMenuPositionStyles = {
      top: this.state.position.y,
      left: this.state.position.x,
    };

    const onAddingStep = () => {
      this.setStateOfContextmenu(false);
      this.showSteps(!this.state.showSteps);
    };

    const onPaste = () => {
      this.setStateOfContextmenu(false);
      const position = { x: this.state.position.x, y: this.state.position.y + 50 };
      commonSendEventFunction(RP_EVENT_PASTE_PRESSED, position);
    };

    const renderContextMenu = () => {
      if (this.state.contextMenuOpened) {
        return (
          <ViewportAllower
            style={{ minWidth: '180px' }}
            startX={ContextMenuPositionStyles.left}
            startY={ContextMenuPositionStyles.top}
            className={dropdownStyles.DropdownContent}
            position="right"
          >
            <DropdownBlock isBorder key="block-1">
              <DropdownItem
                icon={iconPlus}
                key={TEXT_ADD_STEP}
                label={TEXT_ADD_STEP}
                actionName={CANVAS_ACTION_NAMES.ADD_STEP}
                onClick={onAddingStep}
              />
              <DropdownItem
                key={TEXT_PASTE_OBJECT}
                label={TEXT_PASTE_OBJECT}
                disabled={!this.state.canPaste}
                icon={iconPaste}
                actionName={CANVAS_ACTION_NAMES.PASTE}
                onClick={onPaste}
              />
            </DropdownBlock>
            <DropdownBlock key="block-2">
              <DropdownItem
                key={TEXT_UNDO_ACTION}
                label={TEXT_UNDO_ACTION}
                icon={iconUndo}
                disabled={!this.state.canUndo}
                actionName={CANVAS_ACTION_NAMES.UNDO}
                onClick={this.onUndoAction}
              />
              <DropdownItem
                key={TEXT_REDO_ACTION}
                label={TEXT_REDO_ACTION}
                icon={iconRedo}
                disabled={!this.state.canRedo}
                actionName={CANVAS_ACTION_NAMES.REDO}
                onClick={this.onRedoAction}
              />
            </DropdownBlock>
          </ViewportAllower>
        );
      }
    };

    const positionOfModal = { x: this.state.position.x, y: this.state.position.y };
    const port = this.state.port;
    const contextElementMenuPosition = {
      top: this.state.contextElementMenuPosition.y,
      left: this.state.contextElementMenuPosition.x,
    };
    return (
      <div className={styles.Wrapper} id="ToolsBoxContainer">
        {renderContextMenu()}
        {this.state.showSteps && this.props.funnel ? (
          <StepsModal
            hasWorkspaceActions={this.props.hasWorkspaceActions}
            funnel={this.props.funnel}
            port={port}
            coords={positionOfModal}
            onCloseModal={this.onCloseShowSteps}
          />
        ) : null}
        <ul className={styles.Items}>
          <ToolsItem
            icon={iconPlus}
            type={this.categoryStep}
            isSelected={this.state.activeState === this.categoryStep}
            event={() => {
              this.setActiveState(this.categoryStep);
              this.showToolBoxSteps();
              setTimeout(() => {
                this.props.openModal(this.state.activeState === this.categoryStep);
              }, 0);
            }}
            tooltipLabel={TEXTS_TOOLTIP.ADD_STEP}
            actionName={CANVAS_ACTION_NAMES.ADD_STEP}
          />
          <ToolsItem
            icon={iconSelect}
            type={ACTIVE_STATE_SELECT}
            event={() => this.setActiveState(ACTIVE_STATE_SELECT)}
            active={[this.categoryStep, ACTIVE_STATE_SELECT].includes(this.state.activeState)}
            tooltipLabel={TEXTS_TOOLTIP.SELECT}
            actionName={CANVAS_ACTION_NAMES.SELECT}
          />
          <ToolsItem
            icon={iconText}
            type={this.categoryText}
            event={this.toggleTextTool}
            createTextObject={this.createTextObject}
            notifyDragStarted={this.notifyDragStarted}
            active={this.state.activeState === this.categoryText}
            tooltipLabel={TEXTS_TOOLTIP.ADD_TEXT}
            actionName={CANVAS_ACTION_NAMES.ADD_TEXT}
          />
          {/* NEW-84: hide unimplemented features  */}
          {/*<ToolsItem icon={iconPath} />*/}
          {/*<ToolsItem icon={iconImg}  />*/}
          <ToolsItem
            icon={this.state.selectedDrawItem.icon}
            onSelectItem={(item) => this.onSelectDrawItem(item)}
            extended={drawExtended}
            open={this.state.open.draw && this.state.activeState === 'draw'}
            openExtended={this.openExtended}
            type="draw"
            event={() => this.setActiveState('draw')}
            active={this.state.activeState === 'draw'}
            selectedItem={this.state.selectedDrawItem}
            tooltipLabel={this.state.selectedDrawItem.tooltipLabel}
          />
          <ToolsItem
            icon={iconPanTool}
            type={ACTIVE_STATE_PAN}
            event={() => {
              this.props.setPanGuideStatus(true);
              this.setActiveState(ACTIVE_STATE_PAN);
              this.panning(this.categoryPanning);
            }}
            active={this.state.activeState === ACTIVE_STATE_PAN}
            tooltipLabel={TEXTS_TOOLTIP.PAN}
            actionName={CANVAS_ACTION_NAMES.PAN}
          />
          <ToolsItem
            icon={iconSaveBtn}
            type={this.categoryNone}
            event={this.saveToPNG}
            tooltipLabel={TEXTS_TOOLTIP.EXPORT_PNG}
            actionName={CANVAS_ACTION_NAMES.EXPORT_PNG}
          />
          {/* NEW-84: hide unimplemented features  */}
          {/*<hr style={{margin: '0 5px'}}/>*/}
          {/*<ToolsItem icon={iconMedia}  />*/}
        </ul>
        {this.state.contextElementMenuOpened && (
          <ViewportAllower
            style={{ minWidth: '250px' }}
            startX={contextElementMenuPosition.left}
            startY={contextElementMenuPosition.top}
            className={dropdownStyles.DropdownContent}
            position="right"
          >
            <ContextMenu
              position="left"
              dropdownTrigger={false}
              showLabel={ItemsWithLabelCustomization.includes(this.props.currentStep.object.type)}
              onItemSelect={() => this.setContextElementMenuOpened(false)}
              notifyIfValueChanged={notifyIfValueChanged}
            />
          </ViewportAllower>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  stepFocused: selectStepFocused(state),
  compareStepFocused: selectCompareStepFocused(state),
  currentStep: selectCurrentStep(state),
  inputs: selectInputValues(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetStepOpened: ({ id, value, selectedStep }) => dispatch(setStepFilterOpened({ id, value, selectedStep })),
    clearInputsState: () => dispatch(clearInputsState()),
    setPerfectShapeGuideStatus: (status) => dispatch(setPerfectShapeGuideStatus(status)),
    setPanGuideStatus: (status) => dispatch(setPanGuideStatus(status)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolsBox);
