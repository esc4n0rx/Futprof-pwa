# Licenses - Contratos

## GET /licenses/check
Requer `Authorization: Bearer <accessToken>`.

Response 200 (ativa):
```json
{
  "active": true,
  "license": {
    "code": "LIC-AAAA-BBBB-CCCC-DDDD",
    "validDays": 30,
    "activatedAt": "ISO",
    "expiresAt": "ISO"
  }
}
```

Response 200 (sem licenca):
```json
{ "active": false, "reason": "NO_ACTIVE_LICENSE" }
```

Response 200 (expirada):
```json
{ "active": false, "reason": "LICENSE_EXPIRED" }
```

## POST /licenses/activate
Requer `Authorization: Bearer <accessToken>`.

Body:
```json
{ "code": "LIC-AAAA-BBBB-CCCC-DDDD" }
```

Response 200 (ativada):
```json
{
  "activated": true,
  "alreadyActive": false,
  "license": {
    "code": "LIC-AAAA-BBBB-CCCC-DDDD",
    "validDays": 30,
    "activatedAt": "ISO",
    "expiresAt": "ISO"
  }
}
```

Response 200 (idempotente, ja ativa para o usuario):
```json
{
  "activated": false,
  "alreadyActive": true,
  "license": {
    "code": "LIC-AAAA-BBBB-CCCC-DDDD",
    "validDays": 30,
    "activatedAt": "ISO",
    "expiresAt": "ISO"
  }
}
```

Erros comuns:
- `LICENSE_NOT_FOUND` (404)
- `LICENSE_ALREADY_ASSIGNED` (409)
- `USER_ALREADY_HAS_ACTIVE_LICENSE` (409)
- `LICENSE_REVOKED` (409)
- `LICENSE_EXPIRED` (409)
