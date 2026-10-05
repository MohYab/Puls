# Manual API testing – Puls

Requires the backend running (`npm run dev` in `backend/`) and `jq` installed.

## Seed users

| Email           | Password    | Role   |
| --------------- | ----------- | ------ |
| erik@puls.test  | password123 | DOCTOR |
| admin@puls.test | password123 | ADMIN  |

## Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}'
```

Expected: 200 with `token` and `user` (no `passwordHash`).

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"wrong"}'
```

Expected: 401 `INVALID_CREDENTIALS`.

## Get a token for further requests

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"erik@puls.test","password":"password123"}' | jq -r '.token')
```

## Check current user

```bash
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with `user` (userId, role, doctorId).

```bash
curl http://localhost:3001/api/auth/me
```

Expected: 401 `UNAUTHORIZED`.

## Appointment types (protected)

```bash
curl http://localhost:3001/api/appointment-types -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with 4 appointment types.

```bash
curl http://localhost:3001/api/appointment-types
```

Expected: 401 `UNAUTHORIZED`.
