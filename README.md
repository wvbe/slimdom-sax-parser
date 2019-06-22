# slimdom-sax-parser

> Parses XML to a [slimdom](https://www.npmjs.com/package/slimdom) document using [saxes](https://www.npmjs.com/package/saxes).

Works in browsers and NodeJS. Includes (namespaced) elements, (namespaced) attributes, processing instructions, comments and CDATA.

## Exports

* `sync` (function)

```js
import { sync } from 'slimdom-sax-parser';
```

## Arguments

* `xml`         (string)  The XML you want to parse as a string
* `options`     (object)  Optional.
  * `position`  (boolean)  Set to `true` to track the `position` attribute on DOM nodes

```js
sync('<foo />', { position: false });
```

## Returns

A [slimdom](https://www.npmjs.com/package/slimdom) Document instance.

```js
const document = sync('<foo />');
```

# Examples

Modify the XML DOM:
```js
import { sync } from 'slimdom-sax-parser';

const document = sync(`<foo>Well formed XML here</foo>`);

document.documentElement.setAttribute('bar', 'baz');
// document.documentElement.hasAttribute('bar')
```

Use with an XPath engine:
```js
import { sync } from 'slimdom-sax-parser';
import { evaluateXPath } from 'fontoxpath';

const document = sync(`<foo><bar /><baz /></foo>`);
// evaluateXPath('/foo/*', document).length === 2
```

Use source code position tracking:
```js
import { sync } from 'slimdom-sax-parser';

const xml = '<example><child-element /></example>';

const document = sync(xml, { position: true });
// document instanceof slimdom.Document

const childElement = document.documentElement.firstChild;
// childElement instanceof slimdom.Element

const position = childElement.position;
// xml.substring(position.start, position.end) === '<child-element />'
```
