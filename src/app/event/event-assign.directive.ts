import {
    Input,
    Directive,
    TemplateRef,
    ViewContainerRef,
    EmbeddedViewRef
} from '@angular/core';
import { Travel } from './interfaces/_index';
export class EventAssignContext {
    constructor(public $implicit: any) {}
}
@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[eventAssign],[eventAssignBe]'
})
export class EventAssignDirective {
    _value: Travel[];
    _ref: EmbeddedViewRef<EventAssignContext>;
    @Input()
    set eventAssignBe(val: Travel[]) {
        this._value = val;
        if (this._ref) {
            if (val) {
                this._ref.context.$implicit = val;
            } else {
                this._ref.destroy();
                this._ref = null;
            }
        } else if (val) {
            this._init();
        }
    }
    get eventAssignBe(): Travel[] {
        return this._value;
    }
    constructor(
        public template: TemplateRef<EventAssignContext>,
        public vcr: ViewContainerRef
    ) {}
    private _init(): void {
        this._ref = this.vcr.createEmbeddedView(
            this.template,
            new EventAssignContext(this._value)
        );
    }
}
