/**
 * The 12 whales the app covers.
 *
 * This list is hardcoded on purpose: it keeps scope small, gives
 * `generateStaticParams` a list that never depends on a network call,
 * and means a slow or down OBIS API can't break the build.
 *
 * `scientificName` is what we send to OBIS (`scientificname` param).
 */

export type WhaleGroup = "baleen" | "toothed";

export interface Species {
  /** URL segment, e.g. /species/blue-whale */
  slug: string;
  commonName: string;
  scientificName: string;
  family: string;
  group: WhaleGroup;
}

export const SPECIES = [
  {
    slug: "blue-whale",
    commonName: "Blue whale",
    scientificName: "Balaenoptera musculus",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "fin-whale",
    commonName: "Fin whale",
    scientificName: "Balaenoptera physalus",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "sei-whale",
    commonName: "Sei whale",
    scientificName: "Balaenoptera borealis",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "brydes-whale",
    commonName: "Bryde's whale",
    scientificName: "Balaenoptera edeni",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "common-minke-whale",
    commonName: "Common minke whale",
    scientificName: "Balaenoptera acutorostrata",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "humpback-whale",
    commonName: "Humpback whale",
    scientificName: "Megaptera novaeangliae",
    family: "Balaenopteridae",
    group: "baleen",
  },
  {
    slug: "gray-whale",
    commonName: "Gray whale",
    scientificName: "Eschrichtius robustus",
    family: "Eschrichtiidae",
    group: "baleen",
  },
  {
    slug: "bowhead-whale",
    commonName: "Bowhead whale",
    scientificName: "Balaena mysticetus",
    family: "Balaenidae",
    group: "baleen",
  },
  {
    slug: "north-atlantic-right-whale",
    commonName: "North Atlantic right whale",
    scientificName: "Eubalaena glacialis",
    family: "Balaenidae",
    group: "baleen",
  },
  {
    slug: "north-pacific-right-whale",
    commonName: "North Pacific right whale",
    scientificName: "Eubalaena japonica",
    family: "Balaenidae",
    group: "baleen",
  },
  {
    slug: "southern-right-whale",
    commonName: "Southern right whale",
    scientificName: "Eubalaena australis",
    family: "Balaenidae",
    group: "baleen",
  },
  {
    slug: "sperm-whale",
    commonName: "Sperm whale",
    scientificName: "Physeter macrocephalus",
    family: "Physeteridae",
    group: "toothed",
  },
] as const satisfies readonly Species[];

export type SpeciesSlug = (typeof SPECIES)[number]["slug"];

export function getSpeciesBySlug(slug: string): Species | undefined {
  return SPECIES.find((s) => s.slug === slug);
}

export function isSpeciesSlug(slug: string): slug is SpeciesSlug {
  return SPECIES.some((s) => s.slug === slug);
}
