
export interface ClassificationDataItem {
  name: string;
  value: number;
  fullMark: number;
}

export interface PerfumeClassificationData {
  id: string;
  perfume_id: string;
  type_floral: number;
  type_fresh: number;
  type_oriental: number;
  type_woody: number;
  occasion_casual: number;
  occasion_formal: number;
  occasion_evening: number;
  occasion_special: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
  audience_feminine: number;
  audience_masculine: number;
  audience_unisex: number;
}

export const transformTypeData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Floral', value: data.type_floral, fullMark: 100 },
  { name: 'Chypre', value: data.type_fresh, fullMark: 100 },
  { name: 'Oriental', value: data.type_oriental, fullMark: 100 },
  { name: 'Woody', value: data.type_woody, fullMark: 100 },
];

export const transformOccasionData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Casual', value: data.occasion_casual, fullMark: 100 },
  { name: 'Formal', value: data.occasion_formal, fullMark: 100 },
  { name: 'Evening', value: data.occasion_evening, fullMark: 100 },
  { name: 'Special', value: data.occasion_special, fullMark: 100 },
];

export const transformSeasonData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Spring', value: data.season_spring, fullMark: 100 },
  { name: 'Summer', value: data.season_summer, fullMark: 100 },
  { name: 'Fall', value: data.season_fall, fullMark: 100 },
  { name: 'Winter', value: data.season_winter, fullMark: 100 },
];

export const transformAudienceData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Feminine', value: data.audience_feminine, fullMark: 100 },
  { name: 'Masculine', value: data.audience_masculine, fullMark: 100 },
  { name: 'Unisex', value: data.audience_unisex, fullMark: 100 },
];
