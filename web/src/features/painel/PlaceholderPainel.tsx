import { CATALOGO, type PainelDaMetrica } from '@/content/catalogo-metricas'

/** Placeholder da fase A: lista o que o painel terá. A fase B troca isto pelos cartões. */
export function PlaceholderPainel({ painel }: { painel: PainelDaMetrica }) {
  const itens = CATALOGO.filter((m) => m.painel === painel)
  return (
    <section
      aria-labelledby="placeholder-titulo"
      className="rounded-lg border border-dashed border-borda-controle p-4"
      data-testid="placeholder-painel"
    >
      <h2 id="placeholder-titulo" className="text-lg font-bold">
        Painel em construção
      </h2>
      <p className="text-sm text-texto-2">Cartões previstos para este painel (fase B):</p>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {itens.map((m) => (
          <li key={m.id}>
            <strong>{m.codigo}</strong> · {m.nome}
          </li>
        ))}
      </ul>
    </section>
  )
}
