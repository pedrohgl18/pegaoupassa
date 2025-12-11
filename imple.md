# ðŸ“‹ ImplementaÃ§Ãµes - Pega ou Passa

> **âš ï¸� ESTE ARQUIVO Ã‰ A FONTE DA VERDADE DO PROJETO**
> Sempre manter atualizado quando funcionalidades forem adicionadas, modificadas ou removidas.

**Ãšltima atualizaÃ§Ã£o**: 28/11/2025

---

## Legenda de Status

- âœ… ConcluÃ­do
- ðŸš§ Em desenvolvimento
- â�³ Pendente
- â�Œ Removido/Cancelado

---

## 1. AutenticaÃ§Ã£o e UsuÃ¡rios

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Tela de login | âœ… | Visual implementado |
| Login com Google | âœ… | Integrado com Supabase Auth |
| App Icon | âœ… | Novo Ã­cone SVG/PNG gerado para Android |
| Login com Facebook | â�³ | Precisa integrar Supabase Auth |
| Logout funcional | âœ… | Implementado |
| SessÃ£o persistente | âœ… | Supabase Auth |
| RecuperaÃ§Ã£o de senha | â�³ | Se usar email/senha |
| Hook useAuth | âœ… | hooks/useAuth.ts |
| Loading inicial | âœ… | Tela de carregamento |

---

## 2. Onboarding (Cadastro)

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Tela de bio | âœ… | Implementado |
| Campo de nome | âœ… | Adicionado ao step 1 |
| Data de nascimento | âœ… | Implementado |
| SeleÃ§Ã£o de gÃªnero | âœ… | Implementado |
| PreferÃªncia de gÃªnero | âœ… | Implementado |
| Salvar no banco | âœ… | Integrado com Supabase |
| Upload de fotos | âœ… | Step 2 - Supabase Storage |
| ValidaÃ§Ã£o de idade (18+) | â�³ | Precisa implementar |
| Barra de progresso | âœ… | 4 steps |
| SeleÃ§Ã£o de interesses/tags | âœ… | Implementado (Onboarding + EditProfile) |
| PersistÃªncia de progresso | âœ… | Salva cada step no banco |
| Retomar onboarding | âœ… | Continua de onde parou |
| Calculo automÃ¡tico de signo | âœ… | Baseado na data de nascimento |
| Campo de Altura | âœ… | Adicionado ao step 3 |
| Limite de caracteres (Bio) | âœ… | Max 500 chars com contador |

---

## 3. Perfil do UsuÃ¡rio

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| VisualizaÃ§Ã£o de perfil | âœ… | Visual bÃ¡sico implementado |
#### Perfil (`components/Profile.tsx`)
- Visualização do próprio perfil.
- Edição básica (leva para `EditProfile`).
- Acesso a Configurações (Menu dedicado).
- Status "Modo Agora" (Vibe) com indicador Violeta.
- Preview do perfil (como os outros veem).

#### Editar Perfil (`components/EditProfile.tsx`)
- Upload de fotos (Drag & Drop).
- Edição de bio, trabalho, escola.
- Seleção de Interesses.

#### Chats (`components/ChatList.tsx`, `components/ChatScreen.tsx`)
- Lista de matches e conversas.
- Chat em tempo real (Supabase Realtime).
- Recibos de leitura (azul para lido).
- Bloqueio e Denúncia de usuários (Menu "kebab").
| Foto do Google | âœ… | Exibe avatar do Google |
| Nome do usuÃ¡rio | âœ… | Exibe nome do perfil/Google |
| EdiÃ§Ã£o de bio | âœ… | Implementado em EditProfile |
| EdiÃ§Ã£o de fotos | âœ… | Adicionar/Remover fotos |
| MÃºltiplas fotos (galeria) | âœ… | Suporte a 6 fotos |
| InformaÃ§Ãµes extras | âœ… | ProfissÃ£o, altura, escolaridade, signo |
| VerificaÃ§Ã£o de perfil | â³ | Selfie com gesto |
| EstatÃ­sticas do perfil | âœ… | Likes recebidos, matches (VIP Only) |
| Visualizar como pÃºblico | âœ… | Ver como os outros veem seu perfil |

---

## 4. Tela Home (Feed de Swipe)

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Card de perfil | âœ… | Visual implementado |
| Swipe vertical | âœ… | Baixo = curtir, Cima = passar |
| AnimaÃ§Ã£o de swipe | âœ… | BÃ¡sica implementada |
| AnimaÃ§Ã£o 3D de swipe | âœ… | RotaÃ§Ã£o e escala com perspective |
| Feedback visual (coraÃ§Ã£o/X) | âœ… | Mostrar Ã­cone ao arrastar |
| Indicador de direÃ§Ã£o | â³ | Texto explicativo para novos usuÃ¡rios |
| Galeria de fotos no card | âœ… | NavegaÃ§Ã£o por toque esq/dir |
| InformaÃ§Ãµes completas | âœ… | DistÃ¢ncia, online, interesses em comum |
| Compatibilidade por signo | âœ… | Badge mostrando % e texto |
| BotÃµes de aÃ§Ã£o | âœ… | BotÃµes flutuantes implementados |
| BotÃ£o voltar (rewind) | â³ | Desfazer Ãºltimo swipe |
| Super Like | â³ | Curtida especial |
| Tela "sem mais perfis" | âœ… | Estado vazio implementado |
| Loading skeleton | âœ… | Loader implementado |

---

## 5. Sistema de Match

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Registrar likes | âœ… | Salva no banco via API |
| Registrar passes | âœ… | Salva no banco via API |
| Detectar match mÃºtuo | âœ… | Retornado pela API de swipe |
| Tela "It's a Match!" | âœ… | Modal implementado |
| NotificaÃ§Ã£o de match | â³ | Push notification |
| Lista de matches | âœ… | Visual implementado no chat |
| Desfazer Match (Unmatch) | âœ… | Remove match e recicla perfil |

---

## 6. Chat e Mensagens

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Lista de conversas | âœ… | Visual implementado |
| SeÃ§Ã£o de novos matches | âœ… | Visual implementado |
| Tela de conversa | âœ… | Abrir chat individual |
| Enviar mensagem | âœ… | Input e envio |
| Receber mensagem | âœ… | Real-time com Supabase |
| Preview Ãºltima mensagem | âœ… | Na lista de conversas (Realtime) |
| Timestamp | âœ… | HorÃ¡rio das mensagens |
| Indicador online/offline | âœ… | Bolinha verde e status "Online agora" |
| Indicador "digitando..." | âœ… | Real-time Presence |
| Mensagem lida (ticks) | â³ | ConfirmaÃ§Ã£o de leitura |
| Envio de fotos | âœ… | VIP Only - Supabase Storage |
| Envio de Ã¡udio | âœ… | VIP Only - GravaÃ§Ã£o e envio |
| Envio de GIFs | â³ | IntegraÃ§Ã£o GIPHY |
| ReaÃ§Ãµes em mensagens | âœ… | â¤ï¸ ðŸ˜‚ ðŸ˜® ðŸ˜¢ ðŸ‘ - Long press |
| Responder mensagem | âœ… | Quote/Reply - Long press |
| Apagar mensagem | âœ… | Deletar para todos (prÃ³prias msgs) |
| Toast notifications | âœ… | Feedback in-app para aÃ§Ãµes |

---

## 7. Filtros e Busca

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Filtro de distÃ¢ncia | âœ… | Funcional com slider |
| Filtro de idade | âœ… | Funcional com sliders duplos |
| Filtro de gÃªnero | âœ… | Funcional |
| GeolocalizaÃ§Ã£o real | âœ… | API de GPS integrada |
| Filtros avanÃ§ados | âœ… | Altura e Signo implementados |
| Aplicar filtros na busca | âœ… | Query no banco com Haversine |

---

## 8. Sistema VIP/Premium

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Tela VIP | âœ… | Visual implementado |
| Limite de likes (free) | âœ… | 30/dia implementado |
| Likes ilimitados (VIP) | âœ… | LÃ³gica implementada |
| Ver quem curtiu vocÃª | âœ… | Lista com blur (free) e visÃ­vel (VIP) |
| Visualizar perfil de quem curtiu (VIP) | âœ… | Modal para decidir like/pass |
| Boost de perfil | ðŸš§ | DB pronto, falta UI (R$1.99/30min) |
| Rewind ilimitado | â³ | Voltar perfis |
| Leitura de recibos | â³ | Ver se leu mensagem |
| Modo viagem | â³ | Mudar localizaÃ§Ã£o |
| IntegraÃ§Ã£o pagamento | â³ | Google Play Billing |

---

## 8.1 Sistema de DenÃºncias

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Tabela reports | âœ… | Criada em tabelas.sql |
| API de denÃºncia | âœ… | reports.create() em supabase.ts |
| Modal de denÃºncia | âœ… | No chat com motivos predefinidos |
| Bloquear usuÃ¡rio | âœ… | JÃ¡ existente (bloqueio mÃºtuo) |

---

## 9. NotificaÃ§Ãµes

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Push notifications | âœ… | Firebase FCM + Capacitor + Edge Function |
| NotificaÃ§Ã£o de match | âœ… | Via cÃ³digo (swipes.create) |
| NotificaÃ§Ã£o de mensagem | âœ… | Via cÃ³digo (ChatScreen.handleSend) |
| NotificaÃ§Ã£o de like | âœ… | Implementado (swipes.create) |
| ConfiguraÃ§Ãµes de notificaÃ§Ã£o | âœ… | Canais Android (Msg, Match, Like) e Agrupamento |

---

## 10. UX e Interface

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| NavegaÃ§Ã£o por abas | âœ… | Bottom navigation |
| Tema cores do Brasil | âœ… | Verde, amarelo, azul |
| Responsividade | âœ… | BÃ¡sica implementada |
| AnimaÃ§Ãµes de transiÃ§Ã£o | âœ… | Entre telas (Fade, Slide) |
| Loading states | âœ… | Spinners, skeletons |
| Estados vazios | âœ… | Telas sem conteÃºdo |
| Modo escuro | â³ | Tema dark |
| Acessibilidade (ARIA) | â³ | Leitores de tela |
| Tutorial primeiro uso | âœ… | Explicar swipe |

---

## 11. TÃ©cnico/Infraestrutura

| Funcionalidade | Status | ObservaÃ§Ãµes |
|----------------|--------|-------------|
| Configurar Supabase | âœ… | Projeto criado, tabelas executadas |
| VariÃ¡veis de ambiente | âœ… | .env configurado |
| Supabase Auth | âœ… | Cliente configurado em lib/supabase.ts |
| Supabase Database | âœ… | PostgreSQL com todas as tabelas |
| Supabase Storage | âœ… | Bucket "photos" criado |
| Supabase Realtime | âœ… | Configurado para mensagens |
| Types do banco | âœ… | types/database.ts criado |
| PWA | â³ | Progressive Web App |
| Capacitor Android | âœ… | Configurado com FCM |
| Supabase Edge Functions | âœ… | send-push-notification criada |
| 27/11/2025 | CriaÃ§Ã£o do arquivo com levantamento inicial |
| 27/11/2025 | Supabase configurado: tabelas, storage, cliente JS, types |
| 27/11/2025 | AutenticaÃ§Ã£o Google implementada com hook useAuth |
| 27/11/2025 | Corrigido RLS policies - login funcionando 100% |
| 27/11/2025 | Upload de fotos no onboarding implementado |
| 27/11/2025 | Onboarding persistente | Salva progresso por step, retoma de onde parou |
| 28/11/2025 | **CORREÃ‡ÃƒO CRÃTICA** | **Causa**: `useAuth` recarregava perfil em loop. **SoluÃ§Ã£o**: Add `isSameUser` check. |
| 28/11/2025 | **Novos Campos** | Adicionado escolaridade (dropdown), profissÃ£o, altura e signo no perfil e galeria. |
| 28/11/2025 | **Sistema VIP** | Implementado visualizador de perfil para "Quem curtiu vocÃª" (VIP). |
| 28/11/2025 | **Polimento e UX** | Adicionado animaÃ§Ãµes globais, Skeleton Loading, feedback visual de swipe (drag) e partÃ­culas no Match. |
| 28/11/2025 | **Push Notifications** | FCM v1 + Capacitor + Edge Function + Triggers automÃ¡ticos no banco |
| 28/11/2025 | **CorreÃ§Ã£o Login** | Corrigido imagem quebrada do Google e layout do botÃ£o em telas pequenas. |
| 28/11/2025 | **Build & Sync** | Executado `npm run build` e `npx cap sync` para atualizar projeto Android. |
| 28/11/2025 | **CorreÃ§Ã£o Layout** | App agora usa Flexbox para garantir que o menu inferior sempre apareÃ§a. |
| 28/11/2025 | **CorreÃ§Ã£o Login** | Adicionado timeout e reset de loading para evitar travamento no login Google. |
| 28/11/2025 | **ðŸ”¥ BUG CRÃTICO ANDROID - OAuth** | SessÃ£o nÃ£o era reconhecida apÃ³s login Google. Ver seÃ§Ã£o abaixo. |
| 28/11/2025 | **CorreÃ§Ã£o Ãudio/Encoding** | Corrigido caracteres corrompidos em alertas e adicionado permissÃ£o de microfone no AndroidManifest. |
| 28/11/2025 | **CorreÃ§Ã£o Upload Fotos** | Alterado para usar URL assinada (signedUrl) em vez de URL pÃºblica, pois o bucket Ã© privado. |
| 28/11/2025 | **Menu ConfiguraÃ§Ãµes** | Adicionado tela de configuraÃ§Ãµes com Deletar Conta, NotificaÃ§Ãµes e Privacidade. |
| 28/11/2025 | **RefatoraÃ§Ã£o Perfil** | Nova UI premium para a tela de perfil, com header imersivo e novos cards de estatÃ­sticas. |
| 01/12/2025 | **RefatoraÃ§Ã£o Visual** | Nova tela de carregamento (LoadingScreen) e menu inferior flutuante (BottomNav). |
| 01/12/2025 | **CorreÃ§Ãµes Visuais** | Gradiente suave nas fotos, indicadores no topo, espaÃ§amento correto do menu e botÃµes. |
| 01/12/2025 | **Nova Paleta de Cores** | Implementada paleta "Modern Cool-Tones" (Azul/Roxo/Laranja) substituindo cores do Brasil. |
| 01/12/2025 | **RefatoraÃ§Ã£o Visual Completa** | Atualizados Profile, LoadingScreen, BottomNav e SwipeCard com glassmorphism e nova paleta. |
| 01/12/2025 | **Bio substituÃ­da por Quebra-Gelo** | Onboarding e EditProfile agora pedem "Mensagem de Quebra-Gelo" em vez de Bio. |
| 01/12/2025 | **Envio AutomÃ¡tico de Quebra-Gelo** | Ao dar match, a mensagem de quebra-gelo (bio) Ã© enviada automaticamente no chat. |
| 01/12/2025 | **Envio AutomÃ¡tico de Quebra-Gelo** | Ao dar match, a mensagem de quebra-gelo (bio) Ã© enviada automaticamente no chat. |
| 01/12/2025 | **CorreÃ§Ã£o BottomNav** | Menu inferior agora usa fundo branco opaco (bg-white/90) para garantir consistÃªncia em telas escuras. |
| 01/12/2025 | **RemoÃ§Ã£o Bio SwipeCard** | Bio removida do card de swipe para manter a privacidade do "Quebra-Gelo". |
| 01/12/2025 | **Refinamentos UI** | Ãcones VIP/Gold corrigidos no perfil. Slider de distÃ¢ncia mostra "100km+". Highlight dourado condicional no card (Signo/Altura). |
| 02/12/2025 | **CorreÃ§Ã£o NotificaÃ§Ãµes Chat** | Corrigido bug onde usuÃ¡rio recebia notificaÃ§Ã£o da prÃ³pria mensagem. Adicionado verificaÃ§Ã£o de senderId !== receiverId. |
| 02/12/2025 | **RefatoraÃ§Ã£o VIP/Login** | Telas de VIP e Login atualizadas com identidade visual do Brasil. Adicionado checklist comparativo no VIP. |
| 02/12/2025 | **Novas Funcionalidades VIP** | Adicionado "Modo IncÃ³gnito" e "ConfirmaÃ§Ã£o de Leitura". Removido "Boost" e "Undo" (nÃ£o serÃ£o implementados agora). |
| 02/12/2025 | **SeleÃ§Ã£o de Interesses** | Implementado seletor de interesses no Onboarding e EditProfile. Interesses aparecem no card e influenciam compatibilidade. |
| 02/12/2025 | **Novos Interesses** | Atualizada lista de interesses com gÃ­rias e categorias divertidas (Quente, RomÃ¢ntico, Social, etc). |
| 02/12/2025 | **Preview de Perfil** | Adicionado botÃ£o "Visualizar Perfil PÃºblico" para o usuÃ¡rio ver como seu card aparece para os outros. |
| 02/12/2025 | **EstatÃ­sticas VIP** | Adicionado cards de "Matches" e "Curtidas" no perfil, exclusivos para usuÃ¡rios VIP. |
| 02/12/2025 | **UI Editar Perfil** | Movida seÃ§Ã£o de interesses para baixo de detalhes e transformada em modal expansÃ­vel. |
| 02/12/2025 | **ConfirmaÃ§Ã£o de Leitura** | Implementada lÃ³gica de marcar mensagens como lidas e atualizaÃ§Ã£o em tempo real para o remetente. |
| 02/12/2025 | **CorreÃ§Ã£o RLS Mensagens** | Adicionada polÃ­tica RLS permitindo UPDATE na tabela messages para marcar como lida. |
| 02/12/2025 | **CorreÃ§Ã£o Ãcone e CSS** | Ãcone do app atualizado (Web e Android) e warnings do Tailwind no VS Code resolvidos. |
| 02/12/2025 | **CorreÃ§Ã£o Perfil no Chat** | "Toque para ver perfil" agora carrega dados completos do banco (interesses, bio, etc) em vez de mock. |
| 02/12/2025 | **Ajuste UI Perfil Chat** | Removidos botÃµes de aÃ§Ã£o (Like/Pass) ao visualizar perfil de um match e ajustado padding. |
| 02/12/2025 | **Ajuste Cores UI** | Telas de "Zerou o Game", Loading e Erro ajustadas para fundo claro (padrÃ£o do app) em vez de preto/azul. |
| 02/12/2025 | **Ajuste Login** | Tela de Login com cores mais suaves (pastel) e card de boas-vindas posicionado mais acima. |
| 02/12/2025 | **Logo Login** | Ãcone da tela de login atualizado para CoraÃ§Ã£o (igual Loading) e card movido ainda mais para cima (-mt-32). |
| 02/12/2025 | **Ajuste Layout Login** | ConteÃºdo da tela de login movido consideravelmente para cima (-mt-72 e pt-28) e botÃ£o do Google ajustado para nÃ£o quebrar linha. |
| 02/12/2025 | **Layout Login Final** | Topo da tela de login fixado em 50vh com card subindo -mt-24, garantindo posiÃ§Ã£o elevada em qualquer tela. |
| 02/12/2025 | **Design Login Final** | Cores vibrantes (Esmeralda/Azul), logo branco com Ã­cone Teal e efeitos de fundo ampliados para maior imersÃ£o. |
| 02/12/2025 | **CorreÃ§Ã£o Auth** | Corrigido erro 406 ao logar com novo usuÃ¡rio. Agora o sistema cria o perfil corretamente se nÃ£o encontrado. |
| 02/12/2025 | **Ajuste Onboarding** | Reordenado campos do Step 1 (Nome primeiro) e atualizado texto do "Quebra-gelo" conforme solicitado. |
| 02/12/2025 | **Ajuste Labels Onboarding** | Alterado "Outro" para "Elu/Delu" e "Ambos" para "Todes" no Step 3 do Onboarding. |
| 02/12/2025 | **CorreÃ§Ã£o Ãcone APK** | Removida pasta `mipmap-anydpi-v26` para forÃ§ar o uso dos Ã­cones PNG gerados e corrigir o Ã­cone padrÃ£o no Android. |
| 02/12/2025 | **SeguranÃ§a Database** | Corrigido warnings do Linter: search_path mutÃ¡vel em funÃ§Ãµes e RLS forÃ§ado em todas as tabelas. |
| 02/12/2025 | **RevisÃ£o de SeguranÃ§a** | Scan de cÃ³digo: XSS/SQLi limpos. Adicionado funÃ§Ã£o RPC `increment_like_count` faltante em `tabelas.sql`. |
| 02/12/2025 | **ProteÃ§Ã£o de Dados** | Criado Trigger `protect_profile_fields` para impedir alteraÃ§Ã£o de VIP/Likes via API e Policy de DELETE para conta. |
| 02/12/2025 | **CorreÃ§Ã£o RLS Interesses** | Adicionadas policies faltantes para `interests` (leitura pÃºblica) e `user_interests` (gestÃ£o pelo usuÃ¡rio). |

---

## ðŸ”¥ Bug CrÃ­tico Resolvido: OAuth no Android (28/11/2025)

### Sintoma
ApÃ³s login com Google no app Android (Capacitor), a sessÃ£o era configurada corretamente (`setSession` funcionava), mas qualquer chamada ao banco de dados via cliente Supabase (`supabase.from('profiles')...`) **travava indefinidamente** sem retornar.

### Causa Raiz
O cliente Supabase JS (`@supabase/supabase-js`) tem problemas de sincronizaÃ§Ã£o interna no WebView do Android quando executado logo apÃ³s `setSession()`. As queries HTTP internas do cliente nÃ£o sÃ£o disparadas ou ficam pendentes, possivelmente devido a:
- Estado interno do cliente nÃ£o atualizado a tempo
- Problemas com o storage assÃ­ncrono no WebView
- Race condition entre `setSession` e `onAuthStateChange`

### SoluÃ§Ã£o Implementada
**Bypass do cliente Supabase para operaÃ§Ãµes crÃ­ticas no Android**, usando `fetch()` direto para a API REST do Supabase:

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
  - `handleOAuthCallback()` - Processa callback e carrega perfil de forma sÃ­ncrona
### 3. Design System
- **Cores**:
    - Principal: Verde Brasil (`bg-green-500`, `text-green-600`) - Ações positivas, likes.
    - Secundária: Amarelo Brasil (`bg-yellow-400`, `text-yellow-500`) - Destaques, VIP.
    - Terciária: Azul Brasil (`bg-blue-600`, `text-blue-700`) - Informações, branding.
    - Vibe/Ativo: Violeta (`bg-violet-600`, `text-violet-600`) - Indicadores de pulso ("Modo Agora") e bordas ativas.
- **Tipografia**:
    - Fonte: System UI (clean).
    - Títulos: Bold/Black, textos curtos.
- **Componentes**:
    - Botões: Redondos ou com border-radius grande (`rounded-full`, `rounded-2xl`).
    - Cards: Com sombra suave (`shadow-sm`, `shadow-md`).

### Como Identificar se o Bug Voltou
Logs mostrarÃ£o:
```
[HH:MM:SS] Carregando perfil: XXXXXXXX...
[HH:MM:SS] Usando fetch direto (Android)
[HH:MM:SS] Fetch direto: https://xxx.supabase.co/rest/v1/profiles...
```
Se parar em "Chamando profiles.getById..." sem retornar, o cliente Supabase voltou a travar.

### PrevenÃ§Ã£o
- **Sempre usar fetch direto** para operaÃ§Ãµes que precisam funcionar imediatamente apÃ³s OAuth no Android
- O cliente Supabase pode ser usado normalmente **apÃ³s** o app estar totalmente carregado e a sessÃ£o estabilizada

---

## PrÃ³ximos Passos Sugeridos

1. ~~Configurar Supabase~~ âœ…
2. ~~Implementar autenticaÃ§Ã£o~~ âœ…
3. ~~Upload de fotos~~ âœ…
4. ~~Sistema de match~~ âœ…
5. ~~Chat funcional~~ âœ…
6. ~~Filtros e Busca~~ âœ…
7. ~~Sistema VIP~~ âœ…
8. ~~Polimento e UX~~ âœ…
9. **NotificaÃ§Ãµes Push** âœ… - FCM v1 com Edge Function
10. **Build Android** - Gerar APK para testes â¬…ï¸� PRÃ“XIMO

```
| 10/12/2025 | **UX - Flip Card** | Interação de tap-to-flip melhorada, layout do verso ajustado (Nome > Fotos), contador de likes oculto no verso. |
| 10/12/2025 | **UX - Flip Card Layout** | Ajuste de grid para Profissão/Escolaridade (largura total) para evitar overflow. |
| 10/12/2025 | **Onboarding V2** | Tema atualizado para Light/Violet. Adicionado Profissão e Escolaridade no Step 3. |
| 10/12/2025 | **VIP V2** | Tela VIP atualizada para Violet/Purple. Adicionado "Modo Agora Ilimitado" na lista. |
| 10/12/2025 | **RefatoraÃ§Ã£o Perfil** | Movido Configurações para menu do perfil. Renomeado VIP para "Modo VIP Lendário". |
| 10/12/2025 | **CorreÃ§Ã£o Bugs** | Corrigido erro 400 em "Usuários Bloqueados" (query Supabase) e crash em "Deletar Conta". |
| 10/12/2025 | **Correção Geolocation** | Corrigido loop infinito de permissão no Android e removido conflito com API Web. |
| 10/12/2025 | **Correção Types** | Adicionado campo `neighborhood` em `lib/supabase.ts` para persistir bairro no banco. |
| 10/12/2025 | **API Geolocation** | Integrada API Key da BigDataCloud e melhorada lógica de parsing de endereço (Bairro/Cidade/Estado). |
| 10/12/2025 | **Lógica Geolation** | Adicionado polling (15min), atualização ao retomar app e persistência offline da localização. Parsing refinado para evitar "Região Metropolitana". |
