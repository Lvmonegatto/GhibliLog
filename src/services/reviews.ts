import { get, onValue, push, ref, remove, set, update } from "firebase/database";

import { auth, database } from "./firebase";

export type ReviewInput = {
  filmId: string;
  filmTitle: string;
  filmImage: string;
  releaseDate: string;
  rating: number;
  watchedAt: string;
  text: string;
};

export type ReviewRecord = ReviewInput & {
  createdAt: string;
  updatedAt: string;
};

export type ReviewEntry = ReviewRecord & { id: string };

function getUserReviewsPath(reviewId?: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Entre na sua conta para acessar seu Diário.");

  return reviewId
    ? `users/${user.uid}/reviews/${reviewId}`
    : `users/${user.uid}/reviews`;
}

export function subscribeToReviews(
  onChange: (reviews: ReviewEntry[]) => void,
  onError: (error: Error) => void,
) {
  try {
    const reviewsRef = ref(database, getUserReviewsPath());

    return onValue(
      reviewsRef,
      (snapshot) => {
        const savedReviews = snapshot.val() as Record<string, ReviewRecord> | null;
        const reviews = Object.entries(savedReviews ?? {}).map(([id, review]) => ({
          id,
          ...review,
        }));
        reviews.sort((first, second) => second.watchedAt.localeCompare(first.watchedAt));
        onChange(reviews);
      },
      onError,
    );
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Não foi possível abrir o Diário."));
    return () => {};
  }
}

export async function getReviewById(reviewId: string): Promise<ReviewEntry | null> {
  const snapshot = await get(ref(database, getUserReviewsPath(reviewId)));
  if (!snapshot.exists()) return null;

  return { id: reviewId, ...(snapshot.val() as ReviewRecord) };
}

export async function createReview(input: ReviewInput) {
  const reviewsRef = ref(database, getUserReviewsPath());
  const newReviewRef = push(reviewsRef);
  const id = newReviewRef.key;

  if (!id) throw new Error("Não foi possível criar um identificador para a resenha.");

  const now = new Date().toISOString();
  const review: ReviewRecord = { ...input, createdAt: now, updatedAt: now };
  await set(newReviewRef, review);

  return id;
}

export async function updateReview(reviewId: string, input: ReviewInput) {
  await update(ref(database, getUserReviewsPath(reviewId)), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteReview(reviewId: string) {
  await remove(ref(database, getUserReviewsPath(reviewId)));
}
