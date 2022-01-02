type MatchSearchResult = {
  type: Entity;
  score: number;
};

type MatchSearchResults = MatchSearchResult[];

type Entity =
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

interface AnonymifyConfig {
  matchers: Record<Entity, Matcher>;
}
