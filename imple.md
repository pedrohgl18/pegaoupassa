# 📋 Implementações - Pega ou Passa

> **⚠️ ESTE ARQUIVO É A FONTE DA VERDADE DO PROJETO**
> Sempre manter atualizado quando funcionalidades forem adicionadas, modificadas ou removidas.

**Última atualização**: 27/11/2025

---

## Legenda de Status

- ✅ Concluído
- 🚧 Em desenvolvimento
- ⏳ Pendente
- ❌ Removido/Cancelado

---

## 1. Autenticação e Usuários

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tela de login | ✅ | Visual implementado |
| Login com Google | ✅ | Integrado com Supabase Auth |
| App Icon | ✅ | Novo ícone SVG/PNG gerado para Android |
| Login com Facebook | ⏳ | Precisa integrar Supabase Auth |
| Logout funcional | ✅ | Implementado |
| Sessão persistente | ✅ | Supabase Auth |
| Recuperação de senha | ⏳ | Se usar email/senha |
| Hook useAuth | ✅ | hooks/useAuth.ts |
| Loading inicial | ✅ | Tela de carregamento |

---

## 2. Onboarding (Cadastro)

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tela de bio | ✅ | Substituído por "Quebra-Gelo" |
| Campo de nome | ✅ | Adicionado ao step 1 |
| Data de nascimento | ✅ | Implementado |
| Seleção de gênero | ✅ | Implementado ("Homem", "Mulher", "Elu/Delu") |
| Preferência de gênero | ✅ | Implementado ("Homens", "Mulheres", "Todes") |
| Salvar no banco | ✅ | Integrado com Supabase |
| Upload de fotos | ✅ | Step 2 - Supabase Storage (Signed URLs) |
| Validação de idade (18+) | ⏳ | Precisa implementar |
| Barra de progresso | ✅ | 4 steps |
| Seleção de interesses/tags | ✅ | Implementado (Onboarding + EditProfile) |
| Persistência de progresso | ✅ | Salva cada step no banco |
| Retomar onboarding | ✅ | Continua de onde parou |
| Calculo automático de signo | ✅ | Baseado na data de nascimento |
| Campo de Altura | ✅ | Adicionado ao step 3 |
| Limite de caracteres (Bio) | ✅ | Max 500 chars com contador |

---

## 3. Perfil do Usuário

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Visualização de perfil | ✅ | Visual moderno (Violet/Light) |
#### Perfil (`components/Profile.tsx`)
- Visualização do próprio perfil.
- Edição básica (leva para `EditProfile`).
- Acesso a Configurações (Menu dedicado).
- Status "Modo Agora" (Vibe) com indicador Violeta.
- Preview do perfil (como os outros veem).
- **Sem localização (cidade/estado)** - Removido por privacidade (10/12/2025).

#### Editar Perfil (`components/EditProfile.tsx`)
- Upload de fotos (Drag & Drop).
- Edição de bio, trabalho, escola.
- Seleção de Interesses (Modal).

#### Chats (`components/ChatList.tsx`, `components/ChatScreen.tsx`)
- Lista de matches e conversas.
- Chat em tempo real (Supabase Realtime).
- Recibos de leitura (azul para lido). **Duplo check apenas para VIPs** (10/12/2025).
- Bloqueio e Denúncia de usuários (Menu "kebab").

| Foto do Google | ✅ | Exibe avatar do Google |
| Nome do usuário | ✅ | Exibe nome do perfil/Google |
| Edição de bio | ✅ | Implementado em EditProfile |
| Edição de fotos | ✅ | Adicionar/Remover fotos |
| Múltiplas fotos (galeria) | ✅ | Suporte a 6 fotos |
| Informações extras | ✅ | Profissão, altura, escolaridade, signo |
| Verificação de perfil | ⏳ | Selfie com gesto |
| Estatísticas do perfil | ✅ | Likes recebidos, matches (VIP Only) |
| Visualizar como público | ✅ | Ver como os outros veem seu card |

---

## 4. Tela Home (Feed de Swipe)

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Card de perfil | ✅ | Visual implementado |
| Swipe vertical | ✅ | Baixo = curtir, Cima = passar |
| Animação de swipe | ✅ | Básica implementada |
| Animação 3D de swipe | ✅ | Rotação e escala com perspective |
| Feedback visual (coração/X) | ✅ | Mostrar ícone ao arrastar |
| Indicador de direção | ⏳ | Texto explicativo para novos usuários |
| Galeria de fotos no card | ✅ | Navegação por toque esq/dir |
| Informações completas | ✅ | Distância, online, interesses em comum |
| Compatibilidade por signo | ✅ | Badge mostrando % e texto |
| Botões de ação | ✅ | Botões flutuantes removidos (apenas swipe) |
| Botão voltar (rewind) | ⏳ | Desfazer último swipe |
| Super Like | ⏳ | Curtida especial |
| Tela "sem mais perfis" | ✅ | Estado vazio implementado ("Zerou o game") |
| Loading skeleton | ✅ | Loader implementado |

---

## 5. Sistema de Match

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Registrar likes | ✅ | Salva no banco via API |
| Registrar passes | ✅ | Salva no banco via API |
| Detectar match mútuo | ✅ | Retornado pela API de swipe |
| Tela "It's a Match!" | ✅ | Modal implementado - Foto correta do usuário (10/12/2025) |
| Notificação de match | ✅ | Push notification via Edge Function |
| Lista de matches | ✅ | Visual implementado |
| Desfazer Match (Unmatch) | ✅ | Remove match e recicla perfil |
| Denunciar Usuário | ✅ | Implementado e corrigido (Snapshot da conversa incluído) |
| Tutorial Interativo | ⏳ | Pendente |

---

## 6. Chat e Mensagens

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Lista de conversas | ✅ | Visual implementado - Correção de duplicação (10/12/2025) |
| Seção de novos matches | ✅ | Visual implementado |
| Tela de conversa | ✅ | Abrir chat individual |
| Enviar mensagem | ✅ | Input e envio |
| Receber mensagem | ✅ | Real-time com Supabase |
| Preview última mensagem | ✅ | Na lista de conversas (Realtime) |
| Timestamp | ✅ | Horário das mensagens |
| Indicador online/offline | ✅ | Bolinha verde e status "Online agora" |
| Indicador "digitando..." | ✅ | Real-time Presence |
| Mensagem lida (ticks) | ✅ | Confirmação de leitura (VIP Only para verificação) |
| Envio de fotos | ✅ | VIP Only - Supabase Storage |
| Envio de áudio | ✅ | VIP Only - Gravação e envio |
| Envio de GIFs | ⏳ | Integração GIPHY |
| Reações em mensagens | ✅ | ❤️ 😂 😮 😢 👍 - Long press |
| Responder mensagem | ✅ | Quote/Reply - Long press |
| Apagar mensagem | ✅ | Deletar para todos (próprias msgs) |
| Toast notifications | ✅ | Feedback in-app para ações |
| Canais de Notificação | ✅ | Android Channels (Message, Match, Like) |
| Supressão In-App | ✅ | Não notificar se já estiver no chat |

---

## 7. Filtros e Busca

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Filtro de distância | ✅ | Funcional com slider (100km+ fixado) |
| Filtro de idade | ✅ | Funcional com sliders duplos |
| Filtro de gênero | ✅ | Funcional |
| Geolocalização real | ✅ | API BigDataCloud (Strict Mode: Cidade L8, Bairro L10) |
| Filtros avançados | ✅ | Altura e Signo implementados |
| Aplicar filtros na busca | ✅ | Query no banco via RPC (PostGIS/Cube) - Otimizado (11/12/2025) |
| Modularização App.tsx | ✅ | Decomposição em Hooks e Screens (hooks/, screens/, components/) |

---

## 8. Sistema VIP/Premium

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tela VIP | ✅ | Visual implementado (Legendário) |
| Limite de likes (free) | ✅ | 30/dia persistido no banco (App.tsx) |
| Likes ilimitados (VIP) | ✅ | Lógica implementada |
| Ver quem curtiu você | ✅ | Lista com blur (free) e visível (VIP) |
| Visualizar perfil de quem curtiu (VIP) | ✅ | Swipável sem botões (10/12/2025) |
| Boost de perfil | 🚧 | DB pronto, falta UI (R$1.99/30min) |
| Rewind ilimitado | ⏳ | Voltar perfis |
| Leitura de recibos | ✅ | Ver se leu mensagem (apenas VIP vê checks duplos) |
| Modo viagem | ⏳ | Mudar localização |
| Integração pagamento | ⏳ | Google Play Billing |

---

## 9. Notificações

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Push notifications | ✅ | Firebase FCM + Capacitor + Edge Function |
| Notificação de match | ✅ | Via Edge Function (Channel: matches) |
| Notificação de mensagem | ✅ | Via Edge Function (Channel: messages, Grouped) |
| Notificação de like | ✅ | Via Edge Function (Channel: likes, Privado, Sem nome) |
| Configurações de notificação | ✅ | Canais Android e Agrupamento implementados |

---

## 10. UX e Interface

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Navegação por abas | ✅ | Bottom navigation fixo (bg-white/90) |
| Tema cores | ✅ | Modern Cool-Tones (Violet/Blue/Teal) |
| Responsividade | ✅ | Ajustes para Android/Small Screens (Login) |
| Animações de transição | ✅ | Entre telas (Fade, Slide) |
| Loading states | ✅ | Spinners, skeletons, loading screen dedicada |
| Estados vazios | ✅ | Telas sem conteúdo |
| Modo escuro | ⏳ | Tema dark |
| Acessibilidade (ARIA) | ⏳ | Leitores de tela |
| Tutorial primeiro uso | ✅ | Ver detalhes abaixo |

### Tutorial Overlay - Documentação

**Como funciona:**
- Estado persistido no Supabase: `profiles.has_seen_tutorial` (boolean, default: false)
- Ao abrir HOME com `has_seen_tutorial = false` → exibe overlay
- Ao clicar "Entendi!" → `updateProfile({ has_seen_tutorial: true })`
- Componente: `components/TutorialOverlay.tsx` (posição: `fixed`)

**Arquivos envolvidos:**
- `App.tsx` - Lógica de exibição em `renderHome()` + função `dismissTutorial()`
- `components/TutorialOverlay.tsx` - Componente visual
- `types/database.ts` - Tipo `has_seen_tutorial`
- `tabelas.sql` - Coluna no banco

**Troubleshooting:**
1. **Tutorial não aparece:** Verificar `SELECT has_seen_tutorial FROM profiles WHERE id = 'USER_ID'`
2. **Resetar tutorial:** `UPDATE profiles SET has_seen_tutorial = false WHERE id = 'USER_ID'`
3. **Coluna não existe:** Executar `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_tutorial BOOLEAN DEFAULT FALSE;`

---

## 11. Técnico/Infraestrutura

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Configurar Supabase | ✅ | Projeto criado, tabelas executadas |
| Variáveis de ambiente | ✅ | .env configurado |
| Supabase Auth | ✅ | Cliente configurado em lib/supabase.ts (Fetch Direct no Android) |
| Supabase Database | ✅ | PostgreSQL com todas as tabelas |
| Supabase Storage | ✅ | Bucket "photos" criado (Privado - Signed URLs) |
| Supabase Realtime | ✅ | Configurado para mensagens e presença |
| Types do banco | ✅ | types/database.ts criado |
| PWA | ⏳ | Progressive Web App |
| Capacitor Android | ✅ | Configurado com FCM e Geolocation |
| Supabase Edge Functions | ✅ | send-push-notification (Deploy via MCP) |
| 10/12/2025 | **Canais de Notificação** | Implementado canais Android (Messages, Matches, Likes) para controle do usuário. |
| 10/12/2025 | **Agrupamento de Notificações** | Mensagens agrupadas por conversa e Matches por ID, evitando flood. |
| 10/12/2025 | **Privacidade de Likes** | Notificação de Like não mostra mais o nome da pessoa ("Alguém curtiu você"). |
| 10/12/2025 | **Correção Match Photo** | Modal "Deu Match" agora usa foto do perfil em vez de fallback do Google. |
| 10/12/2025 | **Correção Duplicação** | Corrigido duplicação de usuários na lista "Quem te deu like" após match (Optimistic Update). |
| 10/12/2025 | **UX Swipe Viewer** | Visualizador de "Quem te curtiu" agora é apenas swipe (removido botões fixos). |
| 10/12/2025 | **Read Receipts VIP** | Lógica alterada: apenas VIPs veem o duplo check de leitura. |
| 10/12/2025 | **Privacidade Perfil** | Removida exibição de cidade/bairro no perfil público. |
| 10/12/2025 | **Permissões Notificação** | Solicitação forçada de permissão na inicialização e após onboarding (Android Native). |
| 10/12/2025 | **Fix Tutorial Overlay** | Migrado de localStorage para Supabase (`profile.has_seen_tutorial`). Posicionamento `fixed`. |
| 10/12/2025 | **Remove Profile Fallbacks** | Removido todos os fallbacks de imagem (picsum.photos) para evitar inconsistências. |
| 11/12/2025 | **Fix Avatar Desaparecendo** | Ver seção detalhada abaixo. |
| 11/12/2025 | **Limpeza de Código** | Removido ~150 linhas de código morto (setProfileState, createProfile, updateOnboardingStep, createInitial, console.logs). |
| 11/12/2025 | **Admin Panel (God Mode)** | Painel administrativo localhost-only com Dashboard (KPIs), Gestão de Usuários (VIP/Ban), Geografia e Quotas. Lazy loading + bloqueio no APK. |
| 26/12/2025 | **Documentação Legal** | Política de Privacidade, Termos de Uso e Política de Exclusão de Dados (LGPD/GDPR 2025) implementados. |
| 26/12/2025 | **Botões de Política** | Adicionados links para documentos legais na tela de Configurações via Capacitor Browser. |
| 27/11/2025 | **Admin Panel (Phase 2-4)** | Refatoração Desktop-first massiva. Adicionado Evidências de Chat (Moderador), Personificação de Usuário, Feed de Atividade Real-time, Heatmap Geo Real, Broadcast Push Global, Gestor de Vouchers Real e Ferramenta de Faxina. |

---

## 13. Recursos Administrativos Avançados (Phases 2-4)

> **Adicionado em 27/11/2025**
> O Painel Admin foi transformado em uma ferramenta desktop robusta para monitoramento e gestão.

### 🛡️ Moderação Avançada (Phase 2)
- **Contexto de Denúncia (Evidências)**: Botão "Ver Evidências" no Reports abre modal com o histórico real da conversa entre os envolvidos antes da denúncia.
- **Visualização de Chat**: Suporte pode abrir conversas de qualquer usuário para auditoria ética e suporte técnico.
- **Modo Personificação (Impersonate)**: Admins podem ver o app como se fossem o usuário (via `?impersonate=ID`), facilitando o debug de problemas de conta. Acompanhado de banner visual no App.

### ⚡ Inteligência Real-time (Phase 3)
- **Feed de Atividade**: Lista viva no Dashboard que mostra novos usuários, matches e denúncias no exato momento em que ocorrem (Supabase Realtime).
- **Mapa de Calor (Geo)**: Visualização da concentração geográfica de usuários para tomada de decisão de marketing.

### 📢 Gestão & Comunicação (Phase 4)
- **Push Broadcast Global**: Interface para disparar notificações push para TODOS os dispositivos Android registrados com um clique.
- **Limpeza de Storage**: Botão para deletar mídias órfãs (usuários banidos ou inativos), economizando custos de infraestrutura.
- **Gestor de Vouchers**: Sistema para criar e monitorar códigos promocionais (`promo_codes`) para acesso VIP.

---

## 12. Bugs Resolvidos - Documentação Técnica

### Bug: Avatar/Foto Desaparecendo (11/12/2025)

**Sintomas:**
1. Foto do perfil não aparecia após onboarding (só após reiniciar app)
2. Foto desaparecia ao selecionar "Modo Agora" (Vibe)
3. Qualquer atualização de perfil fazia a foto sumir

**Causa Raiz:**
O método `profiles.update` em `lib/supabase.ts` retornava apenas os campos da tabela `profiles`, **sem incluir as relações** (`photos`, `user_interests`):
```typescript
.select()  // ❌ Não inclui relações
```

Quando `updateProfile` no `useAuth.ts` fazia:
```typescript
setState(prev => ({ ...prev, profile: data }))  // ❌ Sobrescreve tudo
```
O perfil inteiro era substituído pelos dados retornados (sem fotos), perdendo as relações.

**Solução:**
Modificado `updateProfile` em `hooks/useAuth.ts` para **mesclar** os dados atualizados com o perfil existente:
```typescript
setState(prev => ({
  ...prev,
  profile: prev.profile 
    ? { ...prev.profile, ...data }  // ✅ Preserva photos/interests
    : data,
}))
```

**Arquivos modificados:**
- `hooks/useAuth.ts` - Função `updateProfile`

**Fluxos impactados:**
- Onboarding → Home (foto aparece imediatamente)
- Selecionar Vibe/Modo Agora (foto não desaparece mais)
- Editar Perfil (foto preservada)


### Bug: Persistência do Limite de Likes (11/12/2025)

**Problema:**
O contador de likes resetava ao recarregar a página, permitindo likes infinitos na prática. Swipe Up também não afetava o contador (correto), mas a falta de persistência quebrava a lógica de limite diário.

**Solução:**
- Adicionado `useEffect` em `App.tsx` para carregar `daily_likes_count` do perfil ao iniciar.
- Chamada explícita para `swipes.incrementLikeCount` ao dar Swipe Down (Like) em `App.tsx`.


---

### Bug: Erro RPC increment_like_count (11/12/2025)

**Problema:**
O RPC `increment_like_count` retornava erro 400 (Bad Request) ou 500 no navegador.
**Causa:**
Assinatura da função esperava parâmetro `user_id` e permissionamento podia falhar se `auth.uid()` não estivesse alinhado.

**Solução:**
- Alterado RPC para NÃO receber parâmetros. Usa `auth.uid()` diretamente dentro da função (Mais seguro).
- Atualizado `lib/supabase.ts` para chamar sem argumentos.

### Bug: Botão Voltar Android (11/12/2025)

**Problema:**
Botão físico de voltar no Android não fazia nada.

**Solução:**
- Implementado listener `App.addListener('backButton')` no `App.tsx`.
- Lógica de navegação:
    1. Fecha Modais (Filtro, VIP, Tutorial, Match).
    2. Sai de chats para lista.
    3. Sai de telas secundárias (Perfil, Edit) para Home.
    4. Se na Home, minimiza o app (`App.exitApp()`).

### Bug: Self-Like no Perfil Público (11/12/2025)

**Problema:**
Usuario conseguia dar like em si mesmo ao visualizar "Como público".

**Solução:**
- Adicionado bloqueio no `ProfileViewer.tsx`: `if (viewingProfile.id === user.id) return`.

---

## 13. Arquitetura e Guia de Desenvolvimento (Pós-Refatoração)

> **Adicionado em 11/12/2025**
> O projeto sofreu uma **refatoração massiva** para modularizar o antigo monolito `App.tsx`.
> Abaixo está o guia de onde encontrar cada parte do código.

### 🏛️ Estrutura de Pastas

```
src/
├── App.tsx             # [Coordenador] Inicializa hooks globais e passa estado para o Router
├── AppRouter.tsx       # [Roteador] Gerencia navegação e renderização condicional de telas
├── hooks/              # [Lógica] Hooks customizados (Regras de Negócio)
│   ├── useAuth.ts          # Autenticação, Perfil, Sessão
│   ├── useFeed.ts          # Busca de perfis, Filtros (Idade, Distância)
│   ├── useGeolocation.ts   # GPS, Reverse Geocoding, Permissões
│   ├── useMatchData.ts     # Lista de Matches, Likes Recebidos, Realtime Chat
│   ├── useNotifications.ts # Push Notifications, Deep Links
│   ├── useSwipeAction.ts   # Lógica do Swipe (Like/Pass), Criação de Match
│   └── useAppNavigation.ts # Estado de navegação (currentScreen)
├── screens/            # [Telas] Componentes de página inteira
│   ├── LoginScreen.tsx     # Tela de Login (Google Btn)
│   └── HomeScreen.tsx      # Feed Principal, Swipe Cards, Gestos
├── components/         # [UI] Componentes reutilizáveis
│   ├── FilterModal.tsx     # Modal de filtros (Distância, Idade...)
│   ├── VipSettingsModal.tsx# Configurações VIP (Incógnito, Recibos)
│   ├── ProfileViewer.tsx   # Overlay para ver perfil de quem deu like
│   └── ... (outros componentes menores)
└── lib/                # [Infra] Configurações de serviços
    ├── supabase.ts         # Cliente Supabase, RPCs, Types
    └── ...
```

### 🔍 Onde eu acho... ?

| Se eu quero mexer em... | Devo ir em... |
|-------------------------|---------------|
| **Lógica de Login** | `hooks/useAuth.ts` |
| **Visual da Tela de Login** | `screens/LoginScreen.tsx` |
| **Card do Feed / Swipe** | `screens/HomeScreen.tsx` |
| **Regras do Swipe (Like/Pass)** | `hooks/useSwipeAction.ts` |
| **Filtros (Idade, Distância)** | `hooks/useFeed.ts` (Lógica) e `components/FilterModal.tsx` (UI) |
| **GPS / Localização** | `hooks/useGeolocation.ts` |
| **Push Notifications** | `hooks/useNotifications.ts` |
| **Lista de Conversas** | `hooks/useMatchData.ts` (Dados) e `components/ChatList.tsx` (UI) |
| **Navegação entre Telas** | `AppRouter.tsx` |

### 🛠️ Como Adicionar Nova Funcionalidade

1.  **Nova Tela**:
    *   Crie o arquivo em `screens/NovaTela.tsx`.
    *   Adicione o estado no `enum ScreenState` em `types.ts`.
    *   Adicione a rota no `AppRouter.tsx`.
    *   Se precisar de dados globais, passe via props no `App.tsx`.

2.  **Nova Lógica de Negócio**:
    *   Se for reutilizável ou complexa, crie um Hook em `hooks/useNovaLogica.ts`.
    *   Instancie no `App.tsx` e passe o resultado para onde for necessário.

3.  **Novo Componente UI**:
    *   Crie em `components/NovoComponente.tsx`.
    *   Mantenha-o "burro" (recebendo dados via props) sempre que possível.

### ⚠️ Regras de Ouro (Refatoração)

1.  **App.tsx deve ser limpo**: Ele serve apenas para "colar" os hooks e passar para o roteador. Não escreva JSX complexo ou `useEffect` de lógica de negócio nele (exceto inicializações globais).
2.  **Hooks devem ser focados**: Um hook deve fazer uma coisa bem feita (`useGeolocation` só cuida de GPS).
### 14. Auditoria e Otimizações (11/12/2025)

> **Resumo**: Foi realizada uma auditoria de segurança e performance para garantir escalabilidade.

#### 🛡️ Segurança
*   **URLs Assinadas Seguras**: A validade das URLs de imagens privadas (Storage) foi reduzida de **10 anos** para **1 hora**. Isso impede que links vazados sejam usados indefinidamente.
*   **Email Admin Protegido**: O email de admin (`pedrohgl18@...`) foi movido do cÃ³digo fonte para `import.meta.env.VITE_ADMIN_EMAIL`.

#### 🚀 Performance
*   **Otimização de GPS**: O hook `useGeolocation` agora calcula a distância percorrida (Haversine) e **só envia update para o banco se o usuário tiver se movido mais de 500m**.
    *   *Antes*: 1 write a cada 15 min (96 writes/dia/usuário mesmo parado).
    *   *Depois*: Writes apenas ao se mover significativamente.
*   **RPC de Feed**: Filtragem de distância movida para o banco (`get_nearby_profiles`), evitando baixar milhares de perfis para filtrar no JS.

#### 🧹 Boas Práticas (Em progresso)
*   [x] **Otimização de Imagens**: Implementado `getPublicUrl` + Supabase Transformations (`?width=500&format=webp`) no `SwipeCard`.
*   [x] **Acessibilidade**: Adicionado `aria-label` em botões de navegação e cards.
*   [x] **Batch Updates**: Implementado `markBatchAsRead` para evitar N+1 queries no Chat.

### Chat Snapshot no Report (11/12/2025)

**Problema:**
Admins não conseguiam ver o contexto da denúncia se o usuário desfizesse o match (unmatch deleta conversa).

**Solução:**
- Adicionado coluna JSONB `chat_snapshot` na tabela `reports`.
- Frontend envia histórico completo de mensagens no momento da denúncia.
- Dados persistem mesmo após Unmatch/Block.

### 16. Migração Storage (Supabase -> Cloudflare R2) (12/12/2025)
- **Status**: ✅ Concluído
- **Descrição**: Migração do armazenamento de fotos e mídia de chat para o Cloudflare R2 para redução de custos (Zero Egress).
- **Mudanças Técnicas**:
    - Criado adapter `lib/r2.ts`.
    - Implementada Edge Function `upload-r2` para gerar URLs assinadas (Server-Side).
    - Removidas chaves secretas do `.env` (Client-Side).
    - `EditProfile.tsx` e `ChatScreen.tsx` atualizados para usar o novo fluxo seguro.
- **Segurança**: Agora o App solicita permissão ao servidor para cada upload. As chaves `SECRET_KEY` do R2 ficam guardadas apenas no Supabase (Secrets), não no APK.

### Bugs Resolvidos (12/12/2025) - Pós Migração R2
1.  **Crash de Navegação (`setPreviousScreen`)**:
    *   **Erro**: `Uncaught TypeError: setPreviousScreen is not a function`.
    *   **Causa**: O hook `useAppNavigation` não exportava a função `setPreviousScreen`, mas o `AppRouter` tentava usá-la.
    *   **Correção**: Exportada a função no hook.
2.  **Erro de Upload R2 (401 Unauthorized)**:
    *   **Erro**: Edge Function retornava 401.
    *   **Causa**: O token de sessão não estava sendo passado corretamente no cabeçalho `Authorization` da chamada `supabase.functions.invoke`.
    *   **Correção**: Adicionado cabeçalho explícito `Authorization: Bearer ${token}` em `lib/r2.ts`.
3.  **URLs Públicas R2 Distintas**:
    *   **Problema**: O R2 usa subdomínios diferentes para cada bucket (`photos` vs `chat-media`).
    *   **Correção**: Atualizado `.env` e `lib/r2.ts` para suportar `VITE_R2_PUBLIC_URL_PHOTOS` e `VITE_R2_PUBLIC_URL_CHAT`.
4.  **Erro "Seja VIP" e Likes (400 Bad Request)**:
    *   **Problema**: Trigger `protect_profile_fields` bloqueava atualizações de `is_vip` e `daily_likes_count` mesmo vindas de funções `SECURITY DEFINER`.
    *   **Correção**: Atualizada trigger para permitir bypass se o usuário do banco for `postgres` ou `supabase_admin`.
5.  **Menu Inferior Sumindo**:
    *   **Problema**: Ao usar "Seja VIP" dentro do Chat, a variável `activeChat` não era limpa ao navegar para Home, mantendo o menu oculto (zombie state).
    *   **Correção**: Atualizado `handleVipPurchase` em `App.tsx` para executar `setActiveChat(null)`.

---
### 17. Redesign do Swipe Card e Vibe (12/12/2025)
- **Status**: ✅ Concluído
- **Mudanças Visuais**:
    - **Layout Dividido**: Card agora ocupa 75% da altura com a foto e 25% com informações ( fundo branco), criando um visual mais limpo e moderno.
    - **Paleta de Core**: Adotado Violeta (Primary) e Branco como cores principais no card.
    - **Contagem de Likes**: Movido para pílula flutuante no topo direito (HomeScreen), evitando sobreposição.
    - **Compatibilidade Astral**: Movido para o canto inferior direito da foto para não brigar com outros elementos.
    - **Borda Colorida**: O card da frente agora tem uma borda colorida que reflete a Vibe ativa (ex: Roxo para Rolê, Vermelho para Encontro).
- **Correções de Layout**:
    - **Safe Area (Galaxy S9)**: Aumentado padding inferior do card (Front e Back) para evitar que o menu flutuante cubra as informações ou tags em telas menores.
    - **Vibe Badge**: Ajustado posicionamento vertical (`top-14`) para não colidir com elementos do topo.
    - **Correção de Cores**: Removido overlay degradê que tinturava a foto inteira. Agora a cor da vibe aparece apenas na borda e nos detalhes.
    - **Contraste**: Emoji de "Encontro" alterado de Rosa (🌹) para Taças (🥂) para melhor visibilidade no fundo vermelho.
    - **Flip Logic**: Corrigido bug onde o botão de informações não virava o card visualmente se houvesse callback.

### Como Verificar
1. **Swipe Card**: Abra o app e veja o novo layout dividido (Foto/Info).
2. **Vibe**: Selecione uma vibe (ex: Encontro) e veja a borda do card ficar vermelha e o ícone de taças aparecer.
3. **Info Button**: Toque no botão "i" para virar o card e ver detalhes.
4. **Telas Pequenas**: Verifique que as tags e botão de info não estão cobertos pelo menu inferior.

---
### 18. Analysis Remediation & Optimization (26/12/2025)
- **Status**: ✅ Concluído
- **Objetivo**: Refatoração profunda focada em segurança, arquitetura e performance (Android).

#### 🛡️ Segurança (Critical Fixes)
- **Migração de Storage**: Removido uso inseguro de `localStorage` (que limpa com o OS). Agora usando `@capacitor/preferences` (SharedPreferences/NSUserDefaults) para sessão Supabase e notificações pendentes.
- **Permissões Android**: Adicionado `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` explicitamente no `AndroidManifest.xml` para garantir funcionamento de uploads em Android 13+.
- **Database Security**: Corrigido vulnerabilidade `search_path` em 3 funções SQL (`get_database_metrics`, etc) para prevenir hijacking.

#### 🏗️ Arquitetura (Code Quality)
- **Modularização (God Object)**: O arquivo monolítico `lib/supabase.ts` (1000+ linhas) foi quebrado em micro-serviços focados em `lib/services/`:
    - `auth.service.ts`: Login, Session.
    - `profile.service.ts`: Dados do usuário, Photos.
    - `message.service.ts`: Chat, Realtime.
    - `interaction.service.ts`: Swipes, Matches.
    - `notification.service.ts`: Push, Channels.
    - `utility.service.ts`: Reports, Blocks, Boosts.
- **Retrocompatibilidade**: O arquivo `lib/supabase.ts` foi mantido como um *Facade* (Barrel File), reexportando os serviços para não quebrar imports existentes.

#### ⚡ Performance (App & DB)
- **Virtualização do Chat**: Substituído `.map()` simples por `react-virtuoso` no `ChatScreen.tsx`.
    - *Antes*: Renderizava todas as mensagens do DOM (lento em conversas longas).
    - *Agora*: Renderiza apenas o que está na tela (Windowing). Componente `MessageBubble` memoizado.
- **Otimização de Banco de Dados (SQL Indexing)**:
    - Criados 5 novos índices para chaves estrangeiras (fkeys) que estavam causando lentidão em `JOINs` (e.g., `messages.reply_to_id`, `notifications.sender_id`).
    - Removido índice duplicado em `reports`.

### Como Verificar
1. **Chat Rápido**: Abra uma conversa longa e role rapidamente. Deve estar fluido (60fps).
2. **Login Persistente**: Faça login, feche o app totalmente e abra de novo. A sessão deve persistir (via Capacitor Preferences).
3. **DB Metrics**: No painel admin (localhost), verifique se as queries de métricas continuam funcionando.

---
### 19. Remoção de Console Logs para Produção (26/12/2025)
- **Status**: ✅ Concluído
- **Objetivo**: Remover todos os `console.log`, `console.error` e `console.warn` do código para segurança em produção.

#### ⚠️ Problema (Crítico)
- **Exposição de Dados Sensíveis**: Statements de console podem expor informações sensíveis via `adb logcat` em dispositivos Android.
- **Dados Expostos Anteriormente**:
    - URLs de OAuth e tokens de autenticação
    - IDs de usuários e perfis
    - Detalhes de swipes e matches
    - Erros de banco de dados e respostas de APIs
    - URLs assinadas de storage

#### ✅ Correção Implementada
Removidas **50+ declarações de console** de todos os arquivos do projeto:

**Services (`lib/services/`):**
- `supabase.client.ts` - Removed init logs
- `auth.service.ts` - Removed OAuth debug logs
- `interaction.service.ts` - Removed swipe/match logs
- `notification.service.ts` - Removed push debug logs
- `profile.service.ts` - Removed profile fetch logs
- `utility.service.ts` - Removed interest save logs

**Libs (`lib/`):**
- `r2.ts` - Removed upload progress logs
- `pushNotifications.ts` - Removed token/registration logs

**Hooks (`hooks/`):**
- `useSwipeAction.ts` - Removed swipe error logs
- `useNotifications.ts` - Removed push receive logs
- `useMatchData.ts` - Removed message receive logs
- `useGeolocation.ts` - Removed GPS/permission logs
- `useFeed.ts` - Removed feed fetch logs
- `useAuth.ts` - Removed profile/session logs

**Components (`components/`):**
- `ChatScreen.tsx` - Removed upload/push logs
- `Settings.tsx` - Removed config save logs
- `ReceivedLikesList.tsx` - Removed action logs
- `ProfileViewer.tsx` - Removed swipe logs
- `Onboarding.tsx` - Removed location logs
- `FilterModal.tsx` - Removed filter save logs
- `EditProfile.tsx` - Removed upload logs

**Screens (`screens/`):**
- `LoginScreen.tsx` - Removed login error logs

**Core:**
- `App.tsx` - Removed VIP purchase logs
- `AdminRouter.tsx` - Removed stats/quota logs

#### 🔍 Como Verificar
1. **Build sem erros**: Execute `npm run build` - deve compilar sem warnings de console.
2. **Grep test**: Execute `grep -r "console\." --include="*.ts" --include="*.tsx"` - não deve retornar resultados.
3. **adb logcat**: Conecte um dispositivo e verifique que não há logs sensíveis da aplicação.

#### 📋 Correção de Lint Adicional
- **ReceivedLikesList.tsx**: Corrigido import de `calculateAge` - alterado de `../App` para `../utils` (onde a função está corretamente exportada).

