# Zoid Life 0.9 — QA de relações persistentes

## Fonte de verdade
Branch `feature/zoidlife-storyboard-blue-red-20261111`; PR #8. Nenhuma alteração na produção deve ocorrer até o CI e a revisão dos visuais passarem.

## Implementação
- Sete encontros sociais autorais: conversar, elogiar, convidar, presentear, ajudar, discutir e fazer as pazes (liberado apenas após uma discussão de ano anterior). Idades e custos específicos.
- Cada personagem conserva até seis memórias de encontros: idade, ação e variação de vínculo.
- Atores falecidos não recebem interações; o ano bloqueia novos encontros depois da primeira ação social.
- Efeitos coerentes por família, amizades e parceiros, com atualização persistente do vínculo do parceiro.
- Importação de saves filtra eventos inválidos; histórico antigo permanece compatível.
- As capturas `10-social-options.png` e `11-social-consequence.png` registram as opções e um resultado no Chromium.

## Faltam
Ampliar diálogos entre NPCs, decisões ramificadas com consequências de vários anos, revisão visual independente em celulares físicos, maior diversidade de arte. As opções acima são eventos originais baseados em categorias observadas em nomes/metadata de CSV do APK; **não são reprodução de dados proprietários, probabilidades ou códigos do jogo de referência**.
