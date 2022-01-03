# @socialgouv/anonymify

Outils TypeScript pour l'anonymisation des données en langue Française, compatible Node.js et dans les browsers.

## Packages

| package                                     | description                                |
| ------------------------------------------- | ------------------------------------------ |
| [match-entities](./packages/match-entities) | detection du type d'entité                 |
| [csv-sample](./packages/csv-sample)         | detection des types de données dans un CSV |
| [csv-anonymify](./packages/csv-anonymify)   | anonymise un CSV                           |

## Apps

| app                 | description                    |
| ------------------- | ------------------------------ |
| apps/match-entities | démo web de match-entities     |
| apps/csv            | web app d'anonymisation de CSV |

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

### The Secret Sauce

- [React.js](https://reactjs.org/)
- [MiniSearch](https://lucaong.github.io/minisearch/)
- [faker.js](https://github.com/marak/Faker.js/)
- [turborepo](https://turborepo.org/)
- [datagouv](https://data.gouv.fr)

### Todo

- detection delimiter
- export CSV progress
