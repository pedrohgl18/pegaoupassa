# 🤖 Guia para Agentes de IA - Pega ou Passa

## Sobre o Projeto

**Pega ou Passa** é um aplicativo de namoro estilo Tinder/TikTok desenvolvido para **Android**. O app utiliza swipe vertical (para baixo = curtir, para cima = passar).

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
1.  **NUNCA criar outros arquivos `.md`** - Usar apenas `agents.md` e `imple.md`
2.  **NUNCA criar outros arquivos `.sql`** - Todas as queries vão em `tabelas.sql`
3.  **NUNCA executar `npm run dev`** - O desenvolvedor sempre roda manualmente quando necessário
4.  **NUNCA usar timeouts em chamadas ao Supabase** - Deixar as queries executarem normalmente
5.  **NUNCA adicionar logs/console.log** - Só adicionar logs quando o desenvolvedor pedir explicitamente. Sempre buscar ler o código e resolver o problema sem depender de logs
6.  **SEMPRE rodar os comandos de build/sync e analisar a saída** - Exceto `npm run dev`
7.  **SEMPRE atualizar `imple.md`** quando uma funcionalidade for adicionada, modificada ou removida
8.  **O arquivo `imple.md` é a fonte da verdade** - Sempre consultá-lo para saber o estado atual do projeto
9.  **NUNCA assumir/adivinhar** - O estado do banco deve ser verificado via MCP (`list_tables`, `execute_sql` etc) **ANTES** de gerar código que dependa dele. Só pergunte ao desenvolvedor se a informação não estiver disponível via MCP.
10. **Buckets do Supabase Storage usam RLS** - NÃO são públicos por padrão. Usar URLs assinadas quando necessário
11. **SEMPRE subir para o GitHub** ao finalizar uma tarefa: `git push -u origin main`
12. **SEMPRE gerar build Android** ao finalizar uma tarefa, executando COMANDOS SEPARADOS (um por vez, sem `&` ou `&&`):
    - `npm run build`
    - `npx cap sync android`
    - `cd android`
    - `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
    - `./gradlew assembleDebug`
    - **IMPORTANTE**: Usar sempre PowerShell no VSCode. Nunca usar comandos Linux (ls, cp, etc) se não tiverem alias.

### 📱 Regras de UI/UX (Android First)

1.  **Safe Areas**: SEMPRE respeitar as barras do sistema (status bar e navigation bar).
    *   Use `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
    *   Evite colocar botões interativos nos extremos da tela sem margem de segurança.
2.  **Paleta de Cores**: O app é **CLARO** (Light Mode).
    *   Evite fundos pretos/escuras (`slate-900`, `bg-black`, etc) em cards e modais.
    *   Use `bg-white` ou `bg-zinc-50` para superfícies.
    *   Texto principal: `text-zinc-900`.
    *   Texto secundário: `text-zinc-500`.

### 🗄️ Banco de Dados (Supabase)

### 🗄️ Banco de Dados (Supabase)

- **USO OBRIGATÓRIO do Supabase MCP Server** para todas as interações com o banco.
- **SEMPRE** consultar o esquema atual (tabelas, colunas, policies) via ferramentas MCP (`get_project`, `list_tables`, `execute_sql` para inspeção) **ANTES** de propor ou fazer alterações.
- **SEMPRE** executar queries e migrations utilizando as ferramentas do MCP (`execute_sql`, `apply_migration`).
- As queries SQL **DEVEM** continuar sendo registradas no arquivo `tabelas.sql` para documentação e histórico, mesmo que executadas via MCP.
- **NUNCA** assumir o estado do banco; verifique sempre via MCP.

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
   - Executar query/migration via ferramentas MCP (`execute_sql` ou `apply_migration`)
4. Atualizar `imple.md` marcando como concluído
5. Nunca criar arquivos de documentação extras

### 🔄 Fluxo de Trabalho

```
1. Ler imple.md → Ver o que precisa ser feito
2. Implementar código → React/TypeScript
3. Se precisar de DB → Adicionar em tabelas.sql e Executar via MCP
4. Atualizar imple.md → Marcar status
5. Verificar via MCP se alterações foram aplicadas com sucesso
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
