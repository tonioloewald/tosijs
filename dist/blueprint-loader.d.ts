import { Component } from './component';
import { TosiPackagedComponent } from './make-component';
/**
 * Replace the module loader (mainly for testing failure/retry paths — the
 * default uses dynamic `import()`, which tests cannot intercept).
 */
export declare function setModuleLoader(loader: (src: string) => Promise<any>): void;
export declare class Blueprint extends Component {
    static preferredTagName: string;
    static lightStyleSpec: {
        ':host': {
            display: string;
        };
    };
    static initAttributes: {
        tag: string;
        src: string;
        property: string;
    };
    loaded?: TosiPackagedComponent;
    blueprintLoaded: (_pkg: TosiPackagedComponent) => void;
    packaged(): Promise<TosiPackagedComponent>;
}
export declare const tosiBlueprint: import("./xin-types").ElementCreator<Blueprint>;
export declare class BlueprintLoader extends Component {
    static preferredTagName: string;
    static lightStyleSpec: {
        ':host': {
            display: string;
        };
    };
    allLoaded: () => void;
    private load;
    connectedCallback(): void;
}
export declare const tosiLoader: import("./xin-types").ElementCreator<BlueprintLoader>;
/**
 * @deprecated Use `tosiBlueprint()`. 1.7's warning never named a removal
 * version, so this stays through 1.x; it now creates a `<tosi-blueprint>`,
 * which is the element that actually hydrates. Removed in 2.0.
 */
export declare const blueprint: typeof tosiBlueprint;
/**
 * @deprecated Use `tosiLoader()`. Same reasoning as `blueprint` above.
 */
export declare const blueprintLoader: typeof tosiLoader;
