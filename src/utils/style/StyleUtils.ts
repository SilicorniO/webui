export default class StyleUtils {

  public static getOpacity(element: HTMLElement): string {
    return element.style.opacity || window.getComputedStyle(element).getPropertyValue("opacity")
  }
}