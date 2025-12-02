# 📋 Implementações - Pega ou Passa

> **⚠️ ESTE ARQUIVO É A FONTE DA VERDADE DO PROJETO**
> Sempre manter atualizado quando funcionalidades forem adicionadas, modificadas ou removidas.

**Última atualização**: 28/11/2025

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
| Tela de bio | ✅ | Implementado |
| Campo de nome | ✅ | Adicionado ao step 1 |
| Data de nascimento | ✅ | Implementado |
| Seleção de gênero | ✅ | Implementado |
| Preferência de gênero | ✅ | Implementado |
| Salvar no banco | ✅ | Integrado com Supabase |
| Upload de fotos | ✅ | Step 2 - Supabase Storage |
| Validação de idade (18+) | ⏳ | Precisa implementar |
| Barra de progresso | ✅ | 4 steps |
| Seleção de interesses/tags | ✅ | Implementado (Onboarding + EditProfile) |
| Persistência de progresso | ✅ | Salva cada step no banco |
| Retomar onboarding | ✅ | Continua de onde parou |

---

## 3. Perfil do Usuário

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Visualização de perfil | ✅ | Visual básico implementado |
| Foto do Google | ✅ | Exibe avatar do Google |
| Nome do usuário | ✅ | Exibe nome do perfil/Google |
| Edição de bio | ✅ | Implementado em EditProfile |
| Edição de fotos | ✅ | Adicionar/Remover fotos |
| Múltiplas fotos (galeria) | ✅ | Suporte a 6 fotos |
| Informações extras | ✅ | Profissão, altura, escolaridade, signo |
| Verificação de perfil | ⏳ | Selfie com gesto |
| Estatísticas do perfil | ✅ | Likes recebidos, matches (VIP Only) |
| Visualizar como público | ✅ | Ver como os outros veem seu perfil |

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
| Botões de ação | ✅ | Botões flutuantes implementados |
| Botão voltar (rewind) | ⏳ | Desfazer último swipe |
| Super Like | ⏳ | Curtida especial |
| Tela "sem mais perfis" | ✅ | Estado vazio implementado |
| Loading skeleton | ✅ | Loader implementado |

---

## 5. Sistema de Match

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Registrar likes | ✅ | Salva no banco via API |
| Registrar passes | ✅ | Salva no banco via API |
| Detectar match mútuo | ✅ | Retornado pela API de swipe |
| Tela "It's a Match!" | ✅ | Modal implementado |
| Notificação de match | ⏳ | Push notification |
| Lista de matches | ✅ | Visual implementado no chat |
| Desfazer Match (Unmatch) | ✅ | Remove match e recicla perfil |

---

## 6. Chat e Mensagens

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Lista de conversas | ✅ | Visual implementado |
| Seção de novos matches | ✅ | Visual implementado |
| Tela de conversa | ✅ | Abrir chat individual |
| Enviar mensagem | ✅ | Input e envio |
| Receber mensagem | ✅ | Real-time com Supabase |
| Preview última mensagem | ✅ | Na lista de conversas (Realtime) |
| Timestamp | ✅ | Horário das mensagens |
| Indicador online/offline | ✅ | Bolinha verde e status "Online agora" |
| Indicador "digitando..." | ✅ | Real-time Presence |
| Mensagem lida (ticks) | ⏳ | Confirmação de leitura |
| Envio de fotos | ✅ | VIP Only - Supabase Storage |
| Envio de áudio | ✅ | VIP Only - Gravação e envio |
| Envio de GIFs | ⏳ | Integração GIPHY |
| Reações em mensagens | ✅ | ❤️ 😂 😮 😢 👍 - Long press |
| Responder mensagem | ✅ | Quote/Reply - Long press |
| Apagar mensagem | ✅ | Deletar para todos (próprias msgs) |
| Toast notifications | ✅ | Feedback in-app para ações |

---

## 7. Filtros e Busca

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Filtro de distância | ✅ | Funcional com slider |
| Filtro de idade | ✅ | Funcional com sliders duplos |
| Filtro de gênero | ✅ | Funcional |
| Geolocalização real | ✅ | API de GPS integrada |
| Filtros avançados | ✅ | Altura e Signo implementados |
| Aplicar filtros na busca | ✅ | Query no banco com Haversine |

---

## 8. Sistema VIP/Premium

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tela VIP | ✅ | Visual implementado |
| Limite de likes (free) | ✅ | 30/dia implementado |
| Likes ilimitados (VIP) | ✅ | Lógica implementada |
| Ver quem curtiu você | ✅ | Lista com blur (free) e visível (VIP) |
| Visualizar perfil de quem curtiu (VIP) | ✅ | Modal para decidir like/pass |
| Boost de perfil | 🚧 | DB pronto, falta UI (R$1.99/30min) |
| Rewind ilimitado | ⏳ | Voltar perfis |
| Leitura de recibos | ⏳ | Ver se leu mensagem |
| Modo viagem | ⏳ | Mudar localização |
| Integração pagamento | ⏳ | Google Play Billing |

---

## 8.1 Sistema de Denúncias

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Tabela reports | ✅ | Criada em tabelas.sql |
| API de denúncia | ✅ | reports.create() em supabase.ts |
| Modal de denúncia | ✅ | No chat com motivos predefinidos |
| Bloquear usuário | ✅ | Já existente (bloqueio mútuo) |

---

## 9. Notificações

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Push notifications | ✅ | Firebase FCM + Capacitor + Edge Function |
| Notificação de match | ✅ | Via código (swipes.create) |
| Notificação de mensagem | ✅ | Via código (ChatScreen.handleSend) |
| Notificação de like | ✅ | Implementado (swipes.create) |
| Configurações de notificação | ⏳ | Ativar/desativar tipos |

---

## 10. UX e Interface

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Navegação por abas | ✅ | Bottom navigation |
| Tema cores do Brasil | ✅ | Verde, amarelo, azul |
| Responsividade | ✅ | Básica implementada |
| Animações de transição | ✅ | Entre telas (Fade, Slide) |
| Loading states | ✅ | Spinners, skeletons |
| Estados vazios | ✅ | Telas sem conteúdo |
| Modo escuro | ⏳ | Tema dark |
| Acessibilidade (ARIA) | ⏳ | Leitores de tela |
| Tutorial primeiro uso | ✅ | Explicar swipe |

---

## 11. Técnico/Infraestrutura

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Configurar Supabase | ✅ | Projeto criado, tabelas executadas |
| Variáveis de ambiente | ✅ | .env configurado |
| Supabase Auth | ✅ | Cliente configurado em lib/supabase.ts |
| Supabase Database | ✅ | PostgreSQL com todas as tabelas |
| Supabase Storage | ✅ | Bucket "photos" criado |
| Supabase Realtime | ✅ | Configurado para mensagens |
| Types do banco | ✅ | types/database.ts criado |
| PWA | ⏳ | Progressive Web App |
| Capacitor Android | ✅ | Configurado com FCM |
| Supabase Edge Functions | ✅ | send-push-notification criada |
| 27/11/2025 | Criação do arquivo com levantamento inicial |
| 27/11/2025 | Supabase configurado: tabelas, storage, cliente JS, types |
| 27/11/2025 | Autenticação Google implementada com hook useAuth |
| 27/11/2025 | Corrigido RLS policies - login funcionando 100% |
| 27/11/2025 | Upload de fotos no onboarding implementado |
| 27/11/2025 | Onboarding persistente | Salva progresso por step, retoma de onde parou |
| 28/11/2025 | **CORREÇÃO CRÍTICA** | **Causa**: `useAuth` recarregava perfil em loop. **Solução**: Add `isSameUser` check. |
| 28/11/2025 | **Novos Campos** | Adicionado escolaridade (dropdown), profissão, altura e signo no perfil e galeria. |
| 28/11/2025 | **Sistema VIP** | Implementado visualizador de perfil para "Quem curtiu você" (VIP). |
| 28/11/2025 | **Polimento e UX** | Adicionado animações globais, Skeleton Loading, feedback visual de swipe (drag) e partículas no Match. |
| 28/11/2025 | **Push Notifications** | FCM v1 + Capacitor + Edge Function + Triggers automáticos no banco |
| 28/11/2025 | **Correção Login** | Corrigido imagem quebrada do Google e layout do botão em telas pequenas. |
| 28/11/2025 | **Build & Sync** | Executado `npm run build` e `npx cap sync` para atualizar projeto Android. |
| 28/11/2025 | **Correção Layout** | App agora usa Flexbox para garantir que o menu inferior sempre apareça. |
| 28/11/2025 | **Correção Login** | Adicionado timeout e reset de loading para evitar travamento no login Google. |
| 28/11/2025 | **🔥 BUG CRÍTICO ANDROID - OAuth** | Sessão não era reconhecida após login Google. Ver seção abaixo. |
| 28/11/2025 | **Correção Áudio/Encoding** | Corrigido caracteres corrompidos em alertas e adicionado permissão de microfone no AndroidManifest. |
| 28/11/2025 | **Correção Upload Fotos** | Alterado para usar URL assinada (signedUrl) em vez de URL pública, pois o bucket é privado. |
| 28/11/2025 | **Menu Configurações** | Adicionado tela de configurações com Deletar Conta, Notificações e Privacidade. |
| 28/11/2025 | **Refatoração Perfil** | Nova UI premium para a tela de perfil, com header imersivo e novos cards de estatísticas. |
| 01/12/2025 | **Refatoração Visual** | Nova tela de carregamento (LoadingScreen) e menu inferior flutuante (BottomNav). |
| 01/12/2025 | **Correções Visuais** | Gradiente suave nas fotos, indicadores no topo, espaçamento correto do menu e botões. |
| 01/12/2025 | **Nova Paleta de Cores** | Implementada paleta "Modern Cool-Tones" (Azul/Roxo/Laranja) substituindo cores do Brasil. |
| 01/12/2025 | **Refatoração Visual Completa** | Atualizados Profile, LoadingScreen, BottomNav e SwipeCard com glassmorphism e nova paleta. |
| 01/12/2025 | **Bio substituída por Quebra-Gelo** | Onboarding e EditProfile agora pedem "Mensagem de Quebra-Gelo" em vez de Bio. |
| 01/12/2025 | **Envio Automático de Quebra-Gelo** | Ao dar match, a mensagem de quebra-gelo (bio) é enviada automaticamente no chat. |
| 01/12/2025 | **Envio Automático de Quebra-Gelo** | Ao dar match, a mensagem de quebra-gelo (bio) é enviada automaticamente no chat. |
| 01/12/2025 | **Correção BottomNav** | Menu inferior agora usa fundo branco opaco (bg-white/90) para garantir consistência em telas escuras. |
| 01/12/2025 | **Remoção Bio SwipeCard** | Bio removida do card de swipe para manter a privacidade do "Quebra-Gelo". |
| 01/12/2025 | **Refinamentos UI** | Ícones VIP/Gold corrigidos no perfil. Slider de distância mostra "100km+". Highlight dourado condicional no card (Signo/Altura). |
| 02/12/2025 | **Correção Notificações Chat** | Corrigido bug onde usuário recebia notificação da própria mensagem. Adicionado verificação de senderId !== receiverId. |
| 02/12/2025 | **Refatoração VIP/Login** | Telas de VIP e Login atualizadas com identidade visual do Brasil. Adicionado checklist comparativo no VIP. |
| 02/12/2025 | **Novas Funcionalidades VIP** | Adicionado "Modo Incógnito" e "Confirmação de Leitura". Removido "Boost" e "Undo" (não serão implementados agora). |
| 02/12/2025 | **Seleção de Interesses** | Implementado seletor de interesses no Onboarding e EditProfile. Interesses aparecem no card e influenciam compatibilidade. |
| 02/12/2025 | **Novos Interesses** | Atualizada lista de interesses com gírias e categorias divertidas (Quente, Romântico, Social, etc). |
| 02/12/2025 | **Preview de Perfil** | Adicionado botão "Visualizar Perfil Público" para o usuário ver como seu card aparece para os outros. |
| 02/12/2025 | **Estatísticas VIP** | Adicionado cards de "Matches" e "Curtidas" no perfil, exclusivos para usuários VIP. |
| 02/12/2025 | **UI Editar Perfil** | Movida seção de interesses para baixo de detalhes e transformada em modal expansível. |
| 02/12/2025 | **Confirmação de Leitura** | Implementada lógica de marcar mensagens como lidas e atualização em tempo real para o remetente. |
| 02/12/2025 | **Correção RLS Mensagens** | Adicionada política RLS permitindo UPDATE na tabela messages para marcar como lida. |
| 02/12/2025 | **Correção Ícone e CSS** | Ícone do app atualizado (Web e Android) e warnings do Tailwind no VS Code resolvidos. |
| 02/12/2025 | **Correção Perfil no Chat** | "Toque para ver perfil" agora carrega dados completos do banco (interesses, bio, etc) em vez de mock. |
| 02/12/2025 | **Ajuste UI Perfil Chat** | Removidos botões de ação (Like/Pass) ao visualizar perfil de um match e ajustado padding. |
| 02/12/2025 | **Ajuste Cores UI** | Telas de "Zerou o Game", Loading e Erro ajustadas para fundo claro (padrão do app) em vez de preto/azul. |
| 02/12/2025 | **Ajuste Login** | Tela de Login com cores mais suaves (pastel) e card de boas-vindas posicionado mais acima. |
| 02/12/2025 | **Logo Login** | Ícone da tela de login atualizado para Coração (igual Loading) e card movido ainda mais para cima (-mt-32). |
| 02/12/2025 | **Ajuste Layout Login** | Conteúdo da tela de login movido consideravelmente para cima (-mt-72 e pt-28) e botão do Google ajustado para não quebrar linha. |
| 02/12/2025 | **Layout Login Final** | Topo da tela de login fixado em 50vh com card subindo -mt-24, garantindo posição elevada em qualquer tela. |
| 02/12/2025 | **Design Login Final** | Cores vibrantes (Esmeralda/Azul), logo branco com ícone Teal e efeitos de fundo ampliados para maior imersão. |
| 02/12/2025 | **Correção Auth** | Corrigido erro 406 ao logar com novo usuário. Agora o sistema cria o perfil corretamente se não encontrado. |
| 02/12/2025 | **Ajuste Onboarding** | Reordenado campos do Step 1 (Nome primeiro) e atualizado texto do "Quebra-gelo" conforme solicitado. |
| 02/12/2025 | **Ajuste Labels Onboarding** | Alterado "Outro" para "Elu/Delu" e "Ambos" para "Todes" no Step 3 do Onboarding. |

---

## 🔥 Bug Crítico Resolvido: OAuth no Android (28/11/2025)

### Sintoma
Após login com Google no app Android (Capacitor), a sessão era configurada corretamente (`setSession` funcionava), mas qualquer chamada ao banco de dados via cliente Supabase (`supabase.from('profiles')...`) **travava indefinidamente** sem retornar.

### Causa Raiz
O cliente Supabase JS (`@supabase/supabase-js`) tem problemas de sincronização interna no WebView do Android quando executado logo após `setSession()`. As queries HTTP internas do cliente não são disparadas ou ficam pendentes, possivelmente devido a:
- Estado interno do cliente não atualizado a tempo
- Problemas com o storage assíncrono no WebView
- Race condition entre `setSession` e `onAuthStateChange`

### Solução Implementada
**Bypass do cliente Supabase para operações críticas no Android**, usando `fetch()` direto para a API REST do Supabase:

```typescript
// No Android, usar fetch direto passando o accessToken manualmente
const fetchProfileDirect = async (userId: string, accessToken: string) => {
  const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  
  return await response.json()
}
```

### Arquivos Modificados
- `hooks/useAuth.ts` - Refatorado completamente com:
  - `fetchProfileDirect()` - Busca perfil via fetch
  - `createProfileDirect()` - Cria perfil via fetch
  - `loadProfile()` - Usa fetch no Android, cliente Supabase no Web
  - `handleOAuthCallback()` - Processa callback e carrega perfil de forma síncrona

### Como Identificar se o Bug Voltou
Logs mostrarão:
```
[HH:MM:SS] Carregando perfil: XXXXXXXX...
[HH:MM:SS] Usando fetch direto (Android)
[HH:MM:SS] Fetch direto: https://xxx.supabase.co/rest/v1/profiles...
```
Se parar em "Chamando profiles.getById..." sem retornar, o cliente Supabase voltou a travar.

### Prevenção
- **Sempre usar fetch direto** para operações que precisam funcionar imediatamente após OAuth no Android
- O cliente Supabase pode ser usado normalmente **após** o app estar totalmente carregado e a sessão estabilizada

---

## Próximos Passos Sugeridos

1. ~~Configurar Supabase~~ ✅
2. ~~Implementar autenticação~~ ✅
3. ~~Upload de fotos~~ ✅
4. ~~Sistema de match~~ ✅
5. ~~Chat funcional~~ ✅
6. ~~Filtros e Busca~~ ✅
7. ~~Sistema VIP~~ ✅
8. ~~Polimento e UX~~ ✅
9. **Notificações Push** ✅ - FCM v1 com Edge Function
10. **Build Android** - Gerar APK para testes ⬅️ PRÓXIMO

```
