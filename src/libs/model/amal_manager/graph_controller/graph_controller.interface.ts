export interface GraphController {
    run: (queryObject: object, initialElementIds: Array<string>) => Array<object>
}