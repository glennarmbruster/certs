# Atlas Certification Lab

A static Microsoft certification practice simulator with **2,130 questions, 10 searchable offline study guides and 426 topic entries**. The root dashboard opens all three learning tracks. Everything needed to study is included in the repository.

## Publish to GitHub Pages

1. Extract the ZIP. Upload its contents to the root of the repository you want to publish. The root should contain `index.html`, `sw.js`, `assets/` and the ten exam directories.
2. In the repository, open **Settings → Pages**. Select **Deploy from a branch**, choose your branch and **/(root)**, and save.
3. Visit the published HTTPS address. Wait for **Offline ready** on the first visit. The service worker downloads every exam, question bank, guide and shared asset at once. You can then disconnect and open any exam in the same browser.

The suite works at a repository subpath or a domain root. To run it locally, serve the extracted directory over HTTP. For example, run `python -m http.server 8000` in that directory and open `http://localhost:8000/`. Opening the HTML directly from disk prevents the normal question-fetch and service-worker flows.

## Study modes

- **Practice** supports 10, 20, 40 or all available questions and optional domain filtering. The session uses the available count when a domain has fewer questions. Choosing a single answer grades it immediately. For multi-select items, select the specified number and use **Check answer**. Each answer choice has its own explanation and each question links to the matching guide topic.
- **Timed exam** draws 40 distinct questions and gives you 50 minutes. Navigate with Previous, Next or the question selector. The clock keeps running when you leave or reload. Unanswered questions count as incorrect when the exam ends. Results and explanations become available after submission or expiry.
- **Review** shows your latest misses, saved questions, session scores and accuracy by domain. A correct retry clears a question from the current missed list. Domain accuracy uses all graded attempts, including retries.
- **Study guide** has searchable topic notes and comparison tables. Administrative tracks include command or troubleshooting references. Business and AI tracks include prompt, evaluation and workflow references.

Progress, bookmarks and active sessions are saved in this browser under the deployment path. Clearing site data removes them. External Microsoft reference links require an internet connection.

## Banks

| Track | Exam | Directory | Questions |
|---|---|---|---:|
| Cloud and security | AZ-900 | az-900 | 240 |
| Cloud and security | SC-900 | sc-900 | 180 |
| Cloud and security | AZ-104 | az-104 | 240 |
| Exchange and M365 | EXCHANGE-PRO | exchange-hybrid | 240 |
| Exchange and M365 | SC-300 | sc-300 | 240 |
| Exchange and M365 | MS-102 | ms-102 | 240 |
| AI and Copilot | AB-900 | ab-900 | 180 |
| AI and Copilot | AB-650 | ab-650 | 240 |
| AI and Copilot | AB-730 | ab-730 | 150 |
| AI and Copilot | AI-901 | ai-901 | 180 |

## Blueprint and scoring

Each official exam overview links to its Microsoft Learn study guide and shows the published domain ranges, with the actual number of questions drawn per domain. The simulator uses range midpoints normalized to the exam length, then distributes whole questions using the largest remaining quota. It samples across topics before repeating a topic within a domain where possible. EXCHANGE-PRO uses a custom six-domain messaging administration blueprint.

Simulator scores are rounded from `1,000 × fully correct questions ÷ question count`. Passing requires 700. Multi-select items earn a point for an exact set match. Microsoft uses its own scaled scoring methodology. See [Microsoft's exam scoring explanation](https://learn.microsoft.com/en-us/credentials/certifications/exam-scoring-reports).

The independently authored banks practice recurring concepts through selection, behavior, operational considerations, paired requirements and troubleshooting cases. Related questions deliberately revisit the same concepts. The material is independent practice content and has no Microsoft endorsement or psychometric calibration.

## Editing and verification

Each exam folder contains `index.html`, `guide.html` and `questions.json`. The shared simulator lives in `assets/`. The deployment has no package installation or build step.

Question IDs are stable across attempts. Keep an existing ID associated with its original question when maintaining a bank. `correctAnswers` contains zero-based indices into `options`. The `explanation` object has a summary and an `options` array in the same order as the answer choices. `docTopic` names the study topic and `topicId` resolves to its HTML anchor in the guide.

After editing a bank, guide or application file, run the included checks from the repository root using Node.js 20 or later.

```sh
node tools/validate.cjs
node --test tools/engine.test.cjs tools/offline.test.cjs
node tools/refresh-cache.cjs
```

Commit the refreshed `sw.js` with the changed files. Browsers install the replacement cache as a complete set. Close existing tabs for the site and reopen to activate an installed update.
