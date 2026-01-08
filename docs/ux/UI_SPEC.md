# UI Spec - Helpdesk B2B (Garden-inspired)

## Objetivo UI
- Consola enterprise tipo Zendesk Agent Workspace, densa y operativa
- Prioridad en velocidad de lectura y acciones rapidas

## Layout base
- Sidebar izquierda fija con vistas
- Topbar con buscador global y estado del usuario
- Area principal: lista densa + detalle de ticket con paneles

## Pantallas minimas

Customer - Create Ticket
Bloques:
- Header con titulo y breadcrumb
- Formulario central: subject, category, priority, description, attachments
- Sidebar derecha con ayuda y SLA estimado (placeholder)

Customer - Tickets List
Bloques:
- Topbar con busqueda y filtros basicos
- Tabla densa con columnas: id, subject, status, priority, updated_at
- Empty state con CTA "Crear ticket"

Customer - Ticket Detail
Bloques:
- Header con subject y estado
- Timeline de conversacion
- Panel lateral con metadata (estado, prioridad, etiquetas)

Agent - Inbox / Views
Bloques:
- Sidebar con vistas (All, Unassigned, My tickets, Breached SLA)
- Filters bar con chips y dropdowns
- Tabla densa de tickets
- Panel derecho de detalle del ticket

Agent - Ticket Detail
Bloques:
- Thread publico con mensajes y timestamp
- Internal notes panel (privado)
- Panel derecho con campos: status, priority, assignee, tags, SLA badge
- Acciones: reply, add note, resolve

Admin - SLA Policies CRUD
Bloques:
- Lista de politicas con estado y objetivos
- Formulario modal o panel lateral para crear/editar

Admin - Agents Management (placeholder)
Bloques:
- Tabla de agentes con rol y estado
- CTA para invitar agente (placeholder)

Admin - Weekly Reports Dashboard
Bloques:
- KPIs (abiertos, resueltos, breached)
- Grafico de tendencias (placeholder)
- Tabla de top categories

## Componentes y estados
- Table: densidad alta, row height 36-40px, hover, selected, loading
- Filters bar: chips + dropdowns + search; estados active/inactive/disabled
- Status pill: open, pending, solved, closed
- Priority badge: low, normal, high, urgent
- Tag chips: background suave y borde sutil
- SLA badge: met, due-soon, breached
- Message bubble (public): avatar + timestamp
- Internal note card (private): borde lateral y background diferenciado
- Empty states: texto corto + CTA
- Loading states: skeleton rows + panel placeholder
- Toast/alerts: success, warning, danger

## Design tokens (Garden)
Fuente: tokens de Zendesk Garden (open source).
Metodo exacto de extraccion:
1) Clonar repo: https://github.com/zendeskgarden/react-components
2) Abrir `packages/theming/src/elements/palette/index.ts` (exporta `PALETTE`)
3) Extraer los hex desde el objeto y mapearlos a roles UI
4) Comando rapido: `rg "#[0-9A-Fa-f]{3,8}" packages/theming/src/elements/palette/index.ts`
5) Si cambia la ubicacion del archivo: `rg --files -g "*palette*" packages/theming/src`

Tabla de tokens (Garden palette)
| TokenName | Hex | Uso |
| --- | --- | --- |
| palette.grey.100 | #f8f9f9 | bg app |
| palette.grey.200 | #e8eaec | bg surface |
| palette.grey.400 | #b0b8be | border/divider |
| palette.grey.700 | #5c6970 | text body |
| palette.grey.900 | #293239 | text heading |
| palette.blue.600 | #2694d6 | action primary bg |
| palette.blue.700 | #1f73b7 | action primary hover |
| palette.blue.500 | #66a0cd | info/link |
| palette.kale.800 | #16494f | sidebar bg |
| palette.kale.700 | #40787a | sidebar hover |
| palette.kale.100 | #ecf9f9 | chrome highlight |
| palette.green.600 | #26a178 | success bg |
| palette.green.700 | #037f52 | success text |
| palette.yellow.500 | #e38215 | warning bg |
| palette.yellow.600 | #d67305 | warning text |
| palette.red.600 | #eb5c69 | danger bg |
| palette.red.700 | #cd3642 | danger text |

Tipografia:
- IBM Plex Sans como primaria; IBM Plex Mono para IDs/numeros; fallback Noto Sans, sans-serif

Espaciados y densidad:
- Base 4/8px, tabla densa 36-40px row height

Border radius y sombras:
- Radius 4-6px, sombras suaves (1-2 niveles)

## Accesibilidad
- Focus visible en inputs, botones y rows
- Contraste minimo AA en texto y status pills
- Navegacion por teclado en tablas y formularios
- Aria labels en acciones criticas (futuro)

## Principios UX
- Rapidez: listas densas y shortcuts
- Claridad de estados: status, prioridad y SLA visibles
- Feedback inmediato: toast en acciones
- Prevencion de errores: confirmaciones en cambios criticos
