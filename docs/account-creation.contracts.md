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
{
  "success": true,
  "email": "gerado@email.com",
  "currentUrl": "https://ingressos.flamengo.com.br/login",
  "savedToBot": true,
  "accountId": "uuid"
}
```

Response 200 quando a conta foi criada no site, mas falhou ao salvar no bot:
```json
{
  "success": true,
  "email": "gerado@email.com",
  "currentUrl": "https://ingressos.flamengo.com.br/login",
  "savedToBot": false,
  "saveError": "mensagem do erro ao salvar no bot"
}
```

Response 200 quando `saveToBot=false`:
```json
{
  "success": true,
  "email": "gerado@email.com",
  "currentUrl": "https://ingressos.flamengo.com.br/login",
  "savedToBot": false
}
```

Em erro:
```json
{
  "success": false,
  "email": "gerado@email.com",
  "error": "mensagem",
  "step": "personal-data",
  "diagnostics": {
    "step": "personal-data",
    "currentUrl": "https://ingressos.flamengo.com.br/register/personal-data",
    "title": "Flamengo",
    "alerts": ["CPF ja cadastrado"],
    "fieldErrors": ["CPF ja cadastrado"],
    "validationMessages": [
      { "name": "email", "message": "Preencha este campo." }
    ]
  },
  "screenshotPath": "playwright_create_account_error_...png"
}
```

Valores possiveis de `step`:
- `personal-data`
- `address`
- `optional-data`
- `final-validation`

Notas:
- `success=true` significa que o cadastro no site foi concluido.
- `savedToBot` indica se a credencial tambem foi salva no bot.
- `diagnostics` traz mensagens visiveis da pagina no momento da falha para o front exibir ou enviar para suporte.
