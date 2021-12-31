# @socialgouv/anonymify

Outils TypeScript pour l'anonymisation des données en langue Française

## Packages

| package                                                   | description                                |
| --------------------------------------------------------- | ------------------------------------------ |
| [match-french-entities](./packages/match-french-entities) | detection du type d'entité nommée          |
| [csv-sample](./packages/csv-sample)                       | detection des types de données dans un CSV |

## Apps

| app                        | description                       |
| -------------------------- | --------------------------------- |
| apps/match-french-entities | démo web de match-french-entities |
| apps/csv                   | web app d'anonymisation de CSV    |

### Build

To build all apps and packages, run the following command:

```
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```
yarn run dev
```

### Todo

- detection delimiter
- replace + export CSV
