# slimdom-sax-parser

> Parses XML to a [slimdom](https://www.npmjs.com/package/slimdom) document using (sax)[https://www.npmjs.com/package/sax]

- (Namespaced) elements, (namespaced) attributes and text nodes, processing instructions, comments and CDATA.
- Interprets catalog.xml system, group and nextCatalog tags.

## It's extremely easy to use

```
sync (xml: string) : Document
```