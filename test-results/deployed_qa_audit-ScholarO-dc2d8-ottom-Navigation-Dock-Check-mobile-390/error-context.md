# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deployed_qa_audit.spec.ts >> ScholarOS Deployed Live Production E2E QA Audit >> 05: Mobile Layout & Floating Bottom Navigation Dock Check
- Location: e2e\deployed_qa_audit.spec.ts:141:7

# Error details

```
Error: page.goto: Navigation to "https://student-os-ai-yd3a-teal.vercel.app/settings" is interrupted by another navigation to "https://student-os-ai-yd3a-teal.vercel.app/onboarding"
Call log:
  - navigating to "https://student-os-ai-yd3a-teal.vercel.app/settings", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e3]:
    - generic [ref=f1e4]:
      - generic [ref=f1e17]:
        - heading "Scholar AI Onboarding" [level=1] [ref=f1e18]
        - paragraph [ref=f1e21]: Step-by-step academic setup powered by Groq Llama 3.3 70B
      - generic [ref=f1e22]: AI Memory Active ⚡
    - generic [ref=f1e24]: "Vanakkam! 🎓 Welcome to ScholarOS. I'm Scholar, your AI academic companion. To tailor your AI memory system, study schedules, and exam score predictions, I'll ask you 5 quick questions: 1️⃣ **Full Name**: How would you like me to address you?"
    - generic [ref=f1e38]:
      - button "Amirthavarsshan" [ref=f1e39] [cursor=pointer]
      - button "Priya Raman" [ref=f1e40] [cursor=pointer]
      - button "Rahul Sharma" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e43]:
      - textbox "Type your answer here..." [ref=f1e44]
      - button [disabled] [ref=f1e45]
  - alert [ref=f1e49]
```

# Test source

```ts
  68  |         password: user.password,
  69  |         full_name: user.fullName,
  70  |         preferred_language: 'en',
  71  |       },
  72  |     });
  73  |     expect(apiRes.status()).toBe(201);
  74  | 
  75  |     // 2. Clear state and perform UI Login
  76  |     await context.clearCookies();
  77  |     await page.goto('/login');
  78  |     await page.evaluate(() => localStorage.clear());
  79  |     await page.waitForLoadState('networkidle');
  80  | 
  81  |     await page.fill('input[type="email"]', user.email);
  82  |     await page.fill('input[type="password"]', user.password);
  83  | 
  84  |     const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
  85  |     await page.locator('button[type="submit"]').first().click();
  86  |     await loginPromise;
  87  | 
  88  |     // Wait for Dashboard / Onboarding
  89  |     await page.waitForURL(/\/(onboarding|tutor|settings|\/)/, { timeout: 15000 });
  90  |     
  91  |     // Token persistence check
  92  |     const token = await page.evaluate(() => localStorage.getItem('access_token'));
  93  |     expect(token).toBeTruthy();
  94  |   });
  95  | 
  96  |   test('04: AI Onboarding Chat Stream Endpoint Test', async ({ page, context }) => {
  97  |     const user = getUniqueUser();
  98  | 
  99  |     // Register User via API
  100 |     await page.request.post('https://student-os-ai.onrender.com/api/v1/auth/register', {
  101 |       data: {
  102 |         email: user.email,
  103 |         password: user.password,
  104 |         full_name: user.fullName,
  105 |         preferred_language: 'en',
  106 |       },
  107 |     });
  108 | 
  109 |     // Login via UI
  110 |     await context.clearCookies();
  111 |     await page.goto('/login');
  112 |     await page.evaluate(() => localStorage.clear());
  113 |     await page.waitForLoadState('networkidle');
  114 | 
  115 |     await page.fill('input[type="email"]', user.email);
  116 |     await page.fill('input[type="password"]', user.password);
  117 |     
  118 |     const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
  119 |     await page.locator('button[type="submit"]').first().click();
  120 |     await loginPromise;
  121 | 
  122 |     await page.waitForURL(/\/(onboarding|tutor|settings|\/)/, { timeout: 15000 });
  123 | 
  124 |     await page.goto('/onboarding');
  125 |     await page.waitForLoadState('networkidle');
  126 | 
  127 |     // Type name answer into chat box
  128 |     const chatInput = page.locator('input[placeholder*="Type your answer"]').first();
  129 |     if (await chatInput.isVisible()) {
  130 |       await chatInput.fill('Amirthavarsshan');
  131 |       const sendBtn = page.locator('form button[type="submit"]').first();
  132 |       await sendBtn.click();
  133 | 
  134 |       // Wait for AI streaming message response
  135 |       await page.waitForTimeout(4000);
  136 |       const userBubble = page.locator('div').filter({ hasText: 'Amirthavarsshan' }).first();
  137 |       await expect(userBubble).toBeVisible();
  138 |     }
  139 |   });
  140 | 
  141 |   test('05: Mobile Layout & Floating Bottom Navigation Dock Check', async ({ page, context, isMobile }) => {
  142 |     if (!isMobile) return;
  143 | 
  144 |     const user = getUniqueUser();
  145 | 
  146 |     // Register & Login to access dashboard layout
  147 |     await page.request.post('https://student-os-ai.onrender.com/api/v1/auth/register', {
  148 |       data: {
  149 |         email: user.email,
  150 |         password: user.password,
  151 |         full_name: user.fullName,
  152 |         preferred_language: 'en',
  153 |       },
  154 |     });
  155 | 
  156 |     await context.clearCookies();
  157 |     await page.goto('/login');
  158 |     await page.evaluate(() => localStorage.clear());
  159 |     await page.waitForLoadState('networkidle');
  160 | 
  161 |     await page.fill('input[type="email"]', user.email);
  162 |     await page.fill('input[type="password"]', user.password);
  163 | 
  164 |     const loginPromise = page.waitForResponse((res) => res.url().includes('/auth/login') && res.status() === 200);
  165 |     await page.locator('button[type="submit"]').first().click();
  166 |     await loginPromise;
  167 | 
> 168 |     await page.goto('/settings');
      |                ^ Error: page.goto: Navigation to "https://student-os-ai-yd3a-teal.vercel.app/settings" is interrupted by another navigation to "https://student-os-ai-yd3a-teal.vercel.app/onboarding"
  169 |     await page.waitForLoadState('networkidle');
  170 | 
  171 |     const bottomDock = page.locator('nav.md\\:hidden');
  172 |     await expect(bottomDock).toBeVisible();
  173 | 
  174 |     // Verify 6 navigation items
  175 |     const dockItems = bottomDock.locator('a');
  176 |     await expect(dockItems).toHaveCount(6);
  177 |   });
  178 | });
  179 | 
```