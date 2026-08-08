# 🧪 SCHOLAROS — PRODUCTION AUTOMATED TESTING ARCHITECTURE

## 1. Overview & Strategy

ScholarOS employs a **4-Layer Enterprise Automated Testing Architecture** to guarantee absolute functional stability, zero layout overflow, real API data integrity, and cross-device performance.

```
                   PLAYWRIGHT E2E & VISUAL REGRESSION
                       (Desktop & 6 Mobile Viewports)
                                     |
             +-----------------------+-----------------------+
             |                                               |
      VITEST + RTL                                    PYTEST + HTTPX
   (Frontend Components & Stores)                 (FastAPI Async API Specs)
             |                                               |
             +-----------------------+-----------------------+
                                     |
                         AXE-CORE ACCESSIBILITY & 
                          LIGHTHOUSE PERFORMANCE
```

---

## 2. Testing Framework Stack
- **E2E & Visual Regression**: [Playwright](https://playwright.dev/) with multi-browser and multi-viewport engine.
- **Backend API & Async Database**: `pytest`, `pytest-asyncio`, `httpx`, `aiosqlite` isolated test database fixtures.
- **Frontend Components & State**: `Vitest`, `@testing-library/react`, `@testing-library/jest-dom`.
- **Accessibility**: `axe-core` & `@axe-core/playwright`.
- **Performance**: Lighthouse CLI & Chrome DevTools Performance Profiler.

---

## 3. Viewport & Device Testing Matrix

### Desktop Screen Resolutions
- `1366x768` (Standard Laptop)
- `1440x900` (MacBook Air / Pro 14")
- `1920x1080` (Full HD Display)

### Mobile Screen Resolutions
- `320x667` (iPhone SE / Small Android)
- `360x800` (Samsung Galaxy A-series)
- `375x812` (iPhone X / 11 Pro)
- `390x844` (iPhone 12 / 13 / 14)
- `412x915` (Pixel 7 / Samsung S22)
- `430x932` (iPhone 14 Pro Max / 15 Pro Max)

---

## 4. Critical User Journeys Covered
1. **Authentication & Profile**: Registration, Login, Logout, Avatar selection, Academic Profile updates.
2. **Tutor AI Brain**: Workspace initialization, streaming chat, Socratic modes, structured educational cards (`CORE IDEA`, `EXAM FOCUS`, `COMMON MISTAKE`, `TEST YOURSELF`), chat input position above bottom dock.
3. **Knowledge Vault & Notes**: Block-based editor, 4-stage AI note generation pipeline, PDF upload, OCR scanner.
4. **Study Planner & Attendance**: Adaptive timetable generation, missed class threshold calculation.
5. **ScholarConnect**: Friend requests, peer chat, shared study cards, voice lounges.
6. **Academic Memory**: Memory extraction post-session, Memory Inspector & Reset control in Settings.

---

## 5. Automated Layout & Bug Detection Rules
- **Horizontal Overflow**: `scrollWidth <= clientWidth` on `window` and core wrappers.
- **Clipped Content**: `getClientRects()` bounds validation against viewport.
- **Navigation Collisions**: Bottom dock fixed position (`z-50`) must not obscure chat input or page footers.
- **Console & Network Errors**: Zero uncaught JavaScript errors or 500 API responses during test runs.
