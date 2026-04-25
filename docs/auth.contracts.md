# Auth - Contratos

## POST /auth/register
Body:
```json
{ "name": "Paulo", "email": "paulo@email.com", "password": "123456" }
```
Response 201:
```json
{
  "user": { "id": "uuid", "name": "Paulo", "email": "paulo@email.com" },
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

## POST /auth/login
Body igual ao register (sem name):
```json
{ "email": "paulo@email.com", "password": "123456" }
```
Response 200 igual ao register.

## POST /auth/refresh
Body:
```json
{ "refreshToken": "jwt" }
```
Response 200: novo par `accessToken` + `refreshToken`.

## POST /auth/logout
Body:
```json
{ "refreshToken": "jwt" }
```
Response 204.

## GET /auth/me
Response 200:
```json
{
  "user": {
    "id": "uuid",
    "name": "Paulo",
    "email": "paulo@email.com",
    "created_at": "ISO",
    "updated_at": "ISO"
  }
}
```
