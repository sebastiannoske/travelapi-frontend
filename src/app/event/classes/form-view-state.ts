export class FormViewState {
    public last: number;
    public indices: number[];
    private _current: number;
    private _maxViews: number;
    public get current(): number {
        return this._current;
    }
    public set current(value) {
        this.last = this._current;
        this._current = value;
    }
    public next(): number {
        return this.current < this._maxViews ? ++this.current : this.current;
    }

    constructor(viewsCount: number) {
        this._maxViews = viewsCount;
        this._current = 0;
        this.indices = Array.from(Array(this._maxViews + 1), (_, x) => x + 1);
    }
}
