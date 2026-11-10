# GhibliLog 🎬

Aplicativo mobile desenvolvido em React Native para explorar filmes do Studio Ghibli, organizar listas pessoais e registrar resenhas. O projeto foi realizado para a disciplina **CCP150 — Desenvolvimento de Aplicativos Móveis**, do Centro Universitário FEI.

## Visão geral

O GhibliLog reúne um catálogo de filmes, ferramentas de organização pessoal e um diário cinematográfico. Cada usuário possui seus próprios favoritos, lista de filmes que deseja assistir, resenhas e informações de perfil armazenados no Firebase.

### Motivação

A proposta surgiu da ideia de criar um espaço simples para quem gosta de cinema e deseja organizar o que já assistiu, o que pretende assistir e suas impressões sobre cada filme.

### Objetivos

- Consultar e explorar os filmes do Studio Ghibli.
- Organizar filmes em listas pessoais.
- Registrar, consultar, editar e excluir resenhas.
- Acompanhar estatísticas sobre a atividade cinematográfica.
- Oferecer uma experiência personalizada por meio do perfil e de feedback tátil.

## Requisitos do projeto

O aplicativo contempla os requisitos técnicos apresentados na proposta da disciplina:

- Mais de seis telas distintas.
- Navegação com React Navigation, utilizando Stack e Bottom Tabs.
- Exibição de imagens dos filmes.
- Interface estilizada e feedback visual ao usuário.
- Persistência de dados em nuvem com Firebase.
- Operações de criação, leitura, atualização e exclusão (CRUD).
- Utilização do atuador de vibração do dispositivo.

As telas de login e cadastro fazem parte do aplicativo, mas a proposta da disciplina informa que essas implementações não são consideradas na avaliação das funcionalidades, pois foram trabalhadas em aula.

## Funcionalidades

### 1. Autenticação e perfil

- Cadastro com nome, e-mail e senha.
- Login e encerramento de sessão com Firebase Authentication.
- Carregamento do estado de autenticação ao iniciar o aplicativo.
- Exibição de nome, e-mail e resumo da atividade.
- Edição do nome de exibição.
- Escolha de avatar entre opções de ícones.
- Persistência do nome e do avatar no perfil do usuário.

### 2. Catálogo

- Consulta dos filmes por meio da Ghibli API.
- Exibição de pôster, título, diretor e ano de lançamento.
- Pesquisa pelo título.
- Filtro por diretor.
- Ordenação alfabética de A–Z ou Z–A.
- Atualização da lista por gesto de atualização (pull to refresh).

### 3. Detalhes do filme

- Visualização das informações do filme selecionado.
- Adição e remoção do filme dos Favoritos.
- Adição e remoção do filme da lista Quero Assistir.
- Acesso ao formulário para escrever uma resenha.

### 4. Favoritos e Quero Assistir

- Listas separadas para filmes favoritos e filmes que o usuário deseja assistir.
- Consulta dos itens salvos.
- Remoção de filmes das listas.
- Dados separados por usuário no Firebase Realtime Database.

### 5. Diário e resenhas

- Criação de resenhas vinculadas a filmes.
- Avaliação de uma a cinco estrelas.
- Texto da resenha e data em que o filme foi assistido.
- Listagem das resenhas registradas.
- Acesso aos detalhes de cada resenha.
- Edição da nota, do texto e da data.
- Exclusão de uma resenha com confirmação na interface.

### 6. Estatísticas

- Total de filmes distintos registrados nas resenhas.
- Total de resenhas.
- Média das avaliações.
- Distribuição das notas.
- Atividade mensal dos últimos seis meses.
- Destaques das avaliações.

### 7. Feedback por vibração

O aplicativo utiliza o atuador de vibração do celular para oferecer retorno tátil em interações selecionadas, como adicionar ou remover filmes, selecionar estrelas, salvar uma resenha e editar ou excluir registros. Os padrões de vibração variam conforme a ação e a plataforma.

## Tecnologias e bibliotecas

| Tecnologia | Utilização |
|---|---|
| React Native | Construção da interface mobile |
| Expo SDK 54 | Ambiente de desenvolvimento e execução |
| JavaScript | Linguagem utilizada no aplicativo |
| React Navigation | Navegação Stack e Bottom Tabs |
| Firebase Authentication | Cadastro, login e sessão dos usuários |
| Firebase Realtime Database | Persistência dos dados |
| Firebase JS SDK 8.10.1 | Integração com a API namespaced do Firebase |
| Ghibli API | Consulta dos filmes |
| `@expo/vector-icons` / Ionicons | Ícones da interface |
| React Native Vibration API | Feedback tátil |

## Organização dos arquivos

```text
projeto-ghiblilog/
├── assets/
│   ├── snack-icon.png
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── favicon.png
│   └── splash-icon.png
├── components/
│   ├── ListaFilmes.js
│   └── SeletorData.js
├── config/
│   └── config.js
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── TelaCatalogo.js
│   ├── TelaDetalhesFilme.js
│   ├── TelaFavoritos.js
│   ├── TelaQueroAssistir.js
│   ├── TelaFormularioResenha.js
│   ├── TelaDiario.js
│   ├── TelaDetalhesResenha.js
│   ├── TelaEstatisticas.js
│   └── TelaPerfil.js
├── services/
│   ├── gerenciadorFilmes.js
│   ├── gerenciadorResenhas.js
│   └── feedbackVibracao.js
├── App.js
├── app.json
├── index.js
└── package.json
```

## Estrutura dos dados no Firebase

Os dados de cada usuário são organizados pelo identificador (`uid`) fornecido pelo Firebase Authentication.

```text
users/
└── {uid}/
    ├── profile/
    │   ├── avatar
    │   ├── createdAt
    │   └── displayName
    ├── favorites/
    ├── watchlist/
    └── reviews/
        └── {reviewId}/
            ├── filmId
            ├── filmTitle
            ├── filmImage
            ├── rating
            ├── reviewText
            ├── watchedAt
            ├── createdAt
            └── updatedAt
```

O serviço `gerenciadorFilmes.js` concentra as operações das listas de filmes. O serviço `gerenciadorResenhas.js` concentra as operações das resenhas. As telas chamam esses serviços para não duplicar a lógica de acesso ao banco.

## Instalação e execução

### Pré-requisitos

- Node.js compatível com o Expo SDK 54.
- npm.
- Expo Go em um dispositivo compatível ou emulador Android/iOS.
- Projeto Firebase configurado.

### Passos

1. Clone o repositório ou baixe o código do projeto.
2. Acesse a pasta do projeto.
3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure os dados do projeto Firebase em `config/config.js`.
5. No Firebase Console, habilite o provedor **E-mail/senha** em Authentication.
6. Configure as regras do Realtime Database para que cada usuário autenticado só possa acessar seus próprios dados.
7. Inicie o Expo:

   ```bash
   npx expo start
   ```

8. Abra o aplicativo pelo Expo Go ou por um emulador.

### Link de acesso para Snack

- https://snack.expo.dev/@xermoneys-dev/projeto-final-ghiblilog

### Configuração do Firebase

O arquivo `config/config.js` contém a inicialização do Firebase. Utilize a configuração do seu próprio projeto e não publique credenciais privadas ou arquivos de acesso administrativo. A chave de configuração de um aplicativo Firebase cliente não substitui regras de segurança: o acesso aos dados deve ser protegido pelas regras do Realtime Database.

O projeto utiliza a API namespaced do Firebase JS SDK **8.10.1**. Por isso, mantenha essa versão ao instalar as dependências, evitando atualizar automaticamente para uma versão incompatível com os imports utilizados.

## Imagens do aplicativo

![alt text](image.png) ![alt text](image-1.png)

## Aprendizados e próximos passos

O desenvolvimento do GhibliLog permitiu aplicar conceitos de desenvolvimento mobile, organização de componentes, navegação entre telas, consumo de API, autenticação, persistência em nuvem e operações CRUD.

Também foram trabalhados o gerenciamento de estado, a reutilização de componentes, a validação de formulários, o feedback ao usuário e a integração com o atuador de vibração do dispositivo.

Como possíveis evoluções, o projeto pode receber novos recursos de descoberta de filmes, filtros adicionais, melhorias de acessibilidade e novas formas de visualização das estatísticas.

## Uso de ferramentas de IA

Ferramentas de IA foram utilizadas como apoio durante o desenvolvimento para discutir soluções, revisar código, identificar erros, sugerir melhorias de interface e auxiliar na documentação. As sugestões foram avaliadas, adaptadas ao projeto e testadas no ambiente de execução. 

## Créditos e referências

- [Ghibli API](https://ghibliapi.vercel.app/): fonte dos dados dos filmes.
- [Documentação do Expo](https://docs.expo.dev/).
- [Documentação do React Native](https://reactnative.dev/docs/getting-started).
- [Documentação do React Navigation](https://reactnavigation.org/docs/getting-started).
- [Documentação do Firebase](https://firebase.google.com/docs).

---

**GhibliLog — Sua jornada cinematográfica.**
