# Reglas del proyecto

## Estilo de código
- Código limpio, organizado y fácil de entender.
- Trabajar de forma modular.

## Build
- Después de hacer pruebas, borrar la carpeta `dist`.

## Commits
- Commits en español.
- No mezclar archivos: cada commit debe agrupar solo cambios relacionados.
- Usar la estructura:
  ```
  <tipo>[ámbito opcional]: <descripción>

  [cuerpo opcional]

  [nota de pie opcional]
  ```

## Control de avance
- No hacer cambios demasiado grandes.
- Preguntar antes de implementar algo.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)