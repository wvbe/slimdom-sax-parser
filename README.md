# slimdom-sax-parser

> Parses XML to a Slimdom document using Sax

Relies heavily on the following libs:

- https://www.npmjs.com/package/slimdom
- https://www.npmjs.com/package/sax

Limited functionality for now:

- Only synchronously
- Only elements, attributes and text nodes, processing instructions, comments and (public) doctype declarations

## API

```
sync (xml: string, [strict: boolean, options: object]) : Document
```

For the `strict` and `options` arguments, please see the sax documentation: https://www.npmjs.com/package/sax
