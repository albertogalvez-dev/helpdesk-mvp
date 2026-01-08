# Helpdesk MVP - Audit Report
**Date**: 2026-01-08  
**Phase**: Pre-Demo Polish

## Stack Status

### URLs
| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Running (Vite dev server) |
| Backend API | http://127.0.0.1:18000 | ✅ Running (Docker) |
| API Docs | http://127.0.0.1:18000/docs | ✅ Available |
| Health | http://127.0.0.1:18000/health | ✅ Available |

### Docker Services
- `infra-api-1` - Running
- `infra-worker-1` - Running  
- `infra-postgres-1` - Running
- `infra-redis-1` - Running

### Proxy Configuration
```typescript
// vite.config.ts
proxy: {
    "/api": {
        target: "http://127.0.0.1:18000",
        changeOrigin: true,
    }
}
```
API client uses relative path `/api/v1` which is proxied correctly.

---

## Known Issues (Prior to This Audit)

### P0 - Critical
1. ~~**Login role redirect**: Backend uses lowercase roles (`admin`/`agent`/`customer`) but guards compared uppercase~~ **FIXED in Phase 8**
2. ~~**Reply not refreshing**: Query invalidation was wrong~~ **FIXED in Phase 8**

### P1 - Important  
3. **Design inconsistency**: Some hardcoded colors remain (e.g., `bg-blue-*`)
4. **Agent Console shows "New Ticket"**: Should only be in Portal
5. **Remote support fields**: AnyDesk/TeamViewer fields need DB schema

### P2 - Nice to Have
6. **Empty states**: Could be more polished
7. **Loading skeletons**: Not uniform across pages

---

## What Works ✅
- Login flow (fixed in Phase 8)
- Role-based routing (admin→/agent/inbox, customer→/portal/tickets)
- Ticket list with filters
- Ticket detail with messaging
- Reply functionality (fixed in Phase 8)
- Requester/Company panel (added in Phase 8)
- Admin console basic (Users + Workspace pages)
- Reports page with stats

---

## Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | password123 |
| Agent | agent@acme.com | password123 |
| Customer | customer@acme.com | password123 |

---

## Next Steps
1. Phase 1: Verify login fully works (no stuck state)
2. Phase 2: Remove "New Ticket" from Agent Console
3. Phase 3: Unify all colors to design tokens
4. Phase 4-7: Polish details
