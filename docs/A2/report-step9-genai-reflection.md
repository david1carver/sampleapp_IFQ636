# A2 Step 9 — GenAI Disclosure, Reflection & References

## GenAI disclosure (mandatory)

**Tool(s) used.** Claude (Anthropic), used as a coding assistant and writing/gap-analysis aid during the extension of the project for Assignment 2.

**Tasks the tool was used for.**
- Re-architecting the backend into a layered, object-oriented design and implementing eight design patterns (Singleton, Factory Method, Builder, Repository, Decorator, Facade, Strategy, Observer).
- Scaffolding the new in-app Notifications subsystem (model, repository, factory, observer, service, controller, routes, and the frontend bell).
- Writing and expanding the Mocha/Chai/Sinon unit-test suite and the Test Case matrix.
- Drafting the Postman collection, the SRS, the design-pattern/OOP report section, and the CI/CD runbook.
- Reviewing code against the report claims and the rubric (gap analysis).

**Description of prompts used (representative, paraphrased).**
- "Refactor this Express/Mongoose backend to use Repository, Service/Facade, Strategy, Observer, Factory, Builder, Singleton and Decorator without breaking the existing endpoints or sinon unit tests."
- "Add a notifications feature: model, endpoints, an observer that fires on review events, and a React notification bell that matches the existing Mesa Tailwind tokens."
- "Write unit tests covering create/update/delete/fetch for restaurants, reviews and notifications, and produce a Test Case ID / Expected / Actual table."
- "Generate a Postman collection covering all endpoints including 401/403/404/409/400 error cases."
- "Draft SRS sections 2.1–2.11 and a CI/CD runbook for deploying to EC2 with nginx + pm2."

**Which parts were influenced or generated.** The pattern/service/repository/observer code, the notifications subsystem, the unit tests, and the documentation drafts (SRS, Postman, report §3, CI/CD runbook) were drafted with assistance.

**Verification and adaptation.** Every change was verified against the running implementation: the full unit-test suite (44 tests) was executed and kept green; the React frontend was compiled (`react-scripts build`) to confirm the new component compiles; the app's full module graph was loaded to catch require errors; and the Postman JSON was validated. Architectural choices (which patterns, where) were reviewed for genuine fit rather than accepted blindly, and any code that did not match the report's description was corrected.

> **Team note:** the new GitHub repository, the per-member commit history, the
> two resolved merge conflicts, the live Postman/EC2 screenshots, the video, and
> the Part C declaration are the team's own work and are not AI-generated.

## Reflection

The single biggest lesson from Assignment 2 was how much **design patterns pay off when they are chosen for a real problem rather than added for their own sake.** Refactoring the A1 backend into a Repository + Service (Facade) layering made the controllers trivially thin, and the Observer pattern turned what had been a tangled "do five things after creating a review" function into three small, independently testable observers. When we added the notifications feature, the Open/Closed Principle stopped being an abstract slogan: a new side-effect was literally one new `Observer` subclass and one line in the composition root, with no change to the controller or service.

The steepest difficulties were (1) keeping the existing sinon unit tests green through a deep refactor — solved by ensuring every new layer ultimately bottomed out at the same Mongoose statics the tests stub, and by making the logging Decorator a transparent `Proxy`; and (2) the CI/CD deployment to EC2, where the shared student AWS account's restrictions (no stable Elastic IP, denied Instance Connect) made *stable public exposure* the hardest part of the whole assignment. We learned to separate "the pipeline works" (build + test automate on every push, and the deploy job is correctly configured) from "the host is reachable," and to document the constraint honestly rather than hide it.

If we repeated the project we would stand up the EC2 target and pipeline on day one, and we would write the unit tests alongside each pattern rather than after, since the tests repeatedly caught small regressions during the refactor.

## References (APA) — add to the report's reference list
- Atlassian. (n.d.). *Jira Software documentation*. https://support.atlassian.com/jira-software-cloud/
- Freeman, E., & Robson, E. (2021). *Head First design patterns* (2nd ed.). O'Reilly Media.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- GitHub. (n.d.). *GitHub Actions documentation*. https://docs.github.com/en/actions
- Martin, R. C. (2017). *Clean architecture: A craftsman's guide to software structure and design*. Prentice Hall.
- MongoDB Inc. (n.d.). *Mongoose ODM documentation*. https://mongoosejs.com/docs/
- OpenJS Foundation. (n.d.). *Express.js documentation*. https://expressjs.com/
- Postman Inc. (n.d.). *Postman learning center*. https://learning.postman.com/
