#!/bin/sh
set -e

# 懒猫 bind 的 /lzcapp/var 子目录可能为 root 所有；启动前修正 owner 再降权运行。
for dir in /app/src/data /app/src/data/app-cache; do
  mkdir -p "$dir"
  chown -R nextjs:nodejs "$dir"
done

exec su-exec nextjs:nodejs "$@"
