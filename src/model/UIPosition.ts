export default class UIPosition {
    size: number = 0
    start: number = 0
    end: number = 0
    startChanged: boolean = false
    endChanged: boolean = false
    scrollApplied: boolean = false
    marginStart: number = 0
    marginEnd: number = 0
    paddingStart: number = 0
    paddingEnd: number = 0

    public clean() {
        this.startChanged = false
        this.endChanged = false

        this.start = 0
        this.end = 0
        this.size = 0
    }
}
