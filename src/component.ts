export abstract class component{

    protected element : HTMLElement;

    constructor(tagName: string = "div", className: string = ""){
        this.element = document.createElement(tagName);
        if (className) this.element.className = className;
    }

    public abstract render():HTMLElement;

    public getElement(): HTMLElement{
        return this.element;
    }

    protected setContent(html : string):void{
        this.element.innerHTML = html;
        
    }
}