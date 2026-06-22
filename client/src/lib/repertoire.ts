const toBool = (val: any): boolean => val === true || val === 'true';

function isSpectacleItem(item: any, isKidsMode: boolean = false): boolean {
  if (!item) return false;

  const category = (item.category?.toLowerCase() || '').trim();
  const theaterName = (
    item.theater?.name?.toLowerCase() ||
    item.theatre?.name?.toLowerCase() ||
    ''
  ).trim();

  const isStaryTeatr = theaterName.includes('stary');
  const isForKids = toBool(item.isForKids) || toBool(item.isForkids);

  const nonSpectacleCategories = [
    'spotkania',
    'spotkanie',
    'warsztaty',
    'warsztat',
    'zwiedzanie',
    'wycieczka',
  ];
  if (nonSpectacleCategories.some((cat) => category.includes(cat))) {
    return false;
  }

  const isSpectacle =
    toBool(item.isSpectacle) ||
    category === 'spektakl' ||
    (isStaryTeatr && category.includes('spektakl'));

  if (!isSpectacle) return false;

  const categoryHasDzieci = category.includes('dzieci');

  if (isStaryTeatr) {
    if (isKidsMode) return categoryHasDzieci;
    return category.includes('spektakl') && !categoryHasDzieci;
  }

  if (categoryHasDzieci) return isKidsMode;

  return isKidsMode ? isForKids : !isForKids;
}

function isEventItem(item: any): boolean {
  if (!item) return false;

  if (toBool(item.isSpectacle)) return false;

  const category = (item.category?.toLowerCase() || '').trim();
  const theaterName = (
    item.theater?.name?.toLowerCase() ||
    item.theatre?.name?.toLowerCase() ||
    ''
  ).trim();
  const isStaryTeatr = theaterName.includes('stary');

  if (isStaryTeatr && category) {
    return !category.includes('spektakl');
  }

  return category !== 'spektakl';


}

export function getSpectacles<T = any>(items: T[] = [], isKidsMode: boolean = false): T[] {
  return items.filter((item) => isSpectacleItem(item, isKidsMode));
}

export function getEvents<T = any>(items: T[] = []): T[] {
  return items.filter((item) => isEventItem(item));
}
