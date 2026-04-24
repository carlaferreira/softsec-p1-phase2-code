# Project 2 — Auditing a Vulnerable Expense Platform

## Overview

The Expense Reimbursement Platform is a Node.js REST API that lets employees submit expense requests, managers approve them within their department, and finance admins oversee the entire system. It was built under deadline pressure and ships with several security vulnerabilities. Your job is to find them, exploit them, fix them, and document everything.

**This is not a reference implementation.**

---

## Part 1 — Security Audit (60 points)

You must identify and exploit **at least 5 vulnerabilities** in the application. For each vulnerability found:

1. **Identify** the vulnerability type, the file, and the line(s) where it occurs.
2. **Exploit** it: write a working proof-of-concept that demonstrates the attack. A `curl` command, a short script, or server output showing the impact is sufficient.
3. **Fix** it: modify the source code to eliminate the vulnerability without breaking the application's intended behaviour.
4. **Document** it in the report PDF (one entry per vulnerability, format described below).

The vulnerabilities span a range of difficulty. A careful systematic audit (code review plus basic dynamic testing) is required to find all five.

### What to look for

The application contains vulnerabilities in the following categories — you must find instances of each:

- Sensitive data written to application logs
- Sensitive data returned in API responses that should never leave the server
- Broken access control on user registration
- Injection in a search endpoint
- Information leakage in error responses
- Observable differences between server responses that reveal private data

### Report format (Part 1 section)

One entry per vulnerability:

- **Vulnerability:** name or CWE
- **Location:** file and line(s)
- **Description:** what the bug is and why it is dangerous
- **Exploit:** the exact command or code that demonstrates the attack, and the output it produces
- **Fix:** what you changed and why it eliminates the vulnerability

---

## Part 2 — Hardening and Defence (40 points)

After fixing the vulnerabilities you found, implement the following defensive measures:

1. **Input validation on registration** — enforce server-side constraints on all user-supplied fields during account creation. Document which fields you validate and what rules you apply.
2. **Parameterised queries everywhere** — audit the full codebase and ensure no SQL statement is assembled by string concatenation. If you find additional unsafe queries beyond the one in Part 1, document them.
3. **Safe error handling** — update the global error handler so that no internal implementation detail (stack trace, file path, query text) is ever returned to the client. Internal errors must still be logged server-side.
4. **Security report** — include a section in the PDF summarising all changes made in Parts 1 and 2, the threat each change addresses, and any residual risks you were unable to resolve within the scope of this assignment.

---

## Requirements

- **Runtime:** Node.js 20+. Run `npm install` then `npm start` to launch the server on port 3000.
- **Seeding:** Run `npm run seed` to populate the database with test users and sample expenses before testing.
- **Test users:** credentials are listed in `README.md`. Use them to test different roles (employee, manager, finance\_admin).
- **No new dependencies** may be added to `package.json` for Part 1. Part 2 fixes may use standard Node.js APIs and packages already present.
- **All fixes must preserve correct behaviour** — the application must still handle legitimate requests for all three roles correctly after your changes.
- **Submission:** accept the GitHub Classroom assignment at <https://classroom.github.com/a/oKTHZVXJ>. This creates a private repository with the starter code under the course organisation; push all your work there. Use signed commits (`git config commit.gpgsign true`). Tag the commit that completes Part 1 as `part1-done` and the final commit as `final`. The last commit pushed before the deadline is what gets graded — no separate Moodle upload is required.

---

## Deliverables

| Deliverable | Description |
|---|---|
| `report.pdf` | Vulnerability entries (Part 1) + security report (Part 2) |
| Modified source files | All fixes committed with descriptive commit messages |
| Git tags `part1-done` and `final` | Mark completion milestones |

---

## Grading

| Component | Points |
|---|---|
| Each vulnerability correctly identified, exploited, and fixed (×5) | 10 pts each (50 total) |
| `report.pdf` — Part 1 quality and completeness | 10 pts |
| Part 2 hardening implementation | 30 pts |
| `report.pdf` — Part 2 security report | 10 pts |

---

## Notes

- The application intentionally contains only these vulnerabilities; do not spend time looking for issues in dependencies or the OS.
- You are encouraged to use tools seen in the labs (ZAP, curl, static analysis) but all findings must be explained in your own words.
- Fixes that use `// eslint-disable` comments, environment flags, or any other bypass mechanism to silence warnings without addressing the root cause will receive no credit.
