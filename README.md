# Запуск и остановка

Нужен работающий Docker Desktop. Команды выполняются из корня репозитория.

```powershell
docker compose up --build -d --wait
```

Сайт: http://localhost:8088. Локальный администратор: `admin` / `123`.

Остановка с сохранением данных:

```powershell
docker compose stop
```

Повторный запуск:

```powershell
docker compose start
```

Удаление контейнеров с сохранением базы:

```powershell
docker compose down
```
