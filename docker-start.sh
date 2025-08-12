#!/bin/bash

# Docker container'ı başlat
echo "Telegram Inventory Bot başlatılıyor..."
docker compose up -d

echo "Bot başlatıldı! Logları kontrol etmek için:"
echo "docker compose logs -f"