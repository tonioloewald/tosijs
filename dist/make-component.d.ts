import { Color } from './color';
import { Component } from './component';
import { vars, varDefault } from './css';
import { TosiStyleSheet } from './css-types';
import { bind, on } from './bind';
import { elements, svgElements, mathML } from './elements';
import { ElementCreator, PartsMap } from './xin-types';
import { xin, boxed } from './xin';
import { xinProxy, tosi, boxedProxy } from './xin-proxy';
export interface TosiFactory {
    Color: typeof Color;
    Component: typeof Component;
    elements: typeof elements;
    svgElements: typeof svgElements;
    mathML: typeof mathML;
    vars: typeof vars;
    varDefault: typeof varDefault;
    xin: typeof xin;
    boxed: typeof boxed;
    xinProxy: typeof xinProxy;
    boxedProxy: typeof boxedProxy;
    tosi: typeof tosi;
    makeComponent: typeof makeComponent;
    bind: typeof bind;
    on: typeof on;
    version: string;
}
export interface TosiComponentSpec<T = PartsMap> {
    type: Component<T>;
    lightStyleSpec?: TosiStyleSheet;
    /** @deprecated Use lightStyleSpec instead */
    styleSpec?: TosiStyleSheet;
    /**
     * The component's self-declaration (contract + description + parts map +
     * test fixture — see ComponentMap). Stamped as an OWN static on `type` at
     * hydration, so a blueprint-delivered component is a first-class citizen
     * of the agent surface: harvested by describe(), enforced by the value
     * setter, exercisable by exerciseComponent — blueprints are not left
     * behind by the contract work. A class's own `static contract` wins.
     */
    contract?: import('./agent').ComponentMap;
}
export interface TosiPackagedComponent<T = PartsMap> {
    type: Component<T>;
    creator: ElementCreator;
}
export declare const madeComponents: {
    [key: string]: TosiPackagedComponent<any>;
};
export type TosiBlueprint<T = PartsMap> = (tag: string, module: TosiFactory) => TosiComponentSpec<T> | Promise<TosiComponentSpec<T>>;
/** @deprecated Use `TosiFactory` */
export type XinFactory = TosiFactory;
/** @deprecated Use `TosiComponentSpec` */
export type XinComponentSpec<T = PartsMap> = TosiComponentSpec<T>;
/** @deprecated Use `TosiPackagedComponent` */
export type XinPackagedComponent<T = PartsMap> = TosiPackagedComponent<T>;
/** @deprecated Use `TosiBlueprint` */
export type XinBlueprint<T = PartsMap> = TosiBlueprint<T>;
export declare function makeComponent<T = PartsMap>(tag: string, blueprint: TosiBlueprint<T>): Promise<TosiPackagedComponent<T>>;
