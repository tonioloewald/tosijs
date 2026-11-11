// makeComponent is documented on the blueprints page (blueprint-loader.ts):
// it is what hydrates a blueprint, and is not meant to be called directly.
import { Color } from './color';
import { ownContract } from './contract-check';
import { Component, withAttributes } from './component';
import { vars, varDefault } from './css';
import { bind, on } from './bind';
import { elements, svgElements, mathML } from './elements';
import { version } from './version';
import { xin, boxed } from './xin';
import { xinProxy, tosi, boxedProxy } from './xin-proxy';
export const madeComponents = {};
export async function makeComponent(tag, blueprint) {
    const spec = (await blueprint(tag, {
        Color,
        Component,
        withAttributes,
        elements,
        svgElements,
        mathML,
        varDefault,
        vars,
        xin,
        boxed,
        xinProxy,
        boxedProxy,
        tosi,
        makeComponent,
        bind,
        on,
        version,
    }));
    const { type } = spec;
    type.preferredTagName = tag;
    // spec-level contract fills; a class's OWN static contract wins
    if (spec.contract != null && ownContract(type) === undefined) {
        ;
        type.contract = spec.contract;
    }
    const lightStyle = spec.lightStyleSpec ?? spec.styleSpec;
    if (lightStyle) {
        ;
        type.lightStyleSpec = lightStyle;
    }
    const packagedComponent = {
        type,
        creator: type.elementCreator(),
    };
    madeComponents[tag] = packagedComponent;
    return packagedComponent;
}
