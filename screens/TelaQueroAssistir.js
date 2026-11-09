import React from 'react';
import ListaFilmes from '../components/ListaFilmes';

export default function TelaQueroAssistir({ navigation }) {
  return (
    <ListaFilmes
      lista="watchlist"
      titulo="Quero Assistir"
      navigation={navigation}
    />
  );
}