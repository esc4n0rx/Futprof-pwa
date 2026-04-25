# Account Creation - Contratos

## POST /create-account
Cria conta no site via Playwright e opcionalmente salva no bot.

Body:
```json
{
  "botId": "uuid",
  "saveToBot": true,
  "accountName": "Conta Auto 1",
  "baseUrl": "https://ingressos.flamengo.com.br/",
  "nome": "Nome Completo",
  "cpf": "00000000000",
  "rg": "1234567",
  "data_nasc": "01/01/1990",
  "sexo": "M",
  "email": "gerado@email.com",
  "senha": "Senha@123",
  "cep": "00000000",
  "endereco": "Rua X",
  "numero": 100,
  "bairro": "Centro",
  "cidade": "Rio de Janeiro",
  "estado": "RJ",
  "celular": "21999999999"
}
```

Response 200:
```json
{ "success": true, "email": "gerado@email.com" }
```

Em erro:
```json
{
  "success": false,
  "email": "gerado@email.com",
  "error": "mensagem",
  "screenshotPath": "playwright_create_account_error_...png"
}
```
