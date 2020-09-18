# slimdom-sax-parser

Parses XML to a [slimdom][slimdom-url] document using [saxes][saxes-url]. slimdom is a fast, tiny, standards-compliant
XML DOM implementation for browser and node.

-   Parses text, elements, attributes, processing instructions, comments and CDATA
-   Supports namespaces
-   Works in NodeJS and the browser

## Exports

Has two named exports:

-   `sync` (function) Synchronously return a slimdom Document for the given XML string:
-   `slimdom` ([slimdom][slimdom-url]) A reference to the lib this parser is built around, as a convenience.

The shape of the `sync` function is as follows;

```ts
function sync(
	xml: string,
	options?: saxes.SaxesOptions & {
		additionalEntities?: {
			[entityName: string]: string;
		};
	}
): slimdom.Document;
```

See also [saxes.SaxesOptions](https://www.npmjs.com/package/saxes#parsing-xml-fragments) and the [standard DOM API](https://dom.spec.whatwg.org/#interface-document).

## Usage

```js
import { sync } from 'slimdom-sax-parser';

const dom = sync('<xml foo="bar" />');
```

## Examples

Modify the XML DOM:

```js
import { sync } from 'slimdom-sax-parser';

const document = sync(`<foo />`);

document.documentElement.setAttribute('bar', 'baz');
// document.documentElement.hasAttribute('bar') === true
```

Use with an XPath engine ([fontoxpath][fontoxpath-url]):

```js
import { sync } from 'slimdom-sax-parser';
import { evaluateXPath } from 'fontoxpath';

const document = sync(`<foo><bar /><baz /></foo>`);
const childNodeNames = evaluateXPath('/foo/*/name()', document);
// childNodeNames equals ['bar', 'baz']
```

Use source code position tracking:

```js
import { slimdom, sync } from 'slimdom-sax-parser';

const xml = '<example><child-element /></example>';

const document = sync(xml, { position: true });
// document instanceof slimdom.Document === true

const childElement = document.documentElement.firstChild;
// childElement instanceof slimdom.Element === true

const position = childElement.position;
// xml.substring(position.start, position.end) === '<child-element />'
```

[fontoxpath-url]: https://www.npmjs.com/package/fontoxpath
[saxes-url]: https://www.npmjs.com/package/saxes
[slimdom-url]: https://www.npmjs.com/package/slimdom

## License

Copyright (c) 2019 Wybe Minnebo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.**
