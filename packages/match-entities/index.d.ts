export type MatchSearchResult = {
  type: MatchEntity;
  score: number;
};

export type MatchSearchResults = MatchSearchResult[];

export type MatchEntity =
  | "address"
  | "city"
  | "date_fr"
  | "date"
  | "datetime"
  | "email"
  | "firstname"
  | "float"
  | "fullname"
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
  | "text"
  | "title"
  | "url";

type CorpusMatcher = {
  url?: string;
  items?: string[];
};

type RegexpsMatcher = {
  regexps: string[];
};

export type Matcher = CorpusMatcher | RegexpsMatcher;

export interface AnonymifyConfig {
  matchers: Partial<Record<MatchEntity>, Matcher>;
}
