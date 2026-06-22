export function getPlayFallback(theaterName: string): string {
    const name = theaterName.toLowerCase();
    if (name.includes('teatr w krakowie') || name.includes('słowacki') || name.includes('slowacki')) {
        return '/img/SOON_TeatrWKrK.jpeg';
    }

    return '/img/SOONbyDefault.png';
}

export function getPlayPosterSrc(imageUrl: string | null | undefined, theaterName: string): string {
    const hasRealImage = imageUrl && !imageUrl.includes('default_photo');
    return hasRealImage ? imageUrl : getPlayFallback(theaterName);
}
