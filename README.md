# Educator Availability

A Google Apps Script web app that reads educator availability from the event response spreadsheet and displays a selectable Monday-through-Wednesday schedule.

## Spreadsheet connection

The source spreadsheet and tab are configured at the top of `apps-script/Code.gs`:

```js
const SPREADSHEET_ID = "1aFIU2jrwxzmyR5cJxAP0Zx0JJGq66U6mFpFhhAgK9Ac";
const SHEET_ID = 274155366;
```

The first row must contain a name column, an optional email column, and availability columns whose headers include the hourly times from 9 AM through 5 PM. Day answers can contain Monday/Tuesday/Wednesday, June or July 20/21/22, or compact values such as `MTW`.

## Publish updates

The project is connected to Apps Script through `.clasp.json`.

```bash
clasp push
clasp deploy --description "Describe the update"
```

The initial deployment ID is:

```text
AKfycbyNF3YNFsyli-Z7mQDzbubY4bh9AHr_PRNF96vqZNiFOvT_681erQfT9Hm6RhjpSAPY7g
```

After the first deployment, open the Apps Script project and confirm the web app is configured to execute as the deploying user and allow access to anyone. Google may also ask the owner to authorize read access to the spreadsheet. The project editor is:

<https://script.google.com/d/168Qg8QP2ZST5I4_hNPlcXs_K3cGYnIXSW_j6Nqo9-NIBvtXYl8c5hZkv/edit>
