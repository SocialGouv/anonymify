export type MatchSearchResult = {
  type: Entity;
  score: number;
};

export type MatchSearchResults = MatchSearchResult[];

export type Entity =
  | "address"
  | "city"
  | "date_fr"
  | "date"
  | "datetime"
  | "email"
  | "firstname"
  | "float"
  | "geo"
  | "integer"
  | "ip"
  | "json"
  | "lastname"
  | "phone"
  | "postcode"
  | "sex"
  | "siren"
  | "siret"
  | "title"
  | "url";

type CorpusMatcher = {
  url?: string;
  items?: string[];
};

type RegexpsMatcher = {
  regexps: string[];
};

type Matcher = CorpusMatcher | RegexpsMatcher;

export interface AnonymifyConfig {
  matchers: Record<Entity, Matcher>;
}

// declare module "../config.json" {
//   //const value: Config;
//   export default Config;
// }

// declare module "*.json" {
//   const value: any;
//   export default value;
// }
