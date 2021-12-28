declare type FuzzySearchResult = {
    type: string;
    score: number;
};
declare const search: (needle: string) => Promise<FuzzySearchResult>;

export { search };
