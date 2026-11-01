# atuin-sync

A private [Atuin](https://atuin.sh/) sync server for shell history and agent threads.
[kitshn](https://github.com/Yarden-zamir/kitshn) deploys it on an always-on machine.
Cloudflare Access guards it, so the card stays in a circle and never in Everyone.

The server image comes from the fork [Yarden-zamir/atuin](https://github.com/Yarden-zamir/atuin/tree/yarden).
The fork accepts a full page of thread records in one upload.
Upstream atuin-server answers such a page with 413 ([atuinsh/atuin#2887](https://github.com/atuinsh/atuin/issues/2887) "Sync: Content Too Large").

## Connect a client

The client also comes from the fork, because it reads header values from environment variables.

1. Make a kitshn device token for the machine: `kitshn device-token-add --body '{"name":"atuin <machine>"}'`.
2. Put the token in a circle that holds this card.
3. Export the secret in a file that git ignores: `export ATUIN_CF_ACCESS_CLIENT_SECRET=<secret>`.
4. Add this to the Atuin config:

```toml
sync_address = "https://atuin.yarden-zamir.com"
extra_headers = { "CF-Access-Client-Id" = "<client id>" }
extra_headers_env = { "CF-Access-Client-Secret" = "ATUIN_CF_ACCESS_CLIENT_SECRET" }
```

5. Run `atuin register` for the first machine, else `atuin login`.

## Deploy

- A push to `main` deploys `prod`. The first push needs **Allow** on the kitshn map.
- The GitHub variable `KITSHN_OPEN_REGISTRATION` reaches Compose as `OPEN_REGISTRATION` (K-808).
  It is `true` for the first account. After you register, set it to `false` and deploy again.
- Images are pinned by digest. To update the server, copy the new digest of `ghcr.io/yarden-zamir/atuin-server:yarden`.
- atuin-server listens only on TCP. A socat service bridges `$KITSHN_SOCKET_DIR/default.sock` to it (K-607).
- SQLite lives in the `atuin-data` volume at `/data/atuin.db`.

## Backups

kitshn backs up the volume every day to encrypted R2 snapshots (K-1811).
To restore, open the card on the [kitshn map](https://kit.yarden-zamir.com), choose **Backups…**, then **Restore**.
kitshn takes a `before-restore` snapshot first, so you can undo a restore.
See [backups and restore](https://github.com/Yarden-zamir/kitshn/blob/main/docs/internals/logs-and-backups.md#backups) (K-1815 to K-1820).

## Known limits

- A sync request still passes through Cloudflare, which refuses bodies over 100 MB.
  One page holds 100 records, so a page over 100 MB needs records of about 1 MB each on average.
  Revisit if a sync fails with 413 from Cloudflare.

MIT licensed.
