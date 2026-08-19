import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class awbStateService{
    private readonly _awbNum = signal<string | null>(null)

    readonly awbNum = this._awbNum.asReadonly()
    set(value : string):void {
        this._awbNum.set(value)
    }
    
    clear():void{
        this._awbNum.set(null)
    }

}