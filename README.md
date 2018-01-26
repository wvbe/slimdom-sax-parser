# slimdom-sax-parser

> Parses XML to a Slimdom document using Sax

Relies heavily on the following libs:

- https://www.npmjs.com/package/slimdom
- https://www.npmjs.com/package/sax

Limited functionality for now:

- Only synchronously
- Only (namespaced) elements, (namespaced) attributes and text nodes, processing instructions, comments and CDATA.

## It's extremely easy to use

```
sync (xml: string) : Document
```