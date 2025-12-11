# 🛡️ Pega ou Passa - Site Admin (Painel Administrativo)

> **Documentação de Planejamento**
> Dashboard "God Mode" para monitoramento total do app.
> **Ambiente**: Localhost only (`npm run dev`) - Não exposto na internet.
> **Acesso**: Exclusivo do dono (você).

---

## ⚠️ REGRAS OBRIGATÓRIAS PARA AGENTES DE IA

> [!CAUTION]
> Estas regras DEVEM ser seguidas ao trabalhar no Admin.

1.  **SEMPRE usar o Supabase MCP Server** com `project_id: ardevnlnrorffyhdsytn`.
2.  **SEMPRE verificar o banco ANTES de executar qualquer ação**:
    -   Use `list_tables` para confirmar estrutura.
    -   Use `execute_sql` para inspecionar dados antes de modificar.
3.  **SEMPRE atualizar este documento (`siteadmin.md`)** ao implementar ou modificar funcionalidades do Admin.
4.  **NUNCA executar ações destrutivas** (DELETE, DROP) sem confirmação explícita do desenvolvedor.

---

## 1. Arquitetura e Segurança

### 🔒 Controle de Acesso (Simplificado - Localhost)
Como o painel roda **apenas localmente**, a segurança é simplificada:
1.  **Verificação por Email/ID**: Hardcode do seu email ou `user.id` em uma constante.
    ```typescript
    const ADMIN_EMAIL = 'pedrohgl18@gmail.com';
    const isAdmin = user?.email === ADMIN_EMAIL;
    ```
2.  **Proteção de Rota**: Se `!isAdmin`, redireciona para Home.
3.  **Sem RLS Especial**: Como você já está logado com sua conta, as políticas RLS existentes permitem leitura. Para ações de escrita (ex: dar VIP), usar `service_role` via Edge Function.

### 🚫 Estratégia de Exclusão do APK
1.  **Lazy Loading**: `React.lazy(() => import('./admin/AdminRouter'))`.
2.  **Verificação de Plataforma**: Não renderizar rota `/admin` se `Capacitor.isNativePlatform()`.
3.  **Separação Física (Opcional)**: Criar `admin.html` como entry point separado.

---

## 2. Funcionalidades do Dashboard

### 📊 Dashboard Geral (KPIs)

| Métrica | Query SQL |
|---------|-----------|
| Total de Usuários | `SELECT COUNT(*) FROM profiles WHERE is_active = true` |
| Novos Hoje | `SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE` |
| Novos na Semana | `SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days'` |
| Total de Matches | `SELECT COUNT(*) FROM matches` |
| Total de Swipes | `SELECT COUNT(*) FROM swipes` |
| Likes vs Passes | `SELECT action, COUNT(*) FROM swipes GROUP BY action` |
| Usuários VIP Ativos | `SELECT COUNT(*) FROM profiles WHERE is_vip = true AND vip_expires_at > NOW()` |

### 📈 Métricas de Engajamento

| Métrica | Fórmula/Query |
|---------|---------------|
| Taxa de Match | `(Total Matches * 2) / Total Likes * 100` |
| Onboarding Completo | `SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true` |
| Funil por Step | `SELECT onboarding_step, COUNT(*) FROM profiles GROUP BY onboarding_step` |

### 🌍 Distribuição Geográfica

Visualizar de onde são os usuários, agrupando por localização.

| Filtro | Query SQL |
|--------|-----------|
| Por Estado | `SELECT state, COUNT(*) FROM profiles WHERE state IS NOT NULL GROUP BY state ORDER BY count DESC` |
| Por Cidade | `SELECT city, COUNT(*) FROM profiles WHERE city IS NOT NULL GROUP BY city ORDER BY count DESC` |
| Por Bairro | `SELECT neighborhood, COUNT(*) FROM profiles WHERE neighborhood IS NOT NULL GROUP BY neighborhood ORDER BY count DESC` |
| Top 10 Cidades | `SELECT city, state, COUNT(*) as total FROM profiles WHERE city IS NOT NULL GROUP BY city, state ORDER BY total DESC LIMIT 10` |

### 👥 Gestão de Usuários
-   **Tabela com Busca**: Nome, Email, ID, Status VIP, Cidade/Estado.
-   **Filtros**: Por estado, cidade, VIP, ativo/inativo.
-   **Ações**:
    -   Ver Perfil Completo (Fotos, Bio, Histórico).
    -   Banir/Desbanir.
    -   Dar/Remover VIP (com data de expiração).
    -   Resetar `daily_likes_count`.
    -   Exportar para CSV.

### 🛡️ Moderação
-   **Fila de Denúncias**: Listar da tabela `reports` onde `status = 'pending'`.
-   **Ações**: Ignorar (mudar status) ou Banir usuário.

---

## 3. Monitoramento de Limites do Supabase (Free Tier)

> [!IMPORTANT]
> O plano gratuito do Supabase tem limites. Monitore regularmente para evitar interrupções.

### Limites do Plano Free (Referência)

| Recurso | Limite Free | Como Verificar |
|---------|-------------|----------------|
| **Database Size** | 500 MB | Dashboard Supabase → Settings → Usage |
| **Storage** | 1 GB | Dashboard Supabase → Storage → Overview |
| **Edge Function Invocations** | 500K/mês | Dashboard Supabase → Edge Functions |
| **Realtime Connections** | 200 concurrent | Dashboard Supabase → Realtime |
| **Auth MAUs** | 50K/mês | Dashboard Supabase → Auth → Usage |
| **Bandwidth** | 2 GB/mês | Dashboard Supabase → Settings → Usage |

### Queries de Monitoramento

```sql
-- Tamanho de cada tabela (aproximado)
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Contagem de registros por tabela
SELECT 'profiles' as table_name, COUNT(*) FROM profiles
UNION ALL SELECT 'swipes', COUNT(*) FROM swipes
UNION ALL SELECT 'matches', COUNT(*) FROM matches
UNION ALL SELECT 'messages', COUNT(*) FROM messages
UNION ALL SELECT 'photos', COUNT(*) FROM photos
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;
```

### Alertas de Quota (Implementar no Dashboard)

| Alerta | Condição | Ação Sugerida |
|--------|----------|---------------|
| 🟡 **Warning** | Database > 400 MB | Limpar registros antigos (swipes com action='pass') |
| 🔴 **Critical** | Database > 480 MB | Upgrade imediato ou limpeza agressiva |
| 🟡 **Warning** | Storage > 800 MB | Comprimir imagens ou limitar uploads |
| 🔴 **Critical** | Storage > 950 MB | Bloquear novos uploads |

---

## 4. Logs de Auditoria (Admin Actions)

Toda ação do admin deve ser logada para rastreabilidade.

**Tabela Sugerida**: `admin_logs`
```sql
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,          -- 'ban_user', 'give_vip', 'reset_likes'
    target_user_id UUID,           -- ID do usuário afetado
    metadata JSONB,                -- Dados extras (ex: {"vip_days": 30})
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Estrutura de Pastas

```
src/
├── admin/
│   ├── components/
│   │   ├── StatsCard.tsx
│   │   ├── UsersTable.tsx
│   │   ├── GeoChart.tsx          # Mapa ou gráfico de barras por região
│   │   ├── QuotaMonitor.tsx      # Monitoramento de limites
│   │   └── ReportsQueue.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Geography.tsx         # Página de distribuição geográfica
│   │   └── Reports.tsx
│   ├── hooks/
│   │   ├── useAdminStats.ts
│   │   └── useSupabaseQuota.ts   # Hook para verificar limites
│   └── AdminRouter.tsx
```

---

## 6. Roadmap de Implementação

| Prioridade | Feature | Descrição |
|------------|---------|-----------|
| **P0** | Dashboard KPIs | Cards com números principais |
| **P0** | Lista de Usuários | Tabela com busca e ações básicas |
| **P0** | Dar/Remover VIP | Edge Function `admin-set-vip` |
| **P0** | Monitoramento de Quota | Alertas de limites do Supabase |
| **P1** | Distribuição Geográfica | Gráfico por estado/cidade |
| **P1** | Fila de Denúncias | Ver e resolver reports |
| **P1** | Banir Usuário | Soft delete (is_active = false) |
| **P2** | Gráficos Temporais | Curva de crescimento com `recharts` |
| **P2** | Export CSV | Baixar lista de usuários |
| **P3** | Logs de Auditoria | Tabela `admin_logs` |

---

## 7. Tech Stack do Admin

-   **UI**: Tailwind CSS + shadcn/ui (Tables, Cards, Modals).
-   **Gráficos**: `recharts` (simples e leve).
-   **Data Fetching**: React Query ou SWR (cache e refetch automático).
-   **Backend**: Edge Functions para ações protegidas (service_role).

---

## 8. Alertas Automáticos (Futuro)

| Alerta | Condição |
|--------|----------|
| Usuário Suspeito | > 100 likes em 1 hora |
| Denúncias em Massa | Usuário com 3+ reports em 24h |
| Quota de Storage | Uso > 80% |
| Quota de Database | Uso > 80% |
| App Parado (Edge Functions) | 0 invocações em 24h |

---

**Status**: 📝 Planejamento Completo
**Última Atualização**: 11/12/2025
**Próximo Passo**: Criar pasta `src/admin/` e rota `/admin` com verificação de email.
