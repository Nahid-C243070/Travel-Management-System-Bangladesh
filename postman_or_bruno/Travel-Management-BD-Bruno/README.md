# Travel Management System Bangladesh — Bruno Collection

This is a **native Bruno collection**. Do not use **Import Collection** for this folder.

## Open it in Bruno

1. Extract the ZIP.
2. Open Bruno.
3. Click **Open Collection**.
4. Select the extracted `Travel-Management-BD-Bruno` folder — the folder containing `bruno.json`.
5. At the top-right, select the **Local** environment.

## Before testing

Start XAMPP **MySQL**, then start the backend from the project folder:

```bash
npm run dev
```

The API should be available at `http://localhost:5000`.

## First three tests

Run these in order:

1. `01 Health / Health Check` — expected `200`.
2. `02 Authentication / Login User` — expected `200`; saves tokens.
3. `02 Authentication / Current Profile` — expected `200`; confirms bearer authentication.

## Recommended order

Run user endpoints after `Login User`. Before admin endpoints, run `Login Admin` because it replaces the active access token with an admin token.

The green **Tests** section confirms status and `success: true`.
