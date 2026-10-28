## Como usar

- **Página inteira:** o atalho preenche todos os campos do formulário com uma pessoa de teste. ⌥⇧P no Mac,
  Ctrl+Shift+Y no Windows e no Linux, e Alt+Shift+P no Firefox para Linux.
- **Um campo só:** botão direito no campo, Botaí › Inserir.
- **Favoritas:** guarde até 3 pessoas com apelido e preencha com qualquer uma pelo botão direito (Preencher com).
- **Cartão de teste:** cartões documentados da Stripe e da Pagar.me, no cenário escolhido (aprovado, recusado,
  pendente).

## A pessoa gerada

Nome, nascimento, CPF e CNPJ com dígito verificador certo, RG, PIS/NIS, título de eleitor, celular, e-mail, senha e
empresa. O CEP é real, com rua, bairro, cidade e UF que batem com ele, e o celular usa o DDD daquele CEP.

## Fora da extensão

O mesmo motor roda na CLI, na biblioteca npm `@pilutech/botai-core`, num servidor HTTP, em imagem Docker e como
fixture do Playwright.

## Cuidados

Os dados são fictícios, mas um CPF, CNPJ ou celular gerado pode ser de alguém, e a caixa de e-mail é pública. Use só
em localhost e em ambiente de teste. A extensão não tem servidor nem analytics e só age na aba em que você a aciona.
