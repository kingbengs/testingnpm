import * as PIXI from 'pixi.js';
import { COLOR_ELEMENT_HIGHLIGHT_FRAME, COLOR_STEP_FOCUSED } from 'pixi-project/view/Styles';
import SelectionFrame from './SelectionFrame';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import {
  RP_EVENT_FOCUS_FRAME_CLEARED,
} from 'shared/CSharedEvents';

export const SINGLE_SELECTION_BOUNDS_WIDTH = 2;

export default class FocusSelection extends PIXI.Container {

  constructor(delegate) {
    super();
    this.frames = []; // it will hold frame data
    this.delegate = delegate;
  }

  updatePositions() {
    this.drawAll();
  }

  drawAll() {
    for (let i = 0; i < this.frames.length; i++) {
      const selectionFrame = this.frames[i];
      let lineColor = 0;

      if (selectionFrame.element.isFocused && !selectionFrame.element.isHovered) {
        lineColor = COLOR_STEP_FOCUSED;
      } else {
        lineColor = COLOR_ELEMENT_HIGHLIGHT_FRAME;
      }

      const p = window.app.viewport.toGlobal(selectionFrame.element);
      selectionFrame.position.set(p.x, p.y);
      selectionFrame.draw(lineColor, SINGLE_SELECTION_BOUNDS_WIDTH);
    }
    window.app.needsRendering();
  }

  focus(step, similar, filterType) {
    this.focusSingleElement(step, filterType);
    for (let i = 0; i < similar.length; i++) {
      const similarElement = similar[i];
      this.focusSingleElement(similarElement, filterType);
    }
    this.drawAll();
  }

  focusSingleElement(element, filterType) {
    element.isFocused = true;
    element.focusFilterTypes.push(filterType);
    let frame = this.findFrameByElementId(element.id);

    if (!frame) {
      frame = new SelectionFrame(element, this);
      this.addChild(frame);
      this.frames.push(frame);
      element.onFrameShow();
    }

    frame.setFilterType(filterType);
  }

  blur(step, similar, filterType) {
    this.blurSingleElement(step, filterType);
    for (let i = 0; i < similar.length; i++) {
      const similarElement = similar[i];
      this.blurSingleElement(similarElement, filterType);
    }
    this.drawAll();
  }

  blurSingleElement(step, filterType) {
    let frame = this.findFrameByElementId(step.id);
    if (frame) {
      this.removeFrameFilter(frame, filterType);
    }
  }

  removeFrameFilter(frame, filterType) {
    frame.removeFilterType(filterType);
    frame.element.focusFilterTypes.removeElement(filterType);
    if (!frame.isValid()) {
      this.frames.removeElement(frame);
      frame.removeFromParent();
      frame.element.isFocused = false;
      frame.element.onFrameHide();
    }
  }

  findSimilarElements(element, objects) {
    let similar = [];
    for (let i = 0; i < objects.length; i++) {
      const testSubject = objects[i];
      if (element.category === testSubject.category && element.type === testSubject.type) {
        if (element.id !== testSubject.id) {
          if (element.stateData.url === testSubject.stateData.url) {
            similar.push(testSubject);
          }
        }
      }
    }
    return similar;
  }

  removeByFilterType(filterTypes) {
    for (let i = 0; i < filterTypes.length; i++) {
      const filterType = filterTypes[i];
      for (let j = this.frames.length - 1; j >= 0; j--) {
        const frame = this.frames[j];
        if (frame) {
          this.removeFrameFilter(frame, filterType);
        }
      }
    }

    this.drawAll();
  }

  removeFrameByElementId(id) {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const selectionFrame = this.frames[i];
      if (selectionFrame.element.id === id) {
        this.frames.splice(i, 1);
        selectionFrame.removeFromParent();
        selectionFrame.element.onFrameHide();
        break;
      }
    }
  }

  findFrameByElementId(id) {
    for (let i = 0; i < this.frames.length; i++) {
      const selectionFrame = this.frames[i];
      if (selectionFrame.element.id === id) {
        return selectionFrame;
      }
    }
    return null;
  }

  hideFrameByElementId(id) {
    this.showFrameByElementId(id, false);
  }

  showFrameByElementId(id, visibitily = true) {
    for (let i = 0; i < this.frames.length; i++) {
      const selectionFrame = this.frames[i];
      if (selectionFrame.element.id === id) {
        selectionFrame.visibleFrame = visibitily;
        break;
      }
    }
    this.drawAll();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  hoverIn(element) {
    if (!element.isFocused) {
      let frame = new SelectionFrame(element, this);
      this.addChild(frame);
      this.frames.push(frame);
      element.onFrameShow();
    }
    this.drawAll();
  }

  hoverOut(element) {
    if (!element.isFocused) {
      this.removeFrameByElementId(element.id);
    }
    this.drawAll();
  }

  // Delegate handler
  onFrameRemoved(frame, filterType) {
    this.removeByFilterType([filterType]);
    this.drawAll();
    window.app.needsRendering();

    const data = frame.element.getState();
    data.stepId = data.ID;

    commonSendEventFunction(RP_EVENT_FOCUS_FRAME_CLEARED, {
      step: data,
      filterType: filterType,
      hasFocus: true
    });
  }

}
