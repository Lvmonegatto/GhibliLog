import { useLocalSearchParams } from "expo-router";

import { ReviewFormScreen } from "@/components/review-form-screen";

export default function NewReviewScreen() {
  const { filmId } = useLocalSearchParams<{ filmId?: string }>();
  return <ReviewFormScreen filmId={filmId} />;
}
