export function FavoritoRemovido({
  apelido,
  onDesfazer,
}: {
  apelido: string | null
  onDesfazer: () => void
}) {
  return (
    <div role="status">
      {apelido !== null && (
        <div className="bg-card text-muted-foreground mx-4 mb-2.5 flex items-center gap-2.5 rounded-xl border py-2 pr-2 pl-3 text-xs leading-normal">
          <span className="min-w-0">
            <strong className="text-foreground font-semibold">{apelido}</strong>{' '}
            saiu dos favoritos.
          </span>
          <button
            type="button"
            onClick={onDesfazer}
            className="text-primary hover:bg-accent focus-visible:ring-ring ml-auto h-[26px] flex-none cursor-pointer rounded-[8px] border px-2.5 text-xs font-semibold transition-colors duration-200 focus-visible:ring-1 focus-visible:outline-none"
          >
            Desfazer
          </button>
        </div>
      )}
    </div>
  )
}
