import { EElementCategories, EElementTypes } from "shared/CSharedCategories";

export default class SharedElementHelpers {
  static IsStep(element) {
    return (element.category === EElementCategories.STEP);
  }

  static IsAction(element) {
    return ((element.category === EElementCategories.STEP) && (element.type === EElementTypes.EVENT));
  }

  static IsPage(element) {
    return ((element.category === EElementCategories.STEP) && (element.type === EElementTypes.PAGE));
  }

  static IsSource(element) {
    return ((element.category === EElementCategories.STEP) && (element.type === EElementTypes.SOURCE));
  }

  static IsMisc(element) {
    return ((element.category === EElementCategories.STEP) && (element.type === EElementTypes.MISC));
  }

  static IsConnection(element) {
    return ((element.category === EElementCategories.CONNECTION));
  }

  static IsText(element) {
    return element.category === EElementCategories.TEXT;
  }

  static IsShape(element) {
    return element.category === EElementCategories.SHAPE;
  }

  static IsTextOrShapeElements(element) {
    return (
      element && (SharedElementHelpers.IsShape(element) || SharedElementHelpers.IsText(element))
    );
  }

  /**
   * Tries to insert a shape following the rules:
   * Start from the bootom displayed objects and place it behind the first non-shape object
   * @param {ShapeContainerDrawable} shape 
   * @param {Array} objects 
   * @param {PIXI.DisplayObject} parent 
   */
  static InsertShape(shape, objects, parent) {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (!SharedElementHelpers.IsShape(sibling)) {
        parent.addChildAt(shape, i);

        for (let j = 0; j < objects.length; j++) {
          const siblingObject = objects[j];
          if (!SharedElementHelpers.IsShape(siblingObject)) {
            objects.splice(j, 0, shape);
            break;
          }
        }

        return;
      }
    }
    // If there was no case to be inserted 
    // then just place the object
    parent.addChild(shape);
    objects.push(shape);
  }

  /**
   * Tries to insert a text following the rules:
   * Start from the bootom displayed objects and place it behind the first non-shape && non-text object
   * @param {TextContainer} textObject 
   * @param {Array} objects 
   * @param {PIXI.DisplayObject} parent 
   */
  static InsertText(textObject, objects, parent) {
    for (let i = 0; i < parent.children.length; i++) {
      const sibling = parent.children[i];

      if (!SharedElementHelpers.IsTextOrShapeElements(sibling)) {
        parent.addChildAt(textObject, i);

        for (let j = 0; j < objects.length; j++) {
          const siblingObject = objects[j];
          if (!SharedElementHelpers.IsTextOrShapeElements(siblingObject)) {
            objects.splice(j, 0, textObject);
            break;
          }
        }

        return;
      }
    }
    // If there was no case to be inserted 
    // then just place the object
    parent.addChild(textObject);
    objects.push(textObject);
  }

}
