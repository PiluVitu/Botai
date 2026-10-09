import { render, screen, within } from '@testing-library/react'
import { COMANDO_DO_EXEMPLO, PESSOA_DO_EXEMPLO } from '@/lib/exemplo'
import { SAIDA_DO_TERMINAL } from '@/lib/terminal-exemplo'
import { TerminalExemplo } from './terminal-exemplo'

function renderizar() {
  render(<TerminalExemplo />)
  return screen.getByRole('figure', {
    name: 'Exemplo: a pessoa da semente 42 no terminal',
  })
}

describe('TerminalExemplo', () => {
  it('é uma figura com legenda para leitor de tela', () => {
    const figura = renderizar()
    expect(figura.querySelector('figcaption')).toHaveClass('sr-only')
  })

  it('a barra de título: o diretório e «terminal»', () => {
    const figura = within(renderizar())
    expect(figura.getByText('~/pilulabs/botai')).toBeInTheDocument()
    expect(figura.getByText('terminal')).toBeInTheDocument()
  })

  it('o comando do hero, com o $ fora da leitura e da seleção', () => {
    const pre = renderizar().querySelector('pre') as HTMLElement
    const [comando] = pre.querySelectorAll('code')
    expect(comando).toHaveTextContent(COMANDO_DO_EXEMPLO)
    const prompt = within(comando).getByText('$')
    expect(prompt).toHaveAttribute('aria-hidden', 'true')
    expect(prompt).toHaveClass('select-none')
  })

  // Nada escrito à mão: cada linha sai do recorte do envelope que a CLI imprime.
  it('a saída é o recorte do envelope, linha por linha', () => {
    const pre = renderizar().querySelector('pre') as HTMLElement
    const saida = pre.querySelectorAll('code')[1]
    const linhas = [...saida.children]
    expect(linhas.map((linha) => linha.textContent)).toEqual(
      SAIDA_DO_TERMINAL.map((linha) =>
        linha.trechos.map((trecho) => trecho.texto).join(''),
      ),
    )
    for (const valor of [
      PESSOA_DO_EXEMPLO.nome.completo,
      PESSOA_DO_EXEMPLO.cpf,
      PESSOA_DO_EXEMPLO.celular.formatado,
      PESSOA_DO_EXEMPLO.email.endereco,
      PESSOA_DO_EXEMPLO.endereco.cep,
      PESSOA_DO_EXEMPLO.empresa.cnpj,
    ])
      expect(saida).toHaveTextContent(valor)
  })

  it('chaves e sinais apagados; valores na cor do texto', () => {
    const pre = renderizar().querySelector('pre') as HTMLElement
    const saida = pre.querySelectorAll('code')[1]
    expect(within(saida).getByText('"cpf":', { exact: false })).toHaveClass(
      'text-muted-foreground',
    )
    expect(
      within(saida).getByText(JSON.stringify(PESSOA_DO_EXEMPLO.cpf)),
    ).not.toHaveClass('text-muted-foreground')
  })

  // A 320 px a linha quebra, e o recuo pendurado mantém a continuação à direita da chave.
  it('o recuo de cada linha é o do JSON, com o recuo pendurado', () => {
    const pre = renderizar().querySelector('pre') as HTMLElement
    expect(pre).toHaveClass('whitespace-pre-wrap', '[overflow-wrap:anywhere]')
    const linhas = [...pre.querySelectorAll('code')[1].children]
    const recuos = ['pl-[2ch]', 'pl-[4ch]', 'pl-[6ch]']
    SAIDA_DO_TERMINAL.forEach((linha, indice) => {
      expect(linhas[indice]).toHaveClass(recuos[linha.recuo], '-indent-[2ch]')
    })
  })
})
