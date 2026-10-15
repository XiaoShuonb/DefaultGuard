#!/usr/bin/env bash
set -euo pipefail
[[ $(id -u) == 0 ]] || { echo 'Run through sudo'; exit 1; }
ARCHIVE=${1:?compiled archive path}
[[ -s "$ARCHIVE" ]] || { echo 'Archive missing'; exit 1; }
BASE=/opt/defaultguard
SITE_DOMAIN=${SITE_DOMAIN:?set SITE_DOMAIN to your Baota site domain}
[[ $SITE_DOMAIN =~ ^[A-Za-z0-9.-]+$ && $SITE_DOMAIN == *.* ]] || { echo "Invalid SITE_DOMAIN"; exit 1; }
SITE=/www/server/panel/vhost/nginx/${SITE_DOMAIN}.conf
NGINX=/www/server/nginx/sbin/nginx
UNIT=/etc/systemd/system/defaultguard.service
ENV=/etc/defaultguard.env
[[ -x "$NGINX" && -f "$SITE" && -f "$ENV" ]] || { echo 'Target site or environment missing'; exit 1; }
node --input-type=module -e 'import {DatabaseSync} from "node:sqlite"; new DatabaseSync(":memory:").close()'
id defaultguard >/dev/null 2>&1 || useradd --system --home-dir /var/lib/defaultguard --shell /usr/sbin/nologin defaultguard
install -d -o defaultguard -g defaultguard -m 700 /var/lib/defaultguard
install -d -m 755 "$BASE/releases"
PREVIOUS=$(readlink -f "$BASE/current" 2>/dev/null || true)
RELEASE="$BASE/releases/$(date +%Y%m%d-%H%M%S)-$$"
TEMP=$(mktemp -d /run/defaultguard-install.XXXXXX)
cp -a "$SITE" "$TEMP/site.conf"
[[ ! -f "$UNIT" ]] || cp -a "$UNIT" "$TEMP/service"
COMMITTED=0
cleanup() {
  if [[ $COMMITTED -ne 1 ]]; then
    cp -a "$TEMP/site.conf" "$SITE"
    if [[ -f "$TEMP/service" ]]; then cp -a "$TEMP/service" "$UNIT"; else unlink "$UNIT" 2>/dev/null || true; fi
    if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
      ln -sfn "$PREVIOUS" "$BASE/current"
    else
      unlink "$BASE/current" 2>/dev/null || true
    fi
    systemctl daemon-reload || true
    [[ -z "$PREVIOUS" ]] || systemctl restart defaultguard.service || true
    "$NGINX" -t >/dev/null 2>&1 && "$NGINX" -s reload || true
    python3 - "$RELEASE" <<'PY'
import pathlib,shutil,sys
p=pathlib.Path(sys.argv[1])
if p.is_dir() and p.parent==pathlib.Path('/opt/defaultguard/releases'):shutil.rmtree(p)
PY
  fi
  python3 - "$TEMP" <<'PY'
import pathlib,shutil,sys
p=pathlib.Path(sys.argv[1])
if p.is_dir() and p.parent==pathlib.Path('/run'):shutil.rmtree(p)
PY
}
trap cleanup EXIT
install -d -m 755 "$RELEASE"
python3 - "$ARCHIVE" "$RELEASE" <<'PY'
import sys,tarfile,pathlib
with tarfile.open(sys.argv[1]) as archive:
 for item in archive.getmembers():
  path=pathlib.PurePosixPath(item.name)
  if path.is_absolute() or '..' in path.parts or not (item.isfile() or item.isdir()):
   raise SystemExit('Invalid archive entry')
 archive.extractall(sys.argv[2])
PY
[[ -f "$RELEASE/web/dist/index.html" && -f "$RELEASE/src/main.js" ]] || { echo 'Incomplete release'; exit 1; }
node --check "$RELEASE/src/main.js"
node --check "$RELEASE/src/bot.js"
node --check "$RELEASE/src/server.js"
find "$RELEASE" -type d -exec chmod 755 {} +
find "$RELEASE" -type f -exec chmod 644 {} +
ln -sfn "$RELEASE" "$BASE/current"
install -m 644 "$RELEASE/deploy/defaultguard.service" "$UNIT"
sed "s/__DOMAIN__/${SITE_DOMAIN}/g" "$RELEASE/deploy/site.conf" > "$SITE"
chmod 644 "$SITE"
"$NGINX" -t
systemctl daemon-reload
systemctl enable defaultguard.service
systemctl restart defaultguard.service
"$NGINX" -s reload
sleep 3
systemctl is-active --quiet defaultguard.service
COMMITTED=1
# Keep only the active DefaultGuard release; no retained installer backups.
python3 - "$RELEASE" <<'PY'
import pathlib,shutil,sys
root=pathlib.Path('/opt/defaultguard/releases')
keep=pathlib.Path(sys.argv[1])
for item in root.iterdir():
 if item!=keep and item.is_dir() and not item.is_symlink():shutil.rmtree(item)
PY
printf 'Active release: %s\n' "$RELEASE"
