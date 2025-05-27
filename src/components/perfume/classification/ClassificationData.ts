
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
  audience_masculine: number;
  audience_feminine: number;
  audience_classic: number;
  occasion_daily: number;
  occasion_sport: number;
  occasion_leisure: number;
  occasion_night_out: number;
  occasion_business: number;
  occasion_evening: number;
  season_spring: number;
  season_summer: number;
  season_fall: number;
  season_winter: number;
  updated_at: string;
}

export const transformTypeData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Floral', value: data.type_floral, fullMark: 100 },
  { name: 'Chypre', value: data.type_fresh, fullMark: 100 },
  { name: 'Oriental', value: data.type_oriental, fullMark: 100 },
  { name: 'Woody', value: data.type_woody, fullMark: 100 },
];

export const transformOccasionData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Daily', value: data.occasion_daily, fullMark: 100 },
  { name: 'Sport', value: data.occasion_sport, fullMark: 100 },
  { name: 'Leisure', value: data.occasion_leisure, fullMark: 100 },
  { name: 'Night Out', value: data.occasion_night_out, fullMark: 100 },
  { name: 'Business', value: data.occasion_business, fullMark: 100 },
  { name: 'Evening', value: data.occasion_evening, fullMark: 100 },
];

export const transformSeasonData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Spring', value: data.season_spring, fullMark: 100 },
  { name: 'Summer', value: data.season_summer, fullMark: 100 },
  { name: 'Fall', value: data.season_fall, fullMark: 100 },
  { name: 'Winter', value: data.season_winter, fullMark: 100 },
];

export const transformAudienceData = (data: PerfumeClassificationData): ClassificationDataItem[] => [
  { name: 'Masculine', value: data.audience_masculine, fullMark: 100 },
  { name: 'Feminine', value: data.audience_feminine, fullMark: 100 },
  { name: 'Classic', value: data.audience_classic, fullMark: 100 },
];
