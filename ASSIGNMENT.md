# Project 2 — Auditing a Vulnerable Expense Platform

## Overview

The Expense Reimbursement Platform is a Node.js REST API that lets employees submit expense requests, managers approve them within their department, and finance admins oversee the entire system. It was built under deadline pressure and ships with several security vulnerabilities. Your job is to find them, exploit them, fix them, and document everything.

**This is not a reference implementation.**

---

## Security Audit

You must identify and exploit **at least 5 vulnerabilities** in the application. For each vulnerability found:

1. **Identify** the vulnerability type, the file, and the line(s) where it occurs.
2. **Exploit** it: write a working proof-of-concept that demonstrates the attack. A `curl` command, a short script, or server output showing the impact is sufficient.
3. **Fix** it: modify the source code to eliminate the vulnerability without breaking the application's intended behaviour.
4. **Document** it in the report PDF (one entry per vulnerability, format described below).

The vulnerabilities span a range of difficulty. A careful, systematic audit (code review plus basic dynamic testing) is required to find all five.

### What to look for

The application contains vulnerabilities in the following categories:

- Sensitive data written to application logs
- Sensitive data returned in API responses that should never leave the server
- Broken access control on user registration
- Injection in a search endpoint
- Information leakage in error responses
- Observable differences between server responses that reveal private data

### Report format

**Per vulnerability** (5 entries):

- **Vulnerability:** Name and CWE identifier
- **OWASP Top 10:** Category (e.g. A03 — Injection)
- **Security requirement:** Affected requirement (R1–R7)
- **Severity:** High / Medium / Low with justification
- **Location:** File and line(s)
- **Description:** What the bug is and why it is dangerous
- **Exploit:** The exact command or code that demonstrates the attack, and the output it produces
- **Fix:** What you changed in the source code and why it eliminates the vulnerability

**Overall security assessment:**

- Summary of the application's security posture: what was done well and what was neglected.
- Analysis of whether the application follows defence-in-depth principles or relies on single points of failure.

**Testing methodology:**

- What tools were used (manual inspection, automated scanners, dynamic testing, etc.).
- How each security requirement (R1–R7) was systematically tested.

---

## Requirements

- **Runtime:** Node.js 20+. Run `npm install` then `npm start` to launch the server on port 3000.
- **Seeding:** Run `npm run seed` to populate the database with test users and sample expenses before testing.
- **Test users:** Credentials are listed in `README.md`. Use them to test different roles (employee, manager, finance\_admin).
- **All fixes must preserve correct behaviour** — the application must still handle legitimate requests for all three roles correctly after your changes.
- **Submission:** accept the GitHub Classroom assignment at <https://classroom.github.com/a/oKTHZVXJ>. This creates a private repository with the starter code under the course organisation; push all your work there. The last commit pushed before the deadline is the one that gets graded.

---

## Deliverables

| Deliverable | Description |
|---|---|
| `report.pdf` | Security audit report (5–8 pages) |
| Modified source files | All implemented fixes committed with descriptive commit messages |
| Git tags `part1-done` and `final` | Mark completion milestones |

---

## Grading

| Component | Points |
|---|---|
| Each vulnerability correctly identified, exploited, and fixed (×5) | 10 pts each (50 total) |
| `report.pdf` — per-vulnerability documentation quality | 20 pts |
| Overall security assessment | 30 pts |

---

## Notes

- Do not spend time looking for issues in dependencies or the OS.
- You are encouraged to use tools seen in the labs (ZAP, curl, static analysis) but all findings must be explained in your own words.
- Fixes that use `// eslint-disable` comments, environment flags, or any other bypass mechanism to silence warnings without addressing the root cause will receive no credit.
