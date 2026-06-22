import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ReviewWithDetails } from "@shared/schema";

export function useReviews(playId: number) {
  return useQuery({
    queryKey: ["reviews", playId],
    queryFn: async (): Promise<ReviewWithDetails[]> => {
      const res = await fetch(`/api/reviews/${playId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return await res.json() as ReviewWithDetails[];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ReviewWithDetails,
    Error,
    { playId: number; content: string; rating?: number; parentId?: number }
  >({
    mutationFn: async (data) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Please log in to post a review");
      if (!res.ok) throw new Error("Failed to create review");
      return await res.json() as ReviewWithDetails;
    },
    onSuccess: async (_, variables) => {
      await queryClient.refetchQueries({ queryKey: ["reviews", variables.playId] });
      toast({
        title: "Opinia dodana",
        description: "Twoja opinia została pomyślnie dodana.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: error.message === "Please log in to post a review"
          ? "Zaloguj się, aby dodać opinię"
          : "Nie udało się dodać opinii",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, playId }: { reviewId: number; playId: number }) => {
      const res: Response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 403) throw new Error("You can only delete your own reviews");
      if (!res.ok) throw new Error("Failed to delete review");
      return { reviewId, playId };
    },
    onSuccess: async (data: { reviewId: number; playId: number }) => {
      await queryClient.invalidateQueries({ queryKey: ["reviews", data.playId] });
      toast({
        title: "Opinia usunięta",
        description: "Twoja opinia została usunięta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: error.message === "You can only delete your own reviews"
          ? "Możesz usuwać tylko swoje opinie"
          : "Nie udało się usunąć opinii",
        variant: "destructive",
      });
    },
  });
}

export function useToggleReviewLike() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId }: { reviewId: number; playId: number }) => {
      const res: Response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Please log in to like reviews");
      if (!res.ok) throw new Error("Failed to toggle like");
      return await res.json() as { isLiked: boolean; likesCount: number };
    },
    onMutate: async ({ reviewId, playId }) => {
      await queryClient.cancelQueries({ queryKey: ["reviews", playId] });

      const previousReviews: ReviewWithDetails[] | undefined = queryClient.getQueryData(["reviews", playId]);

      if (previousReviews) {
        queryClient.setQueryData(["reviews", playId], (old: ReviewWithDetails[] | undefined) => {
          if (!old) return old;

          const updateReview = (review: ReviewWithDetails): ReviewWithDetails => {
            if (review.id === reviewId) {
              return {
                ...review,
                isLikedByCurrentUser: !review.isLikedByCurrentUser,
                likesCount: review.isLikedByCurrentUser
                  ? review.likesCount - 1
                  : review.likesCount + 1,
              };
            }
            if (review.replies && review.replies.length > 0) {
              return { ...review, replies: review.replies.map(updateReview) };
            }
            return review;
          };

          return old.map(updateReview);
        });
      }

      return { previousReviews: previousReviews ?? [] };
    },
    onSuccess: (data: { isLiked: boolean; likesCount: number }, variables: { reviewId: number; playId: number }) => {
      queryClient.setQueryData(["reviews", variables.playId], (old: ReviewWithDetails[] | undefined) => {
        if (!old) return old;

        const updateReview = (review: ReviewWithDetails): ReviewWithDetails => {
          if (review.id === variables.reviewId) {
            return { ...review, isLikedByCurrentUser: data.isLiked, likesCount: data.likesCount };
          }
          if (review.replies && review.replies.length > 0) {
            return { ...review, replies: review.replies.map(updateReview) };
          }
          return review;
        };

        return old.map(updateReview);
      });
    },
    onError: (error: Error, variables: { reviewId: number; playId: number }, context: { previousReviews: ReviewWithDetails[] } | undefined) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(["reviews", variables.playId], context.previousReviews);
      }
      toast({
        title: "Błąd",
        description: error.message === "Please log in to like reviews"
          ? "Zaloguj się, aby polubić opinię"
          : "Nie udało się polubić opinii",
        variant: "destructive",
      });
    },
  });
}
