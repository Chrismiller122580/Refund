# Admin API Guide

Manage users and API keys for external system integration.

**Auth required:** All endpoints require an authenticated user with `role: "admin"`.

Use cookie login (`POST /api/auth/login`) or an admin API key.

---

## Setup workflow for external systems

1. **Create a service user** (role `user`, not `admin`):

```bash
curl -b cookies.txt -X POST "$BASE_URL/api/admin/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"integration@yourcompany.com","password":"strong-random-password","role":"user"}'
```

2. **Create an API key** for that user:

```bash
curl -b cookies.txt -X POST "$BASE_URL/api/admin/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<service-user-uuid>","name":"CRM Integration"}'
```

Response includes the full `key` — store it immediately. It cannot be retrieved later.

3. **Give the key to the external system** — never share the admin password.

---

## Users

### `GET /api/admin/users`

List all users.

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "integration@yourcompany.com",
      "role": "user",
      "is_active": true,
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

### `POST /api/admin/users`

Create a user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Unique email |
| `password` | string | Yes | Plain-text password (hashed server-side) |
| `role` | string | No | `user` (default) or `admin` |

### `PATCH /api/admin/users/{id}`

Update a user.

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | `user` or `admin` |
| `is_active` | boolean | Set `false` to disable login and API key access |
| `password` | string | New password |

---

## API keys

### `GET /api/admin/api-keys`

List all keys (prefix only — never the full secret).

**Response:**

```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userEmail": "integration@yourcompany.com",
      "name": "CRM Integration",
      "keyPrefix": "rfnd_ab12cd34",
      "createdAt": "2026-07-07T12:00:00.000Z",
      "lastUsedAt": "2026-07-07T14:30:00.000Z",
      "revokedAt": null
    }
  ]
}
```

### `POST /api/admin/api-keys`

Create a key.

| Field | Type | Required |
|-------|------|----------|
| `userId` | string (UUID) | Yes |
| `name` | string | Yes |

**Response (key shown once):**

```json
{
  "apiKey": {
    "id": "uuid",
    "userId": "uuid",
    "name": "CRM Integration",
    "keyPrefix": "rfnd_ab12cd34",
    "createdAt": "2026-07-07T12:00:00.000Z",
    "key": "rfnd_ab12cd34fullsecretvalue..."
  }
}
```

### `DELETE /api/admin/api-keys/{id}`

Revoke a key immediately. Revoked keys return `401` on use.

---

## Security practices

- Create **user**-role service accounts for integrations — avoid admin API keys
- Revoke keys when rotating credentials or decommissioning integrations
- Disable users (`is_active: false`) instead of deleting when offboarding
- The seeded `ADMIN_EMAIL` user is always promoted to `admin` on login/seed
- API keys are stored as bcrypt hashes; only the prefix is listed for identification

---

## Errors

| Status | Meaning |
|--------|---------|
| `401` | Not authenticated |
| `403` | Authenticated but not admin |
| `404` | User or key not found |
| `500` | Server error |