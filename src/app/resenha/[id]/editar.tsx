import { useLocalSearchParams } from "expo-router";

import { BaseScreen } from "@/components/base-screen";

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BaseScreen
      section="Diário"
      title="Editar resenha"
      description="A rota de edição reutilizará os dados da resenha selecionada no formulário."
      detail={`Identificador da rota: ${id ?? "não informado"}`}
    />
  );
}
