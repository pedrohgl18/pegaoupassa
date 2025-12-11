# 📋 Implementações - Pega ou Passa

> **⚠️ ESTE ARQUIVO É A FONTE DA VERDADE DO PROJETO**
> Sempre manter atualizado quando funcionalidades forem adicionadas, modificadas ou removidas.

**Última atualização**: 11/12/2025

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
| Lista de matches | ✅ | Visual implementado no chat |
| Desfazer Match (Unmatch) | ✅ | Remove match e recicla perfil |

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
| Geolocalização real | ✅ | API de GPS + BigDataCloud (Bairro/Cidade) |
| Filtros avançados | ✅ | Altura e Signo implementados |
| Aplicar filtros na busca | ✅ | Query no banco com Haversine |

---

## 8. Sistema VIP/Premium

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tela VIP | ✅ | Visual implementado (Legendário) |
| Limite de likes (free) | ✅ | 30/dia implementado |
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

