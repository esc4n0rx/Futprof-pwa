# Settings - Contratos

## POST /settings/password/otp/request
Nao requer login.

Body:
```json
{ "email": "paulo@email.com" }
```

Response 200:
```json
{
  "message": "Se o email existir, o OTP foi enviado.",
  "sent": true,
  "otpPreview": "123456"
}
```

Observacao: `otpPreview` aparece apenas fora de producao (`NODE_ENV != production`).

## POST /settings/password/otp/resend
Nao requer login.

Body:
```json
{ "email": "paulo@email.com" }
```

Response 200 igual ao `/otp/request`.

Erros comuns:
- `OTP_RESEND_RATE_LIMIT` (429)

## POST /settings/password/otp/reset
Nao requer login.

Body:
```json
{
  "email": "paulo@email.com",
  "otp": "123456",
  "newPassword": "novaSenhaSegura"
}
```

Response 200:
```json
{ "reset": true }
```

Erros comuns:
- `OTP_INVALID` (422)

## POST /settings/devices/register
Requer `Authorization: Bearer <accessToken>` e licenca ativa.

Body:
```json
{
  "deviceId": "web-chrome-paulo",
  "deviceName": "Chrome do Paulo",
  "platform": "web",
  "appVersion": "1.2.0"
}
```

Response 201:
```json
{
  "device": {
    "id": "uuid",
    "device_id": "web-chrome-paulo",
    "device_name": "Chrome do Paulo",
    "platform": "web",
    "app_version": "1.2.0",
    "last_seen_at": "ISO",
    "created_at": "ISO",
    "updated_at": "ISO"
  }
}
```

## GET /settings/devices
Requer `Authorization: Bearer <accessToken>` e licenca ativa.

Response 200:
```json
{
  "devices": [
    {
      "id": "uuid",
      "device_id": "web-chrome-paulo",
      "device_name": "Chrome do Paulo",
      "platform": "web",
      "app_version": "1.2.0",
      "last_ip": "::1",
      "last_user_agent": "Mozilla/...",
      "last_seen_at": "ISO",
      "created_at": "ISO",
      "updated_at": "ISO"
    }
  ]
}
```

## DELETE /settings/devices/:deviceId
Requer `Authorization: Bearer <accessToken>` e licenca ativa.

Response 204.
