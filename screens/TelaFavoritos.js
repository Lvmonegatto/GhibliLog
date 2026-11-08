
import React from 'react';
import ListaFilmes from '../components/ListaFilmes';

export default function TelaFavoritos({ navigation }) {
  return (
    <ListaFilmes
      lista="favorites"
      titulo="Meus Favoritos"
      navigation={navigation}
    />
  );
}
