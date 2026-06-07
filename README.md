# Task Manager

Testovaci ukol pro AI, (15:38 se testem funkčnosti)

prompt:
```
Osobní správce úkolů (Task Manager) 
Co by aplikace měla umět (MVP) 

Základní funkce:
Registrace + přihlášení uživatele
Seznam úkolů (tabulka nebo karty):
 - Přidat úkol (název, popis, termín, priorita: Vysoká / Střední / Nízká) 
 - Označit úkol jako hotový/nehotový (s HTMX – bez reloadu stránky) 
 - Editace a smazání úkolu
 - Filtrování (Vše / Hotové / Nehotové / Podle priority)
Jednoduchý dashboard na hlavní stránce:
 - Celkový počet úkolů
 - Počet s blížícím se terminem
 - Rozdělení podle priority

Vytvoř toto v reactu a použí next.js, v backendu použí python a FastAPI, jako databazi Sqlite stačí.
```

Osobni spravce ukolu. Frontend v Next.js (React + TypeScript), backend v Python (FastAPI), data v SQLite.

## Struktura

```
backend/   FastAPI + SQLAlchemy + SQLite
frontend/  Next.js (App Router) + React 18 + TypeScript
```

## Backend - spusteni

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API: `http://localhost:8000` (Swagger docs na `/docs`).

## Frontend - spusteni

```cmd
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`.

`.env.local` uz obsahuje `NEXT_PUBLIC_API_URL=http://localhost:8000`.

## Funkce (MVP)

- Registrace + prihlaseni (JWT)
- Pridat / upravit / smazat ukol (nazev, popis, termin, priorita Vysoka/Stredni/Nizka)
- Oznacit jako hotovy/nehotovy bez reloadu (optimisticke updaty + fetch)
- Filtry: vse / hotove / nehotove + podle priority
- Dashboard: celkem, hotove, nehotove, blizici se termin (do 3 dnu), rozdeleni podle priority

## Pozn. k HTMX

Zadani zminovalo HTMX, ale stack je React/Next.js, takze toggling probiha pres React state + fetch (zadne reloady stranky), coz dava stejny UX jako HTMX.

## API prehled

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/tasks?status=all|done|notdone&priority=Vysoka|Stredni|Nizka
POST   /api/tasks
PATCH  /api/tasks/{id}
POST   /api/tasks/{id}/toggle
DELETE /api/tasks/{id}
GET    /api/tasks/dashboard
```

Vsechny task endpointy vyzaduji `Authorization: Bearer <token>`.
