# Basket Stats 🏀

App de estatísticas de basquetebol para iPhone (Expo / React Native), inspirada no
*Basketball Stats Assistant*: regista cada jogada **com um toque** e gera relatórios
de jogo e da época em PDF.

## Funcionalidades

- **Equipas e jogadores** – nome e número de camisola.
- **Novo jogo** – adversário, local, formato **5x5 ou 3x3**, nº de períodos,
  convocados e cinco inicial (⭐).
- **Registo ao vivo com um toque** – toca na ação e depois no jogador
  (ou no jogador e depois na ação):
  - lançamentos de 2P/3P (1P/2P em 3x3) e lances livres, convertidos ✓ ou falhados ✗
  - ressaltos ofensivos/defensivos, assistências, roubos, desarmes, perdas e faltas
  - pontos do adversário (+1/+2/+3)
  - após um cesto, sugere logo **“Assistência de…”**
  - marcador, período/prolongamento, faltas de equipa por período, faltas por jogador
  - substituições, desfazer e histórico das últimas jogadas (mantém premido para apagar)
  - vibração (haptics) em cada registo
- **Relatório do jogo** – parciais por período, destaques, ficha de jogo completa
  (PTS, LC, 3P, LL, RO/RD, AST, RB, DS, PE, FC, +/-, valorização), exportação em
  **PDF**, impressão (AirPrint) e partilha em texto (WhatsApp, etc.).
- **Relatório da época** – registo V/D, médias por jogador ordenáveis, percentagens
  de lançamento, lista de jogos e exportação em PDF.
- Tudo guardado no próprio telemóvel (funciona sem internet).

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
