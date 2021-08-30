import TextInput from 'pixi-text-input';
import BaseContainer from "pixi-project/base/containers/BaseContainer";
import BaseSignals from "pixi-project/base/signals/BaseSignals";
import AppSignals from "pixi-project/signals/AppSignals";
import { EElementCategories } from "shared/CSharedCategories";
import { PR_EVENT_EDIT_MODE } from "shared/CSharedEvents";
import { DEFAULT_TEXT_VALUE } from "shared/CSharedConstants";
import Styles, { COLOR_LABEL_DEFAULT, COLOR_SELECTION } from "pixi-project/view/Styles";

export default class TextContainer extends BaseContainer {
  constructor(texture, eventHandlers, id) {
    super(eventHandlers, id);
    this.isClicked = false;
    this.texture = texture || DEFAULT_TEXT_VALUE;
    this.isText = true;
    this.category = EElementCategories.TEXT;
    this.removeChild(this.footer);
  }

  init() {
    this.isShowTool = true;
    this.isResizable = false;
    this.draw(this.texture);
    AppSignals.setOutEditMode.add(this.outEditMode, this);
    AppSignals.viewportClicked.add(this.outEditMode, this);
  }

  createImage(data) {
    this.isEditMode = false;

    this.content = new TextInput(Styles.TEXT_OBJECT);
    this.content._surrogate.resolution = 2;
    this.content.disabled = true;
    this.content.placeholder = data;
    this.addChild(this.content);
    this.content.cursor = 'move';

    // noinspection JSUnresolvedFunction
    this.content.on('keydown', () => {
      // noinspection JSUnresolvedVariable
      const input = this.content.htmlInput;
      input.style.width = '0px';
      input.style.height = '0px';

      input.style.height = 'auto';
      input.style.width = 'auto';
      input.style.height = `${input.scrollHeight}px`;
      input.style.width = `${input.scrollWidth + 100}px`;
      window.app.needsRendering();
    });

  }

  move() {
    BaseSignals.moveObject.dispatch(this);
  }

  addEvents() {
    super.addEvents();
    this.content.on('pointerdown', this.onClick.bind(this));
  }

  outEditMode() {
    if (this.isEditMode) {
      this.isEditMode = false;
      AppSignals.setTextEditMode.dispatch(false);
      this.content.disabled = true;
      this.positionPoints();
      this.isPointerDown = false;
      window.app.needsRendering();
    }
  }

  enterEditMode() {
    AppSignals.setTextEditMode.dispatch(true);

    this.isEditMode = true;
    this.content.disabled = false;
    this.content.select();

    clearTimeout(this.awaitClick);
    this.isClicked = false;
    window.app.needsRendering();
  }

  onClick(e) {
    if (!this.isClicked && !this.isEditMode) {
      this.isClicked = true;
      this.awaitClick = setTimeout(() => { this.isClicked = false; }, 600);
    } else {
      this.onDoubleClick(e);
    }
  }

  onDoubleClick(e) {
    this.enterEditMode();
  }

  getState() {
    super.getState();
    this.stateData.text = this.content.text;

    return this.stateData;
  }

  set isEditMode(value) {
    this._isEditMode = value;
    if (value) {
      AppSignals.setInEditMode.dispatch();
      this.highlightElement(false);
    }
    setTimeout(() => {
      const event = new CustomEvent(PR_EVENT_EDIT_MODE, { detail: { value } });
      document.dispatchEvent(event);
      window.app.needsRendering();
    }, 0);
  }

  get isEditMode() {
    return this._isEditMode;
  }

  /**
   * Sets a point from which we position the toolbar for an element
   */
  setToolbarPositionPoint() {
    this.positionPoint = this.bottomPoint;
  }

  highlightElement(highlight = true) {
    if (highlight) {
      this.positionPoints();
    }
    super.highlightElement(highlight);
    this.content.setInputStyle('color', highlight ? COLOR_SELECTION : COLOR_LABEL_DEFAULT);
  }

  setText(text) {
    this.content.text = text;
  }

  onDestroy() {
    super.onDestroy();
    AppSignals.setOutEditMode.remove(this.outEditMode, this);
    AppSignals.viewportClicked.remove(this.outEditMode, this);
  }
}
