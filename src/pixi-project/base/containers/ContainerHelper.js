export default class ContainerHelper {
  static GetCenter(element) {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
    }
  }
}
