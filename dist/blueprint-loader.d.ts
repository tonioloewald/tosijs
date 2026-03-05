import { Component } from './component';
import { XinPackagedComponent } from './make-component';
export declare class Blueprint extends Component {
    static initAttributes: {
        tag: string;
        src: string;
        property: string;
    };
    loaded?: XinPackagedComponent;
    blueprintLoaded: (_pkg: XinPackagedComponent) => void;
    packaged(): Promise<XinPackagedComponent>;
}
export declare const tosiBlueprint: import("./xin-types").ElementCreator<Blueprint>;
export declare class BlueprintLoader extends Component {
    allLoaded: () => void;
    private load;
    connectedCallback(): void;
}
export declare const tosiLoader: import("./xin-types").ElementCreator<BlueprintLoader>;
declare class DeprecatedBlueprint extends Blueprint {
    constructor();
}
export declare const blueprint: import("./xin-types").ElementCreator<DeprecatedBlueprint>;
declare class DeprecatedLoader extends Component {
    allLoaded: () => void;
    constructor();
    private load;
    connectedCallback(): void;
}
export declare const blueprintLoader: import("./xin-types").ElementCreator<DeprecatedLoader>;
export {};
