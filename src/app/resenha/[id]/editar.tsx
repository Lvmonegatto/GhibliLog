import { useLocalSearchParams } from "expo-router";

import { ReviewFormScreen } from "@/components/review-form-screen";

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ReviewFormScreen reviewId={id} />;
}
