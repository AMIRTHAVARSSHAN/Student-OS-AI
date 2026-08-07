# 📱 ScholarOS Mobile-First UI/UX Redesign & Audit Plan

## 1. Executive Summary & Audit Findings

An in-depth mobile audit across all ScholarOS pages (*Dashboard, Tutor AI Brain, ScholarConnect, Notes Vault, Study Plan, Attendance, Analytics*) revealed desktop layouts being squeezed into mobile viewports (320px - 430px).

### Identified Mobile Bounding & Usability Bugs
| Issue Area | Observed Bug | Root Cause | Solution |
| :--- | :--- | :--- | :--- |
| **Global Layout** | Horizontal scrolling on `body` and page containers | Unconstrained fixed pixel widths (`w-[800px]`, `min-w-[700px]`, `px-6` on narrow screens) | Enforce `overflow-x-hidden`, `w-full`, and `max-w-full` with fluid flex/grid columns |
| **Top Header Bar** | Crowded with buttons (`+`, `Compass`, `Difficulty badge`) | Too many inline items for 360px-430px screens | Simplify mobile top bar to **[Menu] | [Subject/Title] | [Profile/More]**, moving secondary actions into an expandable drawer |
| **Bottom Navigation** | Obscures chat input box & causes overlap | Hardcoded bottom heights without `pb-[safe-area]` & Z-index collision | Redesign floating 6-item dock (`Home`, `Tutor`, `Study Plan`, `Notes`, `Connect`, `Settings`) with `pb-24` viewport padding |
| **Tutor AI Chat UI** | Assistant bubbles 100% wide with scrollbars, input hidden | Unbounded bubble width and missing fixed bottom input positioning | Restructure chat: AI messages **max-w-[90%]**, User messages **max-w-[75%]**, input pinned above bottom navbar with auto-growing textarea |
| **Action Chips** | Action buttons wrap awkwardly across 3 lines | Flex-wrap without horizontal touch snap or sheet | Convert action buttons into a sleek horizontal snap-scroll chip strip with `no-scrollbar` + "More" bottom sheet |
| **Hero & Stat Cards** | Text truncation (*"AI Academic Collaboration En..."*) | `whitespace-nowrap` and missing font size scaling | Implement fluid typography (`text-base sm:text-lg`), line clamping, and 8pt responsive padding system |
| **Scrollbars** | Ugly native browser scrollbars visible on tabs & code | Default browser scrollbars rendered in webkit | Add custom Tailwind utility `.no-scrollbar` to hide scrollbars globally while retaining touch scroll |

---

## 2. 8pt Mobile Grid & Design Tokens

### Spacing Scale (8pt System)
- `xs` (4px / p-1)
- `sm` (8px / p-2)
- `md` (12px / p-3)
- `lg` (16px / p-4)
- `xl` (24px / p-6)

### Responsive Viewport Rules
- **Extra Small (320px - 360px)**: Compact font sizes (`text-[11px]`, `p-3`), 1-column layouts, hidden non-essential icons.
- **Standard Mobile (375px - 430px)**: Fluid card scaling (`w-full`), 8pt padding, 48px minimum touch targets.
- **Tablet / PC (768px+)**: Full multi-column grid layouts with sidebars.

---

## 3. Screen-by-Screen Mobile Redesign Architecture

```mermaid
graph TD
    App[ScholarOS Mobile Shell] --> TopBar[Simplified Mobile Header: Menu | Title | Profile]
    App --> MainView[Scrollable Main Viewport pb-28]
    App --> FloatingNav[Floating Bottom Navigation Bar: Home, Tutor, Study Plan, Notes, Connect, Settings]

    subgraph Mobile Tutor AI Workspace (/tutor)
        ChatHeader[Compact Subject & Difficulty Header]
        ChatStream[AI Max 90% | User Max 75% Bubble Stream]
        ActionChips[Horizontal Scroll Action Chips + More Sheet]
        FixedInputBar[Pinned Auto-Growing Input Bar above Bottom Nav]
    end

    subgraph Mobile ScholarConnect Workspace (/connect)
        ConnectHeader[Fluid Hero Banner - No Truncation]
        ConnectTabs[Horizontal Scroll Chip Control]
        ConnectCards[Vertical Stack Adaptive Cards]
    end

    MainView --> Mobile Tutor AI Workspace
    MainView --> Mobile ScholarConnect Workspace
```

---

## 4. Implementation Checklist & Target Files

1. **Global Utilities & Typography (`frontend/src/app/globals.css`)**:
   - Add `.no-scrollbar` utility and enforce global `overflow-x-hidden` on `html, body`.
2. **Mobile Bottom Navigation & Topbar (`frontend/src/components/dashboard/layout.tsx` & `topbar.tsx`)**:
   - Update 6 bottom tabs (`Home`, `Tutor`, `Study Plan`, `Notes`, `Connect`, `Settings`) with 48px touch targets and safe area padding.
   - Simplify topbar on mobile.
3. **Mobile Tutor AI Workspace (`frontend/src/components/dashboard/tutor/TutorWorkspace.tsx`)**:
   - Pinned input bar above bottom navbar (`bottom-16 md:bottom-0`), max-w 90%/75% message bubbles, hide scrollbars on action chips.
4. **Mobile ScholarConnect Workspace (`frontend/src/components/connect/ConnectShell.tsx` & subcomponents)**:
   - Fix hero card wrapping, vertical stacking for cards, mobile tab controls.
5. **Mobile Notes, Study Plan, Attendance, Analytics Pages**:
   - Audit and apply fluid grid `grid-cols-1 sm:grid-cols-2` and `w-full max-w-full`.

---

## 5. Verification Plan
- Build test: Run `npm run build` in `frontend` directory.
- Test across 320px, 375px, 390px, 412px, 430px, and 768px viewports to verify **zero horizontal scrolling**, **no clipped text**, and **full input visibility**.
