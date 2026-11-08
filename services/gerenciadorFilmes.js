
import firebase from '../config/config';

function obterUID() {
  const usuario = firebase.auth().currentUser;

  if (!usuario) {
    throw new Error('Nenhum usuário autenticado.');
  }

  return usuario.uid;
}

function obterCaminho(lista) {
  if (lista !== 'favorites' && lista !== 'watchlist') {
    throw new Error('Lista de filmes inválida.');
  }

  return 'users/' + obterUID() + '/' + lista;
}

export async function adicionarFilme(lista, filme) {
  if (!filme || !filme.id) {
    throw new Error('Filme inválido.');
  }

  const caminho = obterCaminho(lista);

  const dadosFilme = {
    id: filme.id,
    title: filme.title || '',
    original_title: filme.original_title || '',
    image: filme.image || '',
    director: filme.director || '',
    release_date: filme.release_date || '',
    description: filme.description || '',
    addedAt: new Date().toISOString(),
  };

  await firebase.database()
    .ref(caminho + '/' + filme.id)
    .set(dadosFilme);

  return dadosFilme;
}

export async function removerFilme(lista, filmeId) {
  if (!filmeId) {
    throw new Error('Identificador do filme inválido.');
  }

  const caminho = obterCaminho(lista);

  await firebase.database()
    .ref(caminho + '/' + filmeId)
    .remove();
}

export async function buscarFilmes(lista) {
  const caminho = obterCaminho(lista);

  const snapshot = await firebase.database()
    .ref(caminho)
    .once('value');

  const dados = snapshot.val();

  if (!dados) {
    return [];
  }

  return Object.values(dados);
}

export function observarFilmes(lista, callback) {
  const caminho = obterCaminho(lista);

  const referencia = firebase.database().ref(caminho);

  const listener = referencia.on('value', snapshot => {
    const dados = snapshot.val();

    callback(dados ? Object.values(dados) : []);
  });

  return () => referencia.off('value', listener);
}

export async function verificarFilme(lista, filmeId) {
  const caminho = obterCaminho(lista);

  const snapshot = await firebase.database()
    .ref(caminho + '/' + filmeId)
    .once('value');

  return snapshot.exists();
}
