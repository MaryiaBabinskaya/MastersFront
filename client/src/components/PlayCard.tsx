import { PlayWithTheater } from '@shared/schema';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';
import React from 'react';
import { s } from './PlayCard.styles';
import { getPlayFallback, getPlayPosterSrc } from '@/lib/play-image';

interface PlayCardProps {
  play: PlayWithTheater;
  isFavorite?: boolean;
}

export function PlayCard({ play, isFavorite = false }: PlayCardProps) {
  const { user } = useAuth();
  const toggleFav = useToggleFavorite();

  if (!play) return null;

  const playData = play as any;
  const theatre = playData.theatre || playData.theater || play.theater;
  const playId = play.id || playData.id;

  const theaterName = (theatre?.name || '');
  const fallback = getPlayFallback(theaterName);
  const posterSrc = getPlayPosterSrc(play.imageUrl, theaterName);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playId) {
      toggleFav.mutate({ playId: Number(playId) });
    }
  };

  return (
    <div className={s.card}>
      <div className={s.posterWrapper}>
        <div className={s.posterImageInner}>
          <img
            src={posterSrc}
            alt={play.title}
            loading="lazy"
            decoding="async"
            className={s.posterImage}
            onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
          />
        </div>

        <img
          src="/img/rama1.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className={s.frameImg}
        />

        {user && (
          <button onClick={handleToggleFavorite} className={s.favBtn}>
            <Star
              className={cn(
                'w-5 h-5 transition-colors',
                isFavorite ? s.favIconActive : s.favIconInactive,
              )}
            />
          </button>
        )}
      </div>

      <Link href={`/play/${playId || 'unknown'}`}>
        <div className={s.infoWrapper}>
          <div className={s.theaterName}>
            {theatre?.name || 'Nieznany Teatr'}
          </div>
          <h3 className={s.title}>{play.title}</h3>
        </div>
      </Link>
    </div>
  );
}
