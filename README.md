# slimdom-sax-parser

Parses XML to a [slimdom][slimdom-url] document using [saxes][saxes-url]. slimdom is a fast, tiny, standards-compliant
XML DOM implementation for browser and node.

- Parses text, elements, attributes, processing instructions, comments and CDATA
- Supports namespaces
- Optionally track the position in XML string source

## Exports

* `sync`       (function)                  Synchronously return a slimdom Document for the given XML string.
* `slimdom`    ([slimdom][slimdom-url])    A reference to the lib this parser is built around, as a convenience.

```js
import { sync, slimdom } from 'slimdom-sax-parser';
```

## Arguments

* `xml`           (string)     The XML you want to parse as a string
* `options`       (object)     Optional.
  * `position`    (boolean)    Set to `true` to track the `position` attribute on DOM nodes

```js
sync('<foo />', { position: false });
```

## Returns

A [slimdom][slimdom-url] [Document](https://dom.spec.whatwg.org/#interface-document) instance.

```js
const document = sync('<foo />');
```

# Examples

Modify the XML DOM:
```js
import { sync } from 'slimdom-sax-parser';

const document = sync(`<foo />`);

document.documentElement.setAttribute('bar', 'baz');
// document.documentElement.hasAttribute('bar')
```

Use with an XPath engine ([fontoxpath][fontoxpath-url]):
```js
import { sync } from 'slimdom-sax-parser';
import { evaluateXPath } from 'fontoxpath';

const document = sync(`<foo><bar /><baz /></foo>`);
// evaluateXPath('/foo/*', document).length === 2
```

Use source code position tracking:
```js
import { slimdom, sync } from 'slimdom-sax-parser';

const xml = '<example><child-element /></example>';

const document = sync(xml, { position: true });
// document instanceof slimdom.Document

const childElement = document.documentElement.firstChild;
// childElement instanceof slimdom.Element

const position = childElement.position;
// xml.substring(position.start, position.end) === '<child-element />'
```

[fontoxpath-url]: https://www.npmjs.com/package/fontoxpath
[saxes-url]: https://www.npmjs.com/package/saxes
[slimdom-url]: https://www.npmjs.com/package/slimdom