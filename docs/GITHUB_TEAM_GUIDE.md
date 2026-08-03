# GitHub Team Contribution Guide

The repository is ready to push, but every team member must create real commits from their own GitHub account for contribution evidence.

## Initial repository setup

```bash
git init
git add .
git commit -m "Initial travel management system"
git branch -M main
git remote add origin https://github.com/<organization-or-owner>/<repository>.git
git push -u origin main
```

## Recommended member responsibilities

| Member | Suggested branch | Work area |
|---|---|---|
| Member 1 | `feature/auth-users` | Authentication, logout and users |
| Member 2 | `feature/spots-locations` | Divisions, districts, categories and tourist spots |
| Member 3 | `feature/routes-vehicles` | Smart routing, alternatives and vehicle cost |
| Member 4 | `feature/trips-guides` | Trip planning, guides and bookings |
| Member 5 | `feature/analytics-docs` | Analytics, logging, Postman and report |

## Contribution workflow

Each member should run:

```bash
git checkout main
git pull origin main
git checkout -b feature/<member-task>
```

After making a meaningful change:

```bash
git status
git add <changed-files>
git commit -m "Add <specific feature>"
git push -u origin feature/<member-task>
```

Then create a pull request and merge after review.

## Evidence for project submission

Capture screenshots of:

- GitHub contributors page
- Commit history showing every member
- Pull requests and reviews
- Repository README
- Deployed Render service connected to the repository

Do not manufacture contribution evidence. Each member must push genuine work from their own account.
