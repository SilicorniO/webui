export default class UIPosition {
    size: number = 0

    start: number = 0
    end: number = 0
    center: number = 0

    startChanged: boolean = false
    endChanged: boolean = false
    centerChanged: boolean = false

    scrollApplied: boolean = false
    marginStart: number = 0
    marginEnd: number = 0
    paddingStart: number = 0
    paddingEnd: number = 0

    public clean() {
        this.startChanged = false
        this.endChanged = false
        this.centerChanged = false

        this.scrollApplied = false

        this.start = 0
        this.end = 0
        this.size = 0
    }

    public clone(): UIPosition {
        const position = new UIPosition()

        position.size = this.size

        position.start = this.start
        position.end = this.end
        position.center = this.center

        position.startChanged = this.startChanged
        position.endChanged = this.endChanged
        position.centerChanged = this.centerChanged

        position.scrollApplied = this.scrollApplied
        position.marginStart = this.marginStart
        position.marginEnd = this.marginEnd
        position.paddingStart = this.paddingStart
        position.paddingEnd = this.paddingEnd

        return position
    }
}
