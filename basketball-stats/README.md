# Basket Stats 🏀

App de estatísticas de basquetebol para iPhone (Expo / React Native), personalizada
para as **Sub14 Feminino do Paço de Arcos Clube** e inspirada no
*Basketball Stats Assistant*: regista cada jogada **com um toque** e gera relatórios
de jogo e da época em PDF.

## Funcionalidades

- **Equipas e jogadores** – nome e número de camisola.
- **Novo jogo** – adversário, local, formato **5x5 ou 3x3**, nº de períodos,
  minutos por período (ou sem relógio), convocados e cinco inicial (⭐).
- **Relógio de jogo** – toca para iniciar/parar, mantém premido para acertar o tempo;
  para sozinho no fim do período. Conta os **minutos de cada jogador** em campo
  (as substituições entram na conta) e regista o tempo de cada jogada.
  O ecrã não se apaga durante o jogo.
- **Registo ao vivo com um toque** – toca na ação e depois no jogador
  (ou no jogador e depois na ação):
  - lançamentos de 2P/3P (1P/2P em 3x3) e lances livres, convertidos ✓ ou falhados ✗
  - ressaltos ofensivos/defensivos, assistências, roubos, desarmes, perdas e faltas
  - **roubo de bola** da nossa equipa regista automaticamente uma **perda do adversário**
    (o desfazer remove as duas)
  - **desarme** da nossa equipa regista automaticamente um **lançamento interior falhado
    do adversário** e pergunta logo pelo ressalto
  - **adversário como equipa** (sem jogador): lançamentos de 2P/3P/LL convertidos e
    falhados, ressaltos ofensivos/defensivos, perdas e faltas
  - após um cesto, sugere logo **“Assistência de…”**; após um lançamento falhado
    (nosso ou deles), sugere **“Ressalto”** – um jogador nosso ou o adversário
  - marcador, período/prolongamento, faltas de equipa por período, faltas por jogador
  - substituições, desfazer e histórico das últimas jogadas (mantém premido para apagar)
  - vibração (haptics) em cada registo
- **Relatório do jogo** – parciais por período, destaques, ficha de jogo completa
  (MIN, PTS, LC, 3P, LL, RO/RD, AST, RB, DS, PE, FC, +/-, valorização), comparação
  **equipa vs adversário** (lançamentos, ressaltos, perdas, faltas), exportação em
  **PDF**, impressão (AirPrint) e partilha em texto (WhatsApp, etc.).
- **Quintetos (+/-)** – cada combinação de 5 (ou 3 em 3x3) com minutos, pontos
  marcados/sofridos e +/-, ordenada da melhor para a pior; no jogo e na época.
- **Relatório da época** – registo V/D, médias por jogador ordenáveis (incl. minutos),
  médias da equipa vs adversários, melhores quintetos, lista de jogos e exportação em PDF.

## Imagem e identidade

Ícone, ecrã de arranque e banner da página inicial são ilustrações originais
(`assets/icon.png`, `assets/splash-icon.png`, `assets/banner.png`).
O nome do clube e do escalão estão em `src/lib/club.ts`. Para usar o emblema do
clube, substitui `assets/icon.png` por uma imagem PNG quadrada de 1024×1024.
- **Dados (cópia de segurança)** – exportar tudo para um ficheiro (AirDrop, iCloud Drive,
  email), importar noutro aparelho (juntar ou substituir) e exportar as estatísticas de
  todos os jogos para Excel/Numbers (CSV).
- **iPad** – ecrãs centrados; na horizontal o jogo fica em duas colunas (campo e jogadas
  à esquerda, botões à direita). O iPhone fica sempre na vertical.
- Tudo guardado no próprio aparelho (funciona sem internet).

## Experimentar no iPhone

1. Instala a app **Expo Go** a partir da App Store.
2. No computador (Node 20+):
   ```bash
   cd basketball-stats
   npm install
   npx expo start
   ```
3. Aponta a câmara do iPhone para o código QR que aparece no terminal.
   (O iPhone e o computador têm de estar na mesma rede Wi‑Fi; se não estiverem,
   usa `npx expo start --tunnel`.)

## Instalar como app “a sério” / App Store

Com uma conta Expo e uma conta Apple Developer:

```bash
npx eas-cli@latest build --platform ios      # gera a build iOS na cloud
npx eas-cli@latest submit --platform ios     # envia para TestFlight / App Store
```

Antes disso, altera `ios.bundleIdentifier` em `app.json` para um identificador teu.

## Estrutura

```
src/app/            ecrãs (Expo Router)
  (tabs)/           Jogos · Equipas · Relatórios
  team/[id].tsx     editar equipa e jogadores
  game/new.tsx      configurar jogo
  game/[id]/live    registo ao vivo
  game/[id]/report  relatório do jogo
src/lib/            dados (AsyncStorage), cálculo de estatísticas, PDF
src/components/     componentes de UI
```

Verificação: `npm run typecheck`

## Publicar uma nova versão (sem Mac no jogo)

O projeto está ligado ao Expo (`@inesmachadoo/basketball-stats`). Para enviar
uma versão nova para o iPhone, na pasta `basketball-stats`:

```bash
npm install
npx eas update --branch production --message "Descrição da alteração"
```

A versão aparece no fundo do separador **Dados** (definida em `src/lib/version.ts`).

Da próxima vez que abrires a app no Expo Go, ela descarrega a versão nova.
Os dados guardados no iPhone mantêm-se.

## Versão web (pac-basket-stats.vercel.app)

A app também corre no browser. A versão web gerada vive no repositório
`inesmachado15/pac-basket-stats`, ligado ao projeto Vercel com o mesmo nome
(separado do site da loja). Para atualizar:

```bash
cd basketball-stats
./scripts/build-web.sh
# copiar o conteúdo de web/ para o repositório pac-basket-stats e fazer push ao main
```

Os dados da versão web ficam guardados no browser; usa **Dados → Exportar cópia de
segurança** para os passar para a app (e **Importar ficheiro** do outro lado).
