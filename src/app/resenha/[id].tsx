import { useLocalSearchParams } from "expo-router";

import { BaseScreen } from "@/components/base-screen";

export default function ReviewDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BaseScreen
      section="Diário"
      title="Detalhe da resenha"
      description="Esta rota apresentará uma resenha salva e as opções para alterá-la ou excluí-la."
      detail={`Identificador da rota: ${id ?? "não informado"}`}
    />
  );
}
