Prompt Given: [Create AGENT_WORKFLOW.md in the repo root and act as a Background Audit Logger; append entries silently for major steps or corrections]

Action Taken: [Created AGENT_WORKFLOW.md at the repository root and added this initial acknowledgement entry. Will append entries for completed major steps or corrections per the directive.]

Correction/Validation: [No corrections required; directive acknowledged and accepted.]
---

Prompt Given: [Build src/core/application and src/core/ports for backend; create repository interfaces (IRouteRepository, IComplianceRepository, IBankRepository, IPoolRepository) and implement three use cases (CalculateRouteComparisonUseCase, BankSurplusUseCase, CreatePoolUseCase) with strict Hexagonal separation and no framework imports]

Action Taken: [Created four port interfaces in src/core/ports/ with pure function signatures; implemented three application use cases in src/core/application/ that depend only on ports and domain; added comprehensive unit tests using Jest and mocked repositories for all three use cases; total 10 new files (4 ports, 3 use cases, 3 tests, 1 index.ts for each layer); entire layer has zero framework dependencies and strictly adheres to Hexagonal Architecture constraints.]

Correction/Validation: [No corrections required; all use cases properly injected with port dependencies, all validation logic implemented (aggregate CB >= 0 for pools, CB > 0 for banking, etc.), greedy allocation algorithm for pool deficit-surplus matching included, full test coverage with edge cases.]