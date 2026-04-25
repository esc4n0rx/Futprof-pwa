# Push Notifications (OneSignal) - Contratos + Fluxo Frontend

## Visao geral
Backend envia push para eventos criticos usando OneSignal e `external_id = user.id`.

Eventos push automaticos:
- `SECTOR_OPENED`
- `PURCHASE_SUCCESS`
- `ACCOUNT_CART_FULL`
- `CART_FULL`

## Requisitos
- Backend com `ONESIGNAL_APP_ID` e `ONESIGNAL_REST_API_KEY` configurados.
- Frontend PWA em HTTPS.
- iOS/iPadOS: app precisa estar instalada na Home Screen para receber web push.

## Integração com o OneSignal

<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "5ec91da1-6687-437b-bce9-145c66d9c445",
    });
  });
</script>



## GET /push/config
Requer `Authorization: Bearer <accessToken>` e licenca ativa.

Response 200:
```json
{
  "push": {
    "provider": "onesignal",
    "enabled": true,
    "appId": "uuid",
    "externalUserId": "uuid-do-usuario-logado"
  }
}
```

## POST /push/test
Requer `Authorization: Bearer <accessToken>` e licenca ativa.

Body (opcional):
```json
{
  "title": "Teste",
  "body": "Mensagem de teste",
  "url": "https://app.seudominio.com/cart"
}
```

Response 200:
```json
{
  "sent": true,
  "id": "onesignal-message-id"
}
```

Response quando OneSignal nao esta configurado:
```json
{ "sent": false, "reason": "ONESIGNAL_NOT_CONFIGURED" }
```

## Fluxo de implementacao no Frontend
1. Ap�s login, chamar `GET /api/push/config`.
2. Se `push.enabled=false`, nao inicializar OneSignal.
3. Inicializar SDK web do OneSignal com `appId` retornado.
4. Chamar `OneSignal.login(externalUserId)` com o valor de `push.externalUserId`.
5. Exibir CTA para habilitar notificacoes e solicitar permissao via gesto do usuario.
6. Opcional: chamar `POST /api/push/test` para validar entrega no dispositivo.

## Exemplo de pseudo-codigo (frontend)
```ts
const cfg = await api.get('/push/config');
if (!cfg.push.enabled || !cfg.push.appId) return;

await OneSignal.init({ appId: cfg.push.appId });
await OneSignal.login(cfg.push.externalUserId);

// Em clique de botao:
await OneSignal.Notifications.requestPermission();
```

## Observacoes iOS PWA
- Suporte a web push em iOS/iPadOS 16.4+.
- Usuario precisa abrir a versao instalada na Home Screen.
- Permissao deve ser pedida apos interacao do usuario.
