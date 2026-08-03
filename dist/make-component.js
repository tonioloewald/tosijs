/*{ "parent": "component", "description": "makeComponent() hydrates a blueprint function into a usable tosijs web-component class plus its elementCreator." }*/
/*#
# makeComponent

`makeComponent(tag: string, bluePrint: TosiBlueprint<T>): Promise<TosiComponentSpec<T>>`
hydrates [blueprints](/blueprint-loader/) into usable [web-components](/component/).

Here are the relevant interfaces:

```
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type TosiBlueprint<T = PartsMap> = (
  tag: string,
  module: TosiFactory
) => TosiComponentSpec<T> | Promise<TosiComponentSpec<T>>

export interface TosiComponentSpec<T = PartsMap> {
  type: Component<T>
  lightStyleSpec?: XinStyleSheet
  styleSpec?: XinStyleSheet // deprecated, use lightStyleSpec
}
```

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the `tagName` of the custom-element.
*/
import { Color } from './color';
import { Component } from './component';
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
    const lightStyle = spec.lightStyleSpec ?? spec.styleSpec;
    if (lightStyle) {
        type.lightStyleSpec = lightStyle;
    }
    const packagedComponent = {
        type,
        creator: type.elementCreator(),
    };
    madeComponents[tag] = packagedComponent;
    return packagedComponent;
}
