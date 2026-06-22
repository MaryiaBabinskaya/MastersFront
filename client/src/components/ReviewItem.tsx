import { useState, ChangeEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateReview,
  useDeleteReview,
  useToggleReviewLike,
} from '@/hooks/use-reviews';
import type { ReviewWithDetails } from '@shared/schema';
import { cn } from '@/lib/utils';
import { s } from './ReviewItem.styles';

interface ReviewItemProps {
  review: ReviewWithDetails;
  playId: number;
  isReply?: boolean;
}

export function ReviewItem({ review, playId, isReply = false }: ReviewItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();
  const toggleLike = useToggleReviewLike();

  const isDefaultAvatar = !review.userAvatarUrl;
  const displayAvatarUrl = review.userAvatarUrl || '/img/logoUSER.png';

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createReview.mutate(
      { playId, content: replyContent.trim(), parentId: review.id },
      {
        onSuccess: () => {
          setReplyContent('');
          setShowReplyForm(false);
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm('Czy na pewno chcesz usunąć tę opinię?')) {
      deleteReview.mutate({ reviewId: review.id, playId });
    }
  };

  return (
    <div className={cn('space-y-3', isReply && s.replyIndent)}>
      <div className={s.reviewCard}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <div className={s.avatar}>
              <img
                src={displayAvatarUrl}
                alt={review.userNickname}
                className={cn(s.avatarImg, isDefaultAvatar && s.avatarImgDefault)}
              />
            </div>
            <div>
              <div className={s.authorName}>{review.userNickname}</div>
              <div className={s.timestamp}>
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: pl,
                })}
              </div>
            </div>
          </div>

          {review.isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={s.deleteBtn}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <p className={s.content}>{review.content}</p>

        <div className={s.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike.mutate({ reviewId: review.id, playId })}
            className={cn(
              s.likeBtn,
              review.isLikedByCurrentUser ? s.likeBtnActive : s.likeBtnInactive,
            )}
          >
            <Heart
              className={cn(
                review.isLikedByCurrentUser ? s.likedHeart : s.unlikedHeart,
              )}
            />
            <span className={s.inlineText}>{review.likesCount}</span>
          </Button>

          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className={s.replyBtn}
            >
              <MessageCircle className="w-4 h-4" />
              <span className={s.inlineText}>Odpowiedz</span>
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className={s.replyForm}>
            <Textarea
              value={replyContent}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setReplyContent(e.target.value)
              }
              placeholder="Napisz odpowiedź..."
              className={s.replyTextarea}
            />
            <div className={s.replyActions}>
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || createReview.isPending}
                size="sm"
              >
                {createReview.isPending ? 'Dodawanie...' : 'Dodaj odpowiedź'}
              </Button>
              <Button
                onClick={() => setShowReplyForm(false)}
                variant="outline"
                size="sm"
              >
                Anuluj
              </Button>
            </div>
          </div>
        )}
      </div>

      {review.replies && review.replies.length > 0 && (
        <div className={s.replies}>
          {review.replies.map((reply) => (
            <ReviewItem key={reply.id} review={reply} playId={playId} isReply />
          ))}
        </div>
      )}
    </div>
  );
}
