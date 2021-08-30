import * as PIXI from 'pixi.js';
import { EElementCategories, EElementTypes } from 'shared/CSharedCategories';
import BaseContainer from 'pixi-project/base/containers/BaseContainer';
import { EConnectionType } from 'pixi-project/base/joint/CConnectionConstants';
import SharedElementHelpers from 'shared/SharedElementHelpers';
import isEqual from 'lodash/isEqual';
import Signals from 'pixi-project/signals/AppSignals';
import AnalyticsStepManager from 'pixi-project/core/AnalyticsStepManager';
import { ActionTypes } from 'shared/CSharedConstants';

const THUMBNAIL_POSITION = {
  x: 5,
  y: 55,
};
const BLANK_TEXTURE_NAME = 'StepsModal/Pages/blank.png';
const BLANK_TEXTURE_INTERNAL_SPACE_SIZE = {
  width: 390,
  height: 457,
};

export default class StepContainer extends BaseContainer {
  constructor(type, label, texture, eventHandlers, id, value = '0') {

    super(eventHandlers, id);
    this.titleText = label;
    this.texture = texture;
    this.texturePath = '';
    this.useThumbnail = false;
    this.thumbnailURL = '';
    this.thumbnail = null;
    this.category = EElementCategories.STEP;
    this.type = type;
    this.isDependentAction = false;
    this.actionType = ActionTypes.NONE;
    this.isFocused = false;
    this.focusFilterTypes = [];

    this.incomingConnections = [];
    this.outgoingConnections = [];

    this.footer.canHaveValue = (this.type !== EElementTypes.MISC);
    this.analyticsManager = new AnalyticsStepManager(this, this.footer);

    // Page filters
    this._filterData = [];

    // URL on tracking page
    this.trackingURL = '';

    // UTM parameters
    this.utmData = {
      source: '',
      medium: '',
      campaign: '',
      content: '',
      term: '',
    };
  }

  init() {
    this.draw(this.texture);
    this.cursor = 'move';

    this.titleLabel.interactive = true;
    this.titleLabel.buttonMode = true;
    this.titleLabel.cursor = 'default';

    if (this.footer.canHaveValue) {
      this.footer.interactive = true;
      this.footer.buttonMode = true;
      this.footer.cursor = 'default';
    } else {
      this.removeChild(this.footer);
    }
  }

  createImage(data) {
    this.content = new PIXI.Sprite(data);
    this.addChild(this.content);
    const scale = SharedElementHelpers.IsPage(this) ? 0.3 : 0.15;
    this.content.scale.set(scale);
    super.createImage(data);
  }

  /**
   * Returns the position of the value field
   * @returns {*}
   * @private
   */
  _getValuePosition() {
    return {
      x: this.content.width / 2,
      y: this.content.height + 11,
    };
  }

  getState() {
    super.getState();

    this.stateData.texturePath = this.texturePath;
    this.stateData.filterData = this.filterData;
    this.stateData.useThumbnail = this.useThumbnail;
    this.stateData.thumbnailURL = this.thumbnailURL;
    this.stateData.trackingURL = this.trackingURL;
    this.stateData.utmData = this.utmData;
    this.stateData.actionType = this.actionType;
    this.stateData.analyticsFilterData = this.analyticsManager.filterData;

    if (this.isDependentAction) {
      // Temp check. Make sure you remove it when dependent action is tested
      // todo Make sure you remove it when dependent action is tested
      if ((this.incomingConnections.length === 1) && (this.outgoingConnections.length === 1)) {
        this.stateData.source = this.incomingConnections[0].getOtherSide(this).id;
        this.stateData.target = this.outgoingConnections[0].getOtherSide(this).id;
        this.stateData.dependentAction = this.isDependentAction;
      } else {
        throw Error(`[StepContainer.getState] Dependent action is not working correctly ${this.id}`);
      }
    }

    return this.stateData;
  }

  /**
   * Create a texture of a needed size. Texture must take all available space by width.
   * Bottom part should be trimmed if it takes more space then needed.
   * @param texture
   * @returns {{innerScale: PIXI.Point, adjustedTexture: PIXI.Texture}}
   * @private
   */
  _generateThumbnailTexture(texture) {
    const innerScale = new PIXI.Point(1, 1);
    let adjustedTexture = texture;

    // Calculating scale of the thumbnail by width
    const textureWidthScale = BLANK_TEXTURE_INTERNAL_SPACE_SIZE.width / texture.width;

    // If thumbnail is too small or does not fit into internal space in a blank page
    // we adjust the image by width first
    if (textureWidthScale !== 1) {
      innerScale.x = textureWidthScale;
      // noinspection JSSuspiciousNameCombination
      innerScale.y = textureWidthScale;

      // In case after adjustment by width we still don't fit by height - we trim the image
      const textureAdjustedHeight = texture.height * textureWidthScale;
      const textureAdjustedHeightScale = BLANK_TEXTURE_INTERNAL_SPACE_SIZE.height
        / textureAdjustedHeight;
      if (textureAdjustedHeightScale < 1) {
        // Depending on if we scale the thumbnail down or up -
        // we calculate the lower border of the texture differently
        const height = Math.trunc(textureWidthScale < 1
          ? textureAdjustedHeight * textureAdjustedHeightScale
          : (texture.height * BLANK_TEXTURE_INTERNAL_SPACE_SIZE.height) / textureAdjustedHeight);
        adjustedTexture = new PIXI.Texture(
          texture.baseTexture,
          new PIXI.Rectangle(
            0, 0,
            texture.width, height,
          ),
        );
      }
    }

    // noinspection JSValidateTypes
    return { adjustedTexture, innerScale };
  }

  /**
   * Instead of standard texture apply a black page one with a thumbnail of the content
   * @param thumbnailURL - URL to the content thumbnail
   * @param useThumbnail - set if we use thumbnail
   */
  setThumbnail(thumbnailURL, useThumbnail) {
    if (useThumbnail) {
      this.loadThumbnail(thumbnailURL, (texture) => {
        this.useThumbnail = useThumbnail;
        this.thumbnailURL = thumbnailURL;
        const thumbnail = this.generateThumbnail(texture);
        this.setThumbnailSprite(thumbnail);
      });
    }
  }

  loadThumbnail(thumbnailURL, callback) {
    PIXI.Texture.fromURL(thumbnailURL)
      .then(callback)
      .catch((result) => {
        console.log(`[IconContainer.setTexture] Error loading with message ${result}`);
      });
  }

  setThumbnailSprite(thumbnail) {
    this.thumbnail = thumbnail;

    this.content.removeChildren();
    this.content.texture = PIXI.Loader.shared.resources[BLANK_TEXTURE_NAME].texture;
    this.content.addChild(this.thumbnail);
    window.app.needsRendering();
  }

  generateThumbnail(texture) {
    const { adjustedTexture, innerScale } = this._generateThumbnailTexture(texture);

    // Apply attributes to the inner thumbnail
    const thumbnailSprite = new PIXI.Sprite(adjustedTexture);
    thumbnailSprite.scale = innerScale;
    thumbnailSprite.position = new PIXI.Point(
      this.content.position.x + THUMBNAIL_POSITION.x,
      this.content.position.y + THUMBNAIL_POSITION.y,
    );
    return thumbnailSprite;
  }

  /**
   * Saves filter value to the item
   * @param filters
   */
  setFilterData(filters) {
    if (filters) {
      this.filterData = filters;
    }
  }

  setAnalyticsFilterData(filterData) {
    if (filterData) {
      this.analyticsManager.updateFilter(filterData);
    }
  }

  set filterData(value) {
    this._filterData = value;
  }

  get filterData() {
    return this._filterData;
  }

  /**
   * Saves tracking URL value to the item
   * @param trackingURL
   */
  setTrackingURL(trackingURL) {
    this.trackingURL = trackingURL;
  }

  /**
   * Saves UTM data values to the item
   * @param utmData
   */
  setUTMData(utmData) {
    this.utmData = utmData;
  }

  setActionType(actionType) {
    this.actionType = actionType;
  }

  removeThumbnail() {
    this.useThumbnail = false;
    this.thumbnailURL = '';
    this.content.removeChildren();
  }

  setTexturePath(texturePath) {
    this.removeThumbnail();

    this.texturePath = texturePath;
    this.content.setTexture(texturePath);
    window.app.needsRendering()
  }
  /**
   * Update values for an element
   * @param data
   */
  updateObject(data) {
    super.updateObject(data);

    if (data.filterData && !isEqual(this.filterData, data.filterData)) {
      this.setFilterData(data.filterData);
      Signals.elementChanged.dispatch();
    }

    if (data.trackingURL && this.trackingURL !== data.trackingURL) {
      this.setTrackingURL(data.trackingURL);
      Signals.elementChanged.dispatch();
    }

    if (data.utmData && !isEqual(this.utmData, data.utmData)) {
      this.setUTMData(data.utmData);
      Signals.elementChanged.dispatch();
    }

    if (data.texturePath && !isEqual(this.texturePath, data.texturePath)) {
      this.setTexturePath(data.texturePath);
    }
  }

  /**
   * Registers a new connection that is coming to or out of a step
   * @param type {string} - type of connection
   * @param connection {ConnectionContainer} - connection
   */
  registerConnection(type, connection) {
    switch (type) {
      case EConnectionType.INCOMING:
        this.incomingConnections.push(connection);
        break;
      case EConnectionType.OUTGOING:
        this.outgoingConnections.push(connection);
        break;
      default:
        throw Error(`[StepContainer.registerConnection] wrong connection type`);
    }

    this.updateDependentActionStatus(connection);
  }

  /**
   * Removes the connection from the list of incoming and outgoint connections
   * @param connection
   */
  unregisterConnection(connection) {
    this.incomingConnections = this.incomingConnections.filter(element => {
      return element.id !== connection.id;
    });

    this.outgoingConnections = this.outgoingConnections.filter(element => {
      return element.id !== connection.id;
    });

    this.updateDependentActionStatus(connection);
  }

  notifyDependantActionStatusUpdate(isDependentAction) {
    this.incomingConnections.map((connection) => {
      if (SharedElementHelpers.IsConnection(connection)) {
        connection.onUpdateDependentActionStatus(this, isDependentAction);
      }
      return null;
    });

    this.outgoingConnections.map((connection) => {
      if (SharedElementHelpers.IsConnection(connection)) {
        connection.onUpdateDependentActionStatus(this, isDependentAction);
      }
      return null;
    });
  }

  /**
   * Updates if the step element is an action and a dependent action
   */
  updateDependentActionStatus() {
    if (SharedElementHelpers.IsAction(this)) {
      this.isDependentAction = this.checkIfActionIsDependent();
      this.analyticsManager.process();
      this.notifyDependantActionStatusUpdate(this.isDependentAction);
    }
  }

  checkIfActionIsDependent() {
    // The rules for determening a dependant action are:
    // - The step needs to be an action
    // - It has to be exactly connected with 2 other pages

    if (SharedElementHelpers.IsAction(this)) {
      const incomingPages = this.incomingConnections.filter((element) => {
        const otherSide = element.getOtherSide(this);
        return otherSide && SharedElementHelpers.IsPage(otherSide);
      });

      const outgoingPages = this.outgoingConnections.filter((element) => {
        const otherSide = element.getOtherSide(this);
        return otherSide && SharedElementHelpers.IsPage(otherSide);
      });

      const total = this.incomingConnections.length + this.outgoingConnections.length;
      const isDependentAction = ((incomingPages.length === 1) && (outgoingPages.length === 1) && total === 2);

      return isDependentAction;
    }
  }

  hasAnalyticsData() {
    return !!(this.analyticsManager && this.analyticsManager.data);
  }

  addEvents() {
    super.addEvents();
    this.content.on('pointerover', this.onPointerOver.bind(this));
    this.content.on('pointerout', this.onPointerOut.bind(this));
  }

  onPointerOut(e) {
    this.analyticsManager.onPointerOut(e);
  }

  onPointerOver(e) {
    this.analyticsManager.onPointerOver(e);
  }
}
