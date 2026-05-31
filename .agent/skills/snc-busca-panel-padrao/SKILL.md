---
name: snc-busca-panel-padrao
description: Padrão obrigatório para painéis de busca dos datasets SNC (AutoScore e /busca/*). Aplicar sempre que criar ou editar um componente busca-*-panel.tsx.
---

# SNC — Padrão de Busca Panel

## Estrutura Obrigatória

Todo painel de busca de dataset SNC deve seguir este padrão exato de layout.

---

## 1. Input de Busca

Grid com `"1fr auto"` (placa + botão). Se o dataset exigir mais campos, adicionar colunas antes do `auto`.

```tsx
<div className="search-bar-container" style={{
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "stretch",
}}>
  {/* Campo PLACA */}
  <div style={{ position: "relative" }}>
    <div style={{
      position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase",
      pointerEvents: "none",
    }}>PLACA</div>
    <input
      type="text"
      autoComplete="off"
      placeholder="ABC-1234"
      maxLength={8}
      style={{
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 28,
        letterSpacing: "0.14em",
        padding: "18px 18px 18px 82px",
        outline: "none",
        textTransform: "uppercase",
        transition: "border-color 0.15s",
        WebkitBoxShadow: "0 0 0 1000px rgba(10,22,40,1) inset",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#D4A843")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
    />
  </div>

  {/* Botão CONSULTAR */}
  <button style={{
    padding: "18px 36px",
    background: "#D4A843",
    color: "#0A1628",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}>
    Consultar
  </button>
</div>
```

---

## 2. Seção de Exemplos — Regra Obrigatória de Alinhamento

**⚠️ OBRIGATÓRIO:** Os botões de exemplo devem estar agrupados num `div` filho separado do label "EXEMPLOS:". Isso garante que, ao quebrar linha, o segundo botão alinhe com o primeiro (e não com o label).

```tsx
{/* ── PADRÃO CORRETO ── */}
<div style={{
  marginTop: 20,
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "flex-start",          {/* ← obrigatório */}
  borderTop: "1px solid rgba(255,255,255,0.06)",
  paddingTop: 16,
}}>
  {/* Label separado dos botões */}
  <span style={{
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
    color: "#5a6a7a", display: "flex", alignItems: "center",
    textTransform: "uppercase",
    paddingTop: 6,                    {/* ← alinha visualmente com os botões */}
  }}>
    Exemplos:
  </span>

  {/* Botões agrupados no próprio div — garantia de alinhamento ao quebrar */}
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    <button style={{
      padding: "6px 14px", background: "rgba(43,168,74,0.08)", color: "#2BA84A",
      border: "1px solid rgba(43,168,74,0.25)", borderRadius: 2,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
      transition: "all 0.15s", textTransform: "uppercase",
    }}>
      Exemplo de Relatório (Nada Consta)
    </button>

    <button style={{
      padding: "6px 14px", background: "rgba(192,57,43,0.08)", color: "#c0392b",
      border: "1px solid rgba(192,57,43,0.25)", borderRadius: 2,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
      transition: "all 0.15s", textTransform: "uppercase",
    }}>
      Exemplo de Relatório (Com Restrições)
    </button>
  </div>
</div>
```

**❌ PADRÃO ERRADO (não usar):**

```tsx
{/* Botões soltos junto com o label — ao quebrar, o 2º botão alinha com "EXEMPLOS:" */}
<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
  <span>Exemplos:</span>
  <button>Exemplo (Nada Consta)</button>
  <button>Exemplo (Com Restrições)</button>   {/* ← quebra alinhado ao label, não ao botão acima */}
</div>
```

---

## 3. Header de Resultado — Padrão Obrigatório

Após uma consulta bem-sucedida, o header do resultado segue este layout fixo.

### Estrutura

```tsx
<div style={{
  border: `1px solid ${COR_ACCENT}`,           // âmbar quando clean
  // ou: border: "1px solid #ef4444"           // vermelho quando há restrição
  background: "rgba(212,168,67,0.02)",
  padding: "20px 28px",
  display: "flex", justifyContent: "space-between", alignItems: "center",
}}>
  {/* Lado esquerdo — identificação + status */}
  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
      color: COR_ACCENT, letterSpacing: "0.14em",
      textTransform: "uppercase", fontWeight: 700,
    }}>
      NOME DO DATASET · {identificador}          {/* ex: "CRLV-e · ABC1234" */}
    </span>
    <span style={{
      fontSize: 20, fontWeight: 700,
      fontFamily: "'Libre Caslon Text', serif",  {/* ← SEMPRE Caslon no título de status */}
      color: temRestricao ? "#ef4444" : "#fff",
      marginTop: 6,
    }}>
      {temRestricao ? "TEXTO NEGATIVO" : "TEXTO POSITIVO"}
    </span>
    <span style={{ fontSize: 12, color: "#8a94a3", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
      {subtitulo}                                {/* ex: modelo + ano, total de registros */}
    </span>
  </div>

  {/* Lado direito — botões */}
  <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: 20 }}>

    {/* BOTÃO 1 — OBRIGATÓRIO em todo dataset */}
    <button
      onClick={handleGerarRelatorio}
      style={{
        padding: "12px 24px", background: COR_ACCENT, color: "#0A1628",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: "0.1em", textTransform: "uppercase",
        fontWeight: 700, border: "none", cursor: "pointer",
        whiteSpace: "nowrap", transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#e8c05a")}
      onMouseLeave={(e) => (e.currentTarget.style.background = COR_ACCENT)}
    >
      Visualizar Relatório
    </button>

    {/* BOTÃO 2 — OPCIONAL: apenas em datasets que retornam PDF embutido (ex: CRLV-e) */}
    {temPdfEmbutido && (
      <button
        onClick={handleDownloadPDF}
        style={{
          padding: "12px 24px", background: "transparent",
          border: "1px solid #2BA84A", color: "#2BA84A",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: "0.1em", textTransform: "uppercase",
          fontWeight: 700, cursor: "pointer",
          whiteSpace: "nowrap", transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        ⎙ Baixar [Documento] (PDF)
      </button>
    )}
  </div>
</div>
```

### Regras

| Elemento | Regra |
|---|---|
| Label superior | `fontSize: 9`, âmbar, `letterSpacing: 0.14em`, `UPPERCASE` |
| Título de status | `fontSize: 20`, **Libre Caslon Text** (serif), branco (clean) ou `#ef4444` (restrição) |
| Subtítulo | `fontSize: 12`, cor `#8a94a3`, JetBrains Mono |
| Botão "Visualizar Relatório" | Sempre presente · fundo âmbar (`COR_ACCENT`) · texto `#0A1628` |
| Botão "⎙ Baixar [X] (PDF)" | Somente quando `pdf_file.file_base64` disponível · borda + texto `#2BA84A` · fundo transparente |
| Borda do container | `COR_ACCENT` (âmbar) quando clean · `#ef4444` quando há restrição |

### ⚠️ Proibido
- ❌ `"GERAR DOSSIÊ (PDF)"` como label do botão primário — usar sempre `"Visualizar Relatório"`
- ❌ Botão de download PDF dentro de blocos internos de resultado — deve ficar no header
- ❌ Botão único fullwidth — os dois botões ficam lado a lado no header

### Arquivos de referência
- Padrão com 1 botão: `src/components/busca-historico-km-panel.tsx`
- Padrão com 2 botões (PDF embutido): `src/components/busca-crlve-panel.tsx`

---

## 4. Pluralização de Badges — Regra Absoluta

**NUNCA** usar sufixos do tipo `(S)`, `(ÕES)`, `(S)` nos textos de badge. Sempre usar singular ou plural correto conforme a quantidade.

| Quantidade | Formato correto | Formato proibido |
|---|---|---|
| 0 | `"NADA CONSTA"` | — |
| 1 | `"1 RESTRIÇÃO"` | ~~`"1 RESTRIÇÃO(ÕES)"`~~ |
| 2+ | `"2 RESTRIÇÕES"` | ~~`"2 RESTRIÇÃO(ÕES)"`~~ |
| 1 | `"1 MULTA"` | ~~`"1 MULTA(S)"`~~ |
| 2+ | `"2 MULTAS"` | ~~`"2 MULTA(S)"`~~ |
| 1 | `"1 OCORRÊNCIA"` | ~~`"1 OCORRÊNCIA(S)"`~~ |
| 2+ | `"2 OCORRÊNCIAS"` | ~~`"2 OCORRÊNCIA(S)"`~~ |
| 1 | `"1 RECALL"` | ~~`"1 RECALL(S)"`~~ |
| 2+ | `"2 RECALLS"` | ~~`"2 RECALL(S)"`~~ |

### Helper obrigatório nos painéis

Adicionar este helper junto com os demais utilitários do arquivo:

```typescript
/**
 * Pluralização de badges: 1 → singular, 2+ → plural.
 * Regra obrigatória do site — nunca usar "(S)" ou "(ÕES)".
 */
function pl(qtd: unknown, singular: string, plural: string): string {
  const n = Number(qtd ?? 0);
  return n === 1 ? `1 ${singular}` : `${n} ${plural}`;
}
```

Uso:
```typescript
badge={temMultas ? pl(renainf.qtd_ocorrencias, "MULTA", "MULTAS") : "NADA CONSTA"}
badge={temRest   ? pl(renajud.quantidade_ocorrencias, "RESTRIÇÃO", "RESTRIÇÕES") : "NADA CONSTA"}
badge={temOcorr  ? pl(csv.quantidade_ocorrencia, "OCORRÊNCIA", "OCORRÊNCIAS") : "NADA CONSTA"}
badge={temRecall ? pl(recall.quantidade_ocorrencias, "RECALL", "RECALLS") : "NADA CONSTA"}
```

---

## 5. Cores dos Botões de Exemplo

| Cenário | Background | Cor do texto | Borda |
|---|---|---|---|
| Nada Consta / Limpo | `rgba(43,168,74,0.08)` | `#2BA84A` | `rgba(43,168,74,0.25)` |
| Restrições / Irregular | `rgba(192,57,43,0.08)` | `#c0392b` | `rgba(192,57,43,0.25)` |
| Hover (ambos) | opacidade 0.15 | mesma cor | cor sólida |

---

## 6. BackButton — Borda Âmbar Obrigatória

O `BackButton` nas páginas de busca do AutoScore NUNCA deve ter `color="#5a6a7a"` (cinza). Sempre usar o padrão âmbar (omitir a prop `color`):

```tsx
<BackButton fallback="/autoscore" />          {/* ✅ correto — âmbar padrão */}
<BackButton fallback="/autoscore" color="#5a6a7a" />  {/* ❌ errado — cinza */}
```

---

## 7. Checklist ao criar um novo painel de busca

- [ ] Input com `fontSize: 28`, `padding: "18px 18px 18px 82px"`, `letterSpacing: "0.14em"`
- [ ] Se houver campo UF: `<select>` com mesma `fontFamily`, `fontSize: 28` e `letterSpacing: "0.14em"`; `<option>` com `fontFamily` + `fontSize: 16` explícitos
- [ ] Botão CONSULTAR com `padding: "18px 36px"`, background `#D4A843`, cor `#0A1628`
- [ ] Seção de Exemplos com label + `div` agrupador de botões (padrão item 2 acima)
- [ ] Header de resultado com label + título Caslon + subtítulo (lado esquerdo) e botões (lado direito) — ver item 3
- [ ] Botão primário sempre `"Visualizar Relatório"` (nunca `"Gerar Dossiê"` ou variantes)
- [ ] Se dataset retorna PDF embutido: segundo botão `"⎙ Baixar [X] (PDF)"` verde no header — nunca dentro de blocos internos
- [ ] `BackButton` sem prop `color` (âmbar padrão)
- [ ] `onFocus`/`onBlur` no input para border âmbar
- [ ] **OBRIGATÓRIO:** Adicionar card do dataset em `src/app/autoscore/page.tsx` no array `DATASETS` com `id`, `titulo`, `subtitulo`, `descricao`, `campos`, `status: "ativo"`, `href`, `cor`, `corBg`, `corBorder`, `fonte` e `tipo`

---

## Arquivos de referência

Todos os painéis existentes seguem este padrão:
- `src/components/busca-gravame-panel.tsx`
- `src/components/busca-estadual-panel.tsx`
- `src/components/busca-debitos-panel.tsx`
- `src/components/busca-renainf-panel.tsx`
- `src/components/busca-renajud-panel.tsx`
- `src/components/busca-proprietario-panel.tsx`
- `src/components/busca-leilao-score-panel.tsx`
- `src/components/busca-vip-car-panel.tsx`
- `src/components/busca-csv-completa-panel.tsx`
