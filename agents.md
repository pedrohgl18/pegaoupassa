# 🤖 Guia para Agentes de IA - Pega ou Passa

## Sobre o Projeto

**Pega ou Passa** é um aplicativo de namoro estilo Tinder/TikTok desenvolvido para **Android**. O app utiliza swipe vertical (para baixo = curtir, para cima = passar) com uma interface imersiva nas cores do Brasil (verde, amarelo e azul).

## Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Backend/Banco de Dados**: Supabase (PostgreSQL)
- **Plataforma**: Android (via WebView ou Capacitor/Cordova)

## Regras para Agentes de IA

### 📁 Arquivos de Documentação

| Arquivo | Propósito |
|---------|-----------|
| `agents.md` | Este arquivo - guia para agentes de IA |
| `imple.md` | Lista de funcionalidades (fonte da verdade) |
| `tabelas.sql` | Todas as queries SQL do projeto |

### ⚠️ Regras Obrigatórias

1. **NUNCA criar outros arquivos `.md`** - Usar apenas `agents.md` e `imple.md`
2. **NUNCA criar outros arquivos `.sql`** - Todas as queries vão em `tabelas.sql`
3. **NUNCA executar `npm run dev`** - O desenvolvedor sempre roda manualmente quando necessário
4. **NUNCA usar timeouts em chamadas ao Supabase** - Deixar as queries executarem normalmente
5. **NUNCA adicionar logs/console.log** - Só adicionar logs quando o desenvolvedor pedir explicitamente. Sempre buscar ler o código e resolver o problema sem depender de logs
6. **SEMPRE rodar os comandos de build/sync e analisar a saída** - Exceto `npm run dev`
7. **SEMPRE atualizar `imple.md`** quando uma funcionalidade for adicionada, modificada ou removida
8. **O arquivo `imple.md` é a fonte da verdade** - Sempre consultá-lo para saber o estado atual do projeto
9. **NUNCA assumir/adivinhar** - Se tiver dúvida sobre a existência de algo (bucket, tabela, coluna, etc), **PERGUNTAR ao desenvolvedor ANTES** de fazer qualquer mudança
10. **Buckets do Supabase Storage usam RLS** - NÃO são públicos por padrão. Usar URLs assinadas quando necessário

### 🗄️ Banco de Dados (Supabase)

- O banco de dados é gerenciado via **Supabase Web Console**
- **NÃO executar queries automaticamente**
- Todas as queries SQL devem ser:
  1. Escritas no arquivo `tabelas.sql`
  2. Apresentadas em blocos de código para o desenvolvedor
  3. O desenvolvedor irá executar manualmente no Supabase

#### Formato para queries:

```sql
-- =============================================
-- NOME DA FUNCIONALIDADE
-- Data: DD/MM/YYYY
-- Descrição: O que essa query faz
-- =============================================

-- Query aqui
```

### 📝 Ao Implementar Novas Funcionalidades

1. Verificar o estado atual em `imple.md`
2. Implementar a funcionalidade no código
3. Se precisar de banco de dados:
   - Adicionar query em `tabelas.sql`
   - Informar o desenvolvedor para executar no Supabase
4. Atualizar `imple.md` marcando como concluído
5. Nunca criar arquivos de documentação extras

### 🔄 Fluxo de Trabalho

```
1. Ler imple.md → Ver o que precisa ser feito
2. Implementar código → React/TypeScript
3. Se precisar de DB → Adicionar em tabelas.sql
4. Atualizar imple.md → Marcar status
5. Informar desenvolvedor → Queries pendentes
```

## Estrutura do Projeto

```
pega-ou-passa/
├── components/          # Componentes React
├── agents.md           # Guia para agentes (este arquivo)
├── imple.md            # Fonte da verdade das funcionalidades
├── tabelas.sql         # Todas as queries SQL
├── App.tsx             # Componente principal
├── constants.ts        # Dados mockados (será substituído por Supabase)
├── types.ts            # Tipos TypeScript
└── ...
```

## Contato com Supabase

- **URL do projeto**: [Será configurado]
- **Chave anon/public**: [Será configurado]
- As credenciais serão adicionadas em variáveis de ambiente

---

**Última atualização**: 27/11/2025
