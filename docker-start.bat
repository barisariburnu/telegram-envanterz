@echo off
echo Telegram Inventory Bot baslatiliyor...
docker-compose up -d

echo Bot baslatildi! Loglari kontrol etmek icin:
echo docker-compose logs -f