# Setup – Puls

Tested on Linux, notes for macOS and Windows where they
differ.

## 1. Install the tools

| Tool       | Version                                           | Check            |
| ---------- | ------------------------------------------------- | ---------------- |
| Git        | any recent                                        | `git --version`  |
| Node.js    | 20.19+ (22 LTS recommended, required by Prisma 7) | `node -v`        |
| PostgreSQL | 15 or newer                                       | `psql --version` |
| jq         | optional, for the curl examples                   | `jq --version`   |

- **Node:** use [nvm](https://github.com/nvm-sh/nvm) (`nvm install 22`) or the
  installer from nodejs.org. Package managers sometimes ship an older version.
- **PostgreSQL:** Linux via the package manager (then start the service, e.g.
  `sudo systemctl enable --now postgresql`), macOS via Postgres.app or
  Homebrew, Windows via the installer from postgresql.org.

## 2. Clone the repository

```bash
git clone https://github.com/MohYab/Puls.git
cd Puls
```

## 3. Create the database and user

Open psql as the PostgreSQL superuser:

````bash
sudo -u postgres psql      # Linux
psql postgres              # macOS

Then run (choose your own password):

```sql
CREATE USER puls_user WITH PASSWORD 'change-me' CREATEDB;
CREATE DATABASE puls_dev OWNER puls_user;
\q
````

- `CREATEDB` is needed because `prisma migrate dev` creates a temporary
  "shadow database".
- Making `puls_user` the owner gives it the rights on the `public` schema that
  PostgreSQL 15+ no longer grants by default.

## 4. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://puls_user:change-me@localhost:5432/puls_dev?schema=public"
JWT_SECRET="<a long random string>"
PORT=3001
```

Generate a secret with `openssl rand -base64 32`.

Create the tables, generate the Prisma client and add test data:

```bash
npx prisma migrate deploy   # applies the existing migrations
npx prisma generate         # Prisma 7 does not do this automatically
npx prisma db seed          # fictional test data, can be run again at any time
npm test                    # should be green
npm run dev                 # http://localhost:3001
```

`migrate deploy` only applies migrations that already exist. Use
`npx prisma migrate dev --name <name>` only when you change `schema.prisma`.

**Always run Prisma commands from `backend/`.** From the repo root, `npx`
does not find the local Prisma and offers to install Prisma 8, which does not
work with this project. Answer `n`.

## 5. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend expects the backend at `http://localhost:3001/api`.

## 6. Log in

All test users have the password `password123`: `erik@puls.test`,
`sara@puls.test`, `johan@puls.test` (doctors) and `admin@puls.test`. See the
README for all seed users and scenarios.

## Working on more than one computer

- `git pull` before you start, commit and push before you leave.
- `.env` is not in git. Create it on each computer (step 4).
- The database is not synced between computers. Run `npx prisma db seed`
  after pulling; all test data is recreated relative to today.
- After pulling changes to `schema.prisma`: `npx prisma migrate deploy` and
  `npx prisma generate`, then restart `npm run dev`.
- After pulling changes to `package.json`: `npm install` in that folder.

## Troubleshooting

| Error                                               | Cause                                             | Fix                                                                |
| --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| `role "<your username>" does not exist` (psql)      | psql logs in with your OS user name by default    | `psql -h localhost -U puls_user -d puls_dev`                       |
| `P1010: User was denied access`                     | `DATABASE_URL` is not loaded or password is wrong | Check `backend/.env`, run commands from `backend/`                 |
| `P3014` (shadow database)                           | `puls_user` cannot create databases               | `ALTER USER puls_user CREATEDB;` as superuser                      |
| `permission denied for schema public`               | The database is owned by another user             | Superuser in `puls_dev`: `ALTER SCHEMA public OWNER TO puls_user;` |
| `Need to install the following packages: prisma@8…` | Command run outside `backend/`                    | Answer `n`, `cd backend`, run again                                |
| `Prisma only supports Node.js versions 20.19+…`     | Node is too old                                   | Install Node 22 LTS                                                |
| Cannot find module `../generated/prisma/...`        | Prisma client not generated                       | `npx prisma generate`                                              |
| `EADDRINUSE: :::3001`                               | Backend already running in another terminal       | Stop the other process or change `PORT`                            |
| Login works but pages show 401                      | Token from an old seed (IDs changed)              | Log out and log in again                                           |
| Frontend shows "Failed to fetch"                    | Backend is not running                            | `npm run dev` in `backend/`                                        |
