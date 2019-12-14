export class UIDrawAnimation {
    public duration: number = 0
    public onEnd: () => void | null = null
}

export default class UIDraw {
    // data
    left: string = ""
    top: string = ""
    width: string = ""
    height: string = ""
    display: string = ""
    opacity: string = ""
    transition: string = ""
    backgroundColor: string = ""

    // listener for the end of transition
    onTransitionEnd: () => void | null = null
}
