export interface UIDataEvent {
    name: string
    attributes?: string[]
}

export interface UIConfigurationDataScreenMode {
    attribute?: string
    widthStart?: number
    widthEnd?: number
    heightStart?: number
    heightEnd?: number
    dimens?: { [key: string]: number }
}

export interface UIConfigurationDataAnimations {
    defaultTime?: number
    defaultOpacity?: boolean
}

export default interface UIConfigurationData {
    viewColors?: boolean
    showLogs?: boolean
    viewLogs?: string
    attribute?: string
    animations?: UIConfigurationDataAnimations
    dimens?: { [key: string]: number }
    screenModes?: UIConfigurationDataScreenMode[]
    timeRedraw?: number
    events?: (event: UIDataEvent) => void
}
