---
name: snc-copy-standards
description: Padrões obrigatórios de linguagem e UX para todas as páginas do site institucional SNC (snc-site). Aplicar sempre que editar ou criar conteúdo no site.
---

# SNC Site — Padrões Editoriais e de UX

## 1. LINGUAGEM — Regras Invioláveis

### Proibição de termos "IA"
Nunca use terminologia que pareça gerada por IA ou corporativa genérica:

| ❌ Proibido | ✅ Usar |
|---|---|
| jornada / jornadas | solução / soluções / "como funciona" |
| implementar esta jornada | solicitar acesso / entrar em contato |
| fluxo operacional | como funciona |
| entidades obrigadas | empresas / instituições |

### Sem traços (dashes) no corpo de texto
Nunca use em-dash (—) ou en-dash (–) em parágrafos narrativos.
Substitua por: vírgula, ponto, nova frase, ou reescrita.

```
❌ conformidade verificável — não apenas declarada
✅ conformidade verificável, não apenas declarada
```

### Tom: técnico + institucional + direto
- Técnico: cite normas reais (Resolução BCB 4.893, Lei 14.790, COAF Resolução 36)
- Institucional: sem gírias, sem informalidades excessivas
- Direto: frases curtas, sem gerundismo
- Persuasivo: destaque o resultado de negócio, não a feature

---

## 2. UX — Regras Obrigatórias

### "Para que serve" — destaque obrigatório
Toda página de solução DEVE ter um bloco destacado "Para que serve".
Motivo: usuários que não sabem o que podem fazer com a informação não convertem.

**Implementação:**
- Adicionar campo `paraQueServe?: string[]` ao schema da entidade (SncJourney, SncModule, etc.)
- Renderizar com fundo verde sutil `rgba(43,168,74,.08)` e borda `rgba(43,168,74,.2)`
- Label: `PARA QUE SERVE` em mono uppercase brass
- Itens com seta "→" verde à esquerda

```tsx
{j.paraQueServe && (
  <div style={{
    background: 'rgba(43,168,74,.08)',
    border: '1px solid rgba(43,168,74,.2)',
    borderRadius: 4,
    padding: '24px 28px',
    marginTop: 8,
  }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 14 }}>
      Para que serve
    </div>
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {j.paraQueServe.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#2e3d4a', lineHeight: 1.55 }}>
          <span style={{ color: 'var(--snc-green-2)', flexShrink: 0, fontSize: 16, lineHeight: 1 }}>→</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
)}
```

### Link de contato — obrigatório em seções narrativas
Toda seção narrativa deve ter um link de contato visível, próximo ao conteúdo informativo (não apenas no CTA do fim da página).
Posição: ao final do bloco de parágrafos, antes ou depois do "Para que serve".

```tsx
<Link href="/contato" style={{
  display: 'inline-flex', alignItems: 'center', gap: 6,
  marginTop: 20, fontSize: 13, color: 'var(--snc-green-2)',
  textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace',
  letterSpacing: '.06em',
}}>
  Falar com um especialista →
</Link>
```

### Responsividade — obrigatória
Toda seção nova DEVE ter versão mobile. Regras:
- Grids de 2 colunas: classes CSS com override `grid-template-columns: 1fr` no breakpoint `max-width: 720px`
- Padding mínimo mobile: `60px 18px`
- Nenhum elemento fixo (sticky) em mobile
- Fontes mínimas: 14px em parágrafos, 24px em títulos h2

### Nomes de módulos na trust bar
Use nomes legíveis dos módulos, não abreviações com números.

```
❌ Político 12
✅ Envolvimento Político

❌ Compliance 9
✅ Compliance & PEP
```

---

## 3. Campos de Dados — Schema Padrão

Ao criar conteúdo para novas soluções, use sempre:

```typescript
interface SncJourney {
  slug: string;
  title: string;
  titleItalic: string;
  problem: string;        // pergunta do usuário, sem jargão
  description: string;   // resposta curta, sem traços
  modules: string[];     // nomes legíveis, sem números
  image: string;
  metrics?: { value: string; label: string }[];
  steps?: { title: string; desc: string }[];
  narrative?: string[];   // parágrafos sem traços, sem "jornada"
  paraQueServe?: string[]; // lista de casos de uso concretos
}
```

---

## 4. CTA — Linguagem

| ❌ Proibido | ✅ Usar |
|---|---|
| Implementar esta jornada | Solicitar acesso |
| Agendar demonstração | Falar com um especialista |
| Ver todos os módulos | Conhecer a plataforma |
| Pronto para resolver este problema? | Quer ver como funciona? |
