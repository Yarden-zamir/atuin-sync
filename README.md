# atuin-sync

Private [Atuin](https://atuin.sh/) sync server for encrypted shell history and agent
threads, deployed by [kitshn 2](https://github.com/Yarden-zamir/kitshn) on the
always-on VPS. This repository is public; the service is behind Cloudflare Access
in the owner's **Machines** circle, which permits service tokens without a passkey.
It is never shared with Everyone.

Connect a client using its own kitshn device's Access service token:

```toml
sync_address = "https://atuin.yarden-zamir.com"

[extra_headers]
CF-Access-Client-Id = "<device client ID>"
CF-Access-Client-Secret = "<device client secret>"
```

Keep real credentials out of this repository. The device must belong to a circle
that holds the app. Atuin account registration and authentication are still required.

Pushes to `main` deploy `prod`. The first push needs the repo's **Allow** action on
the kitshn map. `KITSHN_OPEN_REGISTRATION`, a GitHub repository variable, reaches
Compose as `OPEN_REGISTRATION` (K-808). It defaults to `true` for the first account;
after registration, set the variable to `false` and run the deploy workflow again.

The official Atuin `18.24.4` and Alpine socat `1.8.1.3` images are digest-pinned.
Atuin stores SQLite in the `atuin-data` named volume at `/data/atuin.db`.
The socket bridge binds `$KITSHN_SOCKET_DIR/default.sock` (K-607); no host port is
published. Atuin runs as container root to write the fresh volume; the VPS uses
rootless Docker.

kitshn backs up the volume daily to encrypted, deduplicated R2 snapshots (K-1811).
To restore, open this app's card on the [kitshn map](https://kit.yarden-zamir.com),
choose **Backups…**, select a successful run, then **Restore** and confirm its time.
kitshn takes a `before-restore` snapshot, restores the volume, and restarts the app.
To reverse it, restore that `before-restore` run. Allow disk space for a second copy.
See [kitshn's backup and restore rules](https://github.com/Yarden-zamir/kitshn/blob/main/docs/internals/logs-and-backups.md#backups)
(K-1815–K-1820) for the backup key, storage limits and retention.

Record sync uploads pages of 100 encrypted records as one JSON request, with no
byte-based split. Atuin's default per-record limit is 1 GiB, so a page can exceed
Cloudflare's 100 MB request cap. Total database size does not determine request
size; a large record or page may fail with HTTP 413.

MIT licensed.
