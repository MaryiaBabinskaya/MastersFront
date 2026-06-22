import { useState, FormEvent, ChangeEvent } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useReviews, useCreateReview } from '@/hooks/use-reviews';
import { ReviewItem } from './ReviewItem';
import { ReviewWithDetails } from '@shared/schema';
import { cn } from '@/lib/utils';
import { s } from './ReviewsSection.styles';

interface ReviewsSectionProps {
  playId: number;
}

export function ReviewsSection({ playId }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { data: reviews, isLoading } = useReviews(playId);
  const createReview = useCreateReview();
  const [reviewContent, setReviewContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    createReview.mutate(
      { playId, content: reviewContent.trim() },
      {
        onSuccess: () => setReviewContent(''),
      },
    );
  };

  return (
    <div className={s.wrapper}>
      <h4 className={s.title}>
        <MessageSquare className="w-6 h-6" />
        Opinie
      </h4>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className={s.formWrapper}>
          <div className={s.formRow}>
            <div className={s.avatarWrapper}>
              <img
                src={user?.avatarUrl || '/img/logoUSER.png'}
                alt={user?.username || 'User'}
                className={cn(s.avatarImg, !user?.avatarUrl && s.avatarImgDefault)}
              />
            </div>
            <div className={s.formField}>
              <Textarea
                value={reviewContent}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReviewContent(e.target.value)}
                placeholder="Podziel się swoją opinią o tym spektaklu..."
                className={s.textarea}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!reviewContent.trim() || createReview.isPending}
            className="btn-theater"
          >
            {createReview.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Dodawanie...
              </>
            ) : (
              'Dodaj opinię'
            )}
          </Button>
        </form>
      ) : (
        <div className={s.loginPrompt}>
          <p className={s.loginText}>
            <a href="/account" className={s.loginLink}>Zaloguj się</a>, aby dodać opinię.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className={s.loadingWrapper}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className={s.reviewsList}>
          {reviews.map((review: ReviewWithDetails) => (
            <ReviewItem key={review.id} review={review} playId={playId} />
          ))}
        </div>
      ) : (
        <div className={s.emptyWrapper}>
          <MessageSquare className={s.emptyIcon} />
          <p>Brak opinii. Bądź pierwszy!</p>
        </div>
      )}
    </div>
  );
}
