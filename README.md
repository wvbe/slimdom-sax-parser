# slimdom-sax-parser

Parses XML to a [slimdom][slimdom-url] document using [saxes][saxes-url]. slimdom is a fast, tiny, standards-compliant
XML DOM implementation for browser and node.

-   Parses text, elements, attributes, processing instructions, comments and CDATA
-   Supports namespaces
-   Optionally track the position in XML string source
-   Works in NodeJS and the browser

## Exports

-   `sync` (function) Synchronously return a slimdom Document for the given XML string.
-   `slimdom` ([slimdom][slimdom-url]) A reference to the lib this parser is built around, as a convenience.

```js
import { sync, slimdom } from 'slimdom-sax-parser';
```

## Arguments

-   `xml` (string) The XML you want to parse as a string
-   `options` (object) Optional.
    -   `position` (boolean) Set to `true` to track the `position` attribute on DOM nodes. Defaults to `false`.
    -   `additionalNamespaces` (object) Prefix/URI mapping of namespaces that are not declared in XML
    -   `additionalEntities` (object) Name/value mapping of entities. `slimdom-sax-parser` does not parse entity
        definitions from XML.

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
// document.documentElement.hasAttribute('bar') === true
```

Use with an XPath engine ([fontoxpath][fontoxpath-url]):

```js
import { sync } from 'slimdom-sax-parser';
import { evaluateXPath } from 'fontoxpath';

const document = sync(`<foo><bar /><baz /></foo>`);
const childElementsOfFoo = evaluateXPath('/foo/*', document);
// childElementsOfFoo.length === 2
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

# License

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
