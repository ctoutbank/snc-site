---
name: snc-relatorio-back-button
description: Regra obrigatória de botão "← Voltar" em todos os relatórios SNC (oficiais e de exemplo). Aplicar sempre que criar ou editar um dataset, um painel de busca ou o template de relatório.
---

# SNC — Botão "← Voltar" em Relatórios

## Regra Absoluta

**Todo relatório SNC** (oficial e de exemplo) DEVE ter um botão "← Voltar" funcional que retorna o usuário à página de busca exata de onde veio.

Relatórios abrem em nova aba (`window.open(url, "_blank")`), portanto `window.history.back()` não tem histórico anterior. O botão depende exclusivamente do `fallbackPath` configurado no template.

---

## Implementação — TOOLBAR_JS (`/relatorio/snc/[id]/page.tsx`)

### 1. Lógica do back action (obrigatória)

```js
if (action === 'back') {
  var fallback = btn.getAttribute('data-fallback') || '/';
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = fallback;
  }
}
```

### 2. `datasetFallbackMap` — mapa obrigatório por dataset

Localização: `src/app/relatorio/snc/[id]/page.tsx`, próximo ao final do componente.

```tsx
// Mapa preciso: cada dataset aponta para a sua própria página de busca
const datasetFallbackMap: Record<string, string> = {
  'vip-car':      '/autoscore/vip-car',
  'veiculo':      '/autoscore/veiculo',
  'proprietario': '/autoscore/proprietario',
  'leilao':       '/autoscore/leilao-score',
  'renajud':      '/autoscore/renajud',
  'gravame':      '/autoscore/gravame',
  'debitos':      '/autoscore/debitos',
  'estadual':     '/autoscore/estadual',
  'renainf':      '/autoscore/renainf',
  'historico-km': '/autoscore/historico-km',
  'crlve':        '/autoscore/crlve',
  'csv-completa': '/autoscore/csv-completa',
  'credito':      '/busca/credito',
};
const fallbackPath = datasetFallbackMap[payload?.dataset ?? ''] ?? '/autoscore';
```

**⚠️ OBRIGATÓRIO ao criar um novo dataset:** adicionar a entrada correspondente neste mapa antes de qualquer deploy. Omitir resulta em fallback para `/autoscore` (aceitável, mas impreciso).

### 3. Botão no template (verificar que `data-fallback` está presente)

```tsx
<button type="button" className="r-btn" data-action="back" data-fallback={fallbackPath}>
  ← Voltar
</button>
```

---

## Implementação — Páginas de Busca (`/autoscore/*`, `/busca/*`)

Todas as páginas de busca devem usar o `BackButton` Client Component (não `<Link>` hardcoded):

```tsx
// src/components/back-button.tsx
"use client";
import { useRouter } from "next/navigation";

export function BackButton({ fallback = "/", color = "#D4A843" }) {
  const router = useRouter();
  // REGRA: navega SEMPRE para o fallback fixo.
  // NÃO usa router.back() — o destino deve ser previsível e independente do histórico.
  // Relatórios têm lógica própria via TOOLBAR_JS + datasetFallbackMap.
  const handleBack = () => {
    router.push(fallback);
  };
  return (
    <button onClick={handleBack} style={{
      display: "inline-flex", alignItems: "center", gap: 8, color,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.1em",
      border: `1px solid ${color}66`, padding: "6px 14px", borderRadius: 4,
      background: `${color}0D`, transition: "all 0.2s", cursor: "pointer",
    }}>
      <span style={{ fontSize: 14, marginTop: -2 }}>←</span> Voltar
    </button>
  );
}
```

Uso:
- Datasets do AutoScore: `<BackButton fallback="/autoscore" />`
- Dataset de crédito: `<BackButton fallback="/busca" />`

**⚠️ OBRIGATÓRIO:** Nunca passe `color="#5a6a7a"` (cinza) no `BackButton`. A borda âmbar (`#D4A843`, padrão do componente) é o padrão visual de todas as páginas de busca do AutoScore e `/busca/*`. Omitir a prop `color` usa o âmbar automaticamente.

---

## Tabela de Referência — Dataset × Rota

| Dataset (valor na URL) | Rota da página de busca | fallbackPath no relatório |
|---|---|---|
| `vip-car` | `/autoscore/vip-car` | `/autoscore/vip-car` |
| `veiculo` | `/autoscore/veiculo` | `/autoscore/veiculo` |
| `proprietario` | `/autoscore/proprietario` | `/autoscore/proprietario` |
| `leilao` | `/autoscore/leilao-score` | `/autoscore/leilao-score` |
| `renajud` | `/autoscore/renajud` | `/autoscore/renajud` |
| `gravame` | `/autoscore/gravame` | `/autoscore/gravame` |
| `debitos` | `/autoscore/debitos` | `/autoscore/debitos` |
| `estadual` | `/autoscore/estadual` | `/autoscore/estadual` |
| `renainf` | `/autoscore/renainf` | `/autoscore/renainf` |
| `historico-km` | `/autoscore/historico-km` | `/autoscore/historico-km` |
| `crlve` | `/autoscore/crlve` | `/autoscore/crlve` |
| `csv-completa` | `/autoscore/csv-completa` | `/autoscore/csv-completa` |
| `credito` | `/busca/credito` | `/busca/credito` |

> Nota: o dataset `leilao` usa a rota `/autoscore/leilao-score` (slug diferente do valor de dataset).

---

## Relatórios de Exemplo (`/relatorio/snc/exemplo`)

O mesmo `TOOLBAR_JS` e `fallbackPath` se aplicam à página de exemplo. Verificar que o fallback da página de exemplo aponta para a rota correta do dataset que está sendo demonstrado.

---

## Checklist ao criar um novo dataset

- [ ] Adicionar entrada em `datasetFallbackMap` no relatorio `[id]/page.tsx`
- [ ] Adicionar entrada na tabela acima neste SKILL.md
- [ ] Página de busca do dataset usa `<BackButton fallback="...">` (não `<Link>` hardcoded)
- [ ] `BackButton` sem prop `color` (usa âmbar padrão `#D4A843`) — nunca passar cinza `#5a6a7a`
- [ ] Relatório de exemplo testado: clicar "← Voltar" leva à página de busca correta
- [ ] Relatório oficial testado: clicar "← Voltar" leva à página de busca correta
