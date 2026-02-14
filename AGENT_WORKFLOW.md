Prompt Given: [Create AGENT_WORKFLOW.md in the repo root and act as a Background Audit Logger; append entries silently for major steps or corrections]

Action Taken: [Created AGENT_WORKFLOW.md at the repository root and added this initial acknowledgement entry. Will append entries for completed major steps or corrections per the directive.]

Correction/Validation: [No corrections required; directive acknowledged and accepted.]
---

Prompt Given: [Build src/core/application and src/core/ports for backend; create repository interfaces (IRouteRepository, IComplianceRepository, IBankRepository, IPoolRepository) and implement three use cases (CalculateRouteComparisonUseCase, BankSurplusUseCase, CreatePoolUseCase) with strict Hexagonal separation and no framework imports]

Action Taken: [Created four port interfaces in src/core/ports/ with pure function signatures; implemented three application use cases in src/core/application/ that depend only on ports and domain; added comprehensive unit tests using Jest and mocked repositories for all three use cases; total 10 new files (4 ports, 3 use cases, 3 tests, 1 index.ts for each layer); entire layer has zero framework dependencies and strictly adheres to Hexagonal Architecture constraints.]

Correction/Validation: [No corrections required; all use cases properly injected with port dependencies, all validation logic implemented (aggregate CB >= 0 for pools, CB > 0 for banking, etc.), greedy allocation algorithm for pool deficit-surplus matching included, full test coverage with edge cases.]

---

Prompt Given: [Build src/adapters and src/infrastructure layers: PostgreSQL schema and seed data, db connection utility, concrete repository implementations, and Express HTTP controllers]

Action Taken: [Created schema.sql, seed.sql, and db.ts connection utility. Implemented 4 repository adapters in src/adapters/outbound/postgres/ using the pg package. Created 4 Express HTTP controllers in src/adapters/inbound/http/ to wire up the use cases. Initialized Express server in src/infrastructure/server/index.ts.]

Correction/Validation: [Major correction required. The initial generation claimed success but severely violated the "TS strict mode" requirement, resulting in 139 TypeScript/ESLint errors across the infrastructure layer. The agent used implicit `any` types in Express request handlers, failed to type-cast `catch (error)` blocks, and missed several `@types` imports. I halted all new feature generation and forced the agent to iteratively type-check the repositories and controllers. I manually verified the addition of strict database row typing and explicit Express `Request`/`Response` imports until the compiler was completely clean. This reinforced the need for strict human gating before moving to the frontend.]
---

Prompt Given: [Stop frontend generation. Review and fix TypeScript strict mode violations in src/adapters and src/infrastructure. Currently 139 errors in compiler. Ensure all files pass strict type checking.]

Action Taken: [Systematically reviewed all infrastructure and adapter files. Fixed 4 controllers (RoutesController, ComplianceController, BankingController, PoolsController) by: (1) changing Promise<void> to Promise<Response> on all handler methods; (2) adding explicit type guards with as assertions on req.body and req.params; (3) ensuring all code paths return Response objects. Fixed server/index.ts by adding explicit Request and Response typing to all route handlers and lambda return types. Fixed 4 repository implementations (RouteRepository, ComplianceRepository, BankRepository, PoolRepository) by: (1) replacing generic any types with specific database row interfaces; (2) adding explicit type annotations for all query results; (3) implementing safe null checks and type narrowing. Total: 8 files refactored with strict TypeScript compliance.]

Correction/Validation: [All 139 TypeScript errors resolved. Compiler now clean. All controllers properly typed with Response return values. All database queries strictly typed with explicit row interfaces. All error handling uses proper instanceof checks. No implicit any types remain in adapters or infrastructure layers. Hexagonal Architecture constraints maintained—core layers untouched, only adapter/infrastructure refactored for type safety.]

Prompt Given: [Build the frontend React application with Vite, using strict Hexagonal Architecture for API adapters, application hooks, and Tailwind UI components.]

Action Taken: [Agent successfully generated the Outbound API Ports, HttpApiClient, custom state management hooks (useRoutes, useBanking, usePooling), and the Tailwind UI components. It properly separated UI rendering from state logic.]

Correction/Validation: [Minor scaffolding correction. The agent left a ghost import (`import "./App.css";`) in `App.tsx` from the standard Vite template, causing a compilation crash. I manually removed the unused CSS import and verified that Tailwind directives were correctly localized to `index.css`. The frontend successfully compiled and the UI rendered perfectly after this human intervention.]

Prompt Given: [Run the backend server using `npm run dev` with the AI-generated package.json and tsconfig.json]

Action Taken: [Executed the ts-node-dev script generated by the AI.]

Correction/Validation: [Configuration correction required. The AI incorrectly configured the backend `package.json` with `"type": "module"`, causing a fatal ES Module resolution error with `ts-node-dev`. I diagnosed the ESM vs CommonJS conflict and manually removed the `"type": "module"` declaration to align with the standard Express/TypeScript CommonJS compilation pipeline. Server successfully booted after this fix.]


Prompt Given: [Refactor the broken dark mode into a premium SaaS aesthetic using Tailwind `zinc` palettes, fix the tab UI, and debug the frontend-to-backend API connection issue causing empty tables.]

Action Taken: [Agent rewrote the root layout to properly apply `dark:bg-zinc-950` to the entire screen. Refactored cards with subtle borders (`dark:border-zinc-800`) and refined Lucide icons. Identified and fixed a missing CORS/data-fetching issue in the API client.]

Correction/Validation: [Major UI/UX and Integration correction. The agent's first dark mode attempt failed to paint the root background, resulting in a jarring light/dark mix. I forced a complete aesthetic overhaul to match modern enterprise SaaS standards (Vercel/Linear style). Additionally, I noticed the UI was rendering empty states and directed the agent to debug the `HttpApiClient` and backend CORS configuration to successfully render the seeded PostgreSQL data.]
Prompt Given: [Diagnose and fix the infinite API fetching loop on the frontend, and expose the silent backend controller errors to debug the PostgreSQL connection.]

Action Taken: [Agent refactored the `useEffect` hook in the frontend data-fetching layer, adding missing dependency arrays to prevent the infinite render cycle. Updated backend controller `catch` blocks to surface raw database errors instead of swallowing them. Agent provided SQL migration commands.]

Correction/Validation: [Critical Performance and Database Correction. Upon frontend integration, the application entered an infinite render loop (a common AI-generated React anti-pattern). I immediately halted the server and directed the agent to enforce React hook lifecycle best practices. Simultaneously, I noticed the backend was swallowing database errors. I forced the agent to improve error visibility, which revealed that the PostgreSQL schemas/seeds had not been properly initialized in my local environment. This dual-sided debugging restored system stability.]



Prompt Given: [Refactor the PostgreSQL `db.ts` adapter to use a unified `DATABASE_URL` connection string and enforce SSL configuration for the Neon DB cloud connection.]

Action Taken: [Agent updated the `pg` Pool initialization to consume `process.env.DATABASE_URL` and injected the `ssl: { rejectUnauthorized: false }` configuration object. Added connection lifecycle logging.]

Correction/Validation: [Security and Adapter Optimization. The initial agent-generated database adapter was hardcoded for a local, unencrypted connection using fragmented environment variables. When transitioning to Neon DB, the Node `pg` driver failed to establish a handshake. I directed the agent to modernize the connection pool using a unified URI string and explicitly configured the SSL transport layer, successfully establishing the secure connection to the serverless database.]

Prompt Given: [Refactor React state management to fix frozen controlled inputs in Banking, resolve a fatal runtime crash (White Screen) in Pooling, and fix broken property mapping causing empty Compare tables.]

Action Taken: [Agent updated `<input>` tags with proper `onChange` handlers. Added optional chaining to the Pooling rendering logic to prevent unhandled undefined exceptions. Fixed the object property mapping (`actualIntensity`) from the database to ensure the Compare tab mathematically evaluates and renders the correct route data.]

Correction/Validation: [Critical Frontend State Correction. During integration testing, the application suffered a fatal React crash upon executing a Pool creation, alongside frozen controlled inputs. I diagnosed these as missing `onChange` handlers and unhandled rendering of complex objects. Furthermore, I identified a property mapping mismatch causing the domain math to evaluate against 0.00. I directed the agent to enforce strict state hydration and optional chaining, which successfully restored application interactivity and mathematical accuracy.]



Prompt Given: [Debug the 400 Bad Request ("baseline cannot be zero") on the /calculate endpoint by enforcing strict snake_case to camelCase data mapping in the PostgreSQL repository adapters.]

Action Taken: [Agent refactored `RouteRepository.ts` to map raw SQL `actual_intensity` and `fuel_consumption` columns to their respective TypeScript camelCase properties (`actualIntensity`, `fuelConsumption`) before returning the domain entities.]

Correction/Validation: [Critical Data Boundary Correction. During the Compare math integration, the domain layer correctly rejected a division-by-zero calculation. I diagnosed that the UI was passing a `0` value because the backend repository was leaking database `snake_case` properties into the API response, causing `undefined` evaluations in the React UI. I enforced a strict Data Mapper pattern in the repository adapter to translate SQL rows into pure TypeScript domain objects, unblocking the FuelEU comparison logic.]




Prompt Given: [Synchronize frontend table rendering with the new backend camelCase data contract to resolve 'No data' empty states and disabled buttons.]

Action Taken: [Agent updated the UI component's JSX to specifically target the `route.actualIntensity` property and removed faulty `disabled` conditions on the baseline buttons.]

Correction/Validation: [Frontend Data Contract Sync. After fixing the backend Data Mapper, the frontend UI components were still referencing legacy database column names, resulting in empty states ("No data") on the primary dashboard. I directed the agent to update the React component mapping to strictly consume the standard TypeScript domain interfaces, fully restoring visibility and interactivity to the Routes table.]



Prompt Given: [Enforce explicit floating-point parsing in the PostgreSQL repository mappers to resolve `pg` driver string-serialization quirks.]

Action Taken: [Agent updated the Data Mapper in `RouteRepository.ts` to wrap all numeric database columns (`actual_intensity`, `distance_km`, etc.) in `parseFloat()` before constructing the domain entities.]

Correction/Validation: [Serialization Type Correction. The UI was rendering empty fallback characters ('-') and failing mathematical operations because the Node `pg` driver inherently returns `DECIMAL` columns as strings to preserve precision. By inspecting the raw React console logs, I identified the type mismatch (`"85.500000"`). I directed the agent to enforce explicit type parsing at the repository boundary, ensuring the frontend received pure JavaScript numbers, restoring UI formatting and domain math integrity.]



Prompt Given: [Implement safe rendering fallbacks in `CompareTab.tsx` to prevent `.toFixed()` fatal exceptions, and ensure the calculation payload strictly adheres to the camelCase frontend contract.]

Action Taken: [Agent updated `CompareTab.tsx` to use nullish coalescing operators (`??`) before executing number formatting methods. Refactored the backend comparison use case to strictly return camelCase properties (`percentDifference`, etc.) rather than leaking internal variable names.]

Correction/Validation: [Frontend Resilience and Contract Correction. While the numeric parsing fix succeeded, the UI suffered a fatal crash (`undefined.toFixed`) because the backend domain math payload mismatched the frontend's expected property keys. I directed the agent to immediately implement defensive rendering techniques (safe optional chaining) in the React component to prevent White Screens of Death. Simultaneously, I forced the agent to enforce strict property name contracts in the backend's calculation response, successfully rendering the FuelEU comparison math without crashing.]


Prompt Given: [Manual Intervention: Resolved circular state dependency blocking form submission.]

Action Taken: [Manually audited `BankingTab.tsx` and decoupled the submit button's disabled state from the API response payload. Refactored UI conditional rendering to prevent premature validation warnings.]

Correction/Validation: [React State Loop Correction. The AI implemented a logical Catch-22 where the "Bank Surplus" button was disabled unless a positive compliance balance was present in the component state. However, the balance is only populated post-submission. I manually broke this circular dependency, enabling the initial form submission and delegating validation to the backend domain logic as originally designed.]

Prompt Given: [Generate `ALTER TABLE` migration scripts to expand `NUMERIC` column precision and resolve persistent database overflow exceptions.]

Action Taken: [Agent generated DDL migration scripts upgrading all numeric fields to `NUMERIC(20, 4)`. Executed the migration manually against the Neon PostgreSQL instance via the cloud SQL Editor.]

Correction/Validation: [Production Database Migration. The AI-generated schema utilized severely restrictive numeric bounds (e.g., limiting values to single digits before the decimal), causing immediate overflow exceptions during the Banking math execution. Rather than continuously shrinking test data, I directed the agent to formulate an enterprise-grade schema migration. I executed these `ALTER TABLE` commands directly in the cloud database, permanently unblocking the domain logic and stabilizing the persistence layer.]



Prompt Given: [Enforce camelCase data mapping on the `/banking/bank-surplus` API response payload to resolve `0.00` frontend rendering fallbacks.]

Action Taken: [Agent updated the Banking controller to explicitly map PostgreSQL `snake_case` results to the `camelCase` properties expected by the React state interface.]

Correction/Validation: [API Contract Synchronization. Following a successful database insert, the UI rendered fallback zero values because the API response payload keys did not match the frontend React component's expected properties (`compliance_balance` vs `complianceBalance`). I directed the agent to enforce a strict Data Transfer Object (DTO) mapping at the controller level, ensuring the frontend successfully hydrated and displayed the calculated FuelEU domain metrics.]


Prompt Given: [Explicitly map backend Pooling allocations to `beforeComplianceBalance` and `afterComplianceBalance` to satisfy frontend React interface.]

Action Taken: [Agent updated the API response payload in the Pooling controller to strictly enforce the camelCase naming convention demanded by the React components.]

Correction/Validation: [API Contract Synchronization. The UI was rendering 0.00 for pool allocations because the backend was returning shorthand or snake_case property names (e.g., `beforeBalance`). By inspecting the React source code, I identified the exact expected property keys (`beforeComplianceBalance`, `afterComplianceBalance`). I directed the agent to enforce a strict Data Transfer Object (DTO) mapping, perfectly aligning the backend response with the frontend contract and successfully rendering the final FuelEU pool calculations.]


Prompt Given: [Refactor backend `CreatePoolUseCase` to fetch route data from the PostgreSQL database rather than trusting client-provided compliance balances.]

Action Taken: [Agent updated the pooling domain logic to discard the `complianceBalance: 0` payload from the React frontend. Implemented database queries to retrieve the true `actual_intensity` and `fuel_consumption` for each pooled route, recalculated the true FuelEU domain math on the server, and returned the verified allocations.]

Correction/Validation: [Zero-Trust Architecture Enforcement. During final integration testing, the Pooling tab returned 0.00 for all allocations. By inspecting the raw JSON API response, I determined the backend was blindly processing a hardcoded `0` payload from the UI. Recognizing a critical flaw in Domain-Driven Design, I directed the agent to enforce a zero-trust boundary. The backend now queries the database as the ultimate source of truth, performing the FuelEU mathematical calculations securely on the server.]