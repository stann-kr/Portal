#!/bin/bash

# Stann Lumo Portal - Dev Helper Script

case "$1" in
  "dev")
    echo "🚀 Starting Next.js Dev Server..."
    # 기존 컨테이너 종료 후 재기동 (포트 충돌 방지)
    docker compose down 2>/dev/null || true
    docker compose up
    ;;
  "migrate")
    echo "🌀 Applying D1 Local Migrations..."
    docker compose run --rm web npm run db:migrate
    ;;
  "studio")
    echo "📊 Opening Drizzle Studio..."
    docker compose run --rm -p 4983:4983 web npm run db:studio
    ;;
  "build")
    echo "🏗️ Building for Cloudflare Pages..."
    docker compose run --rm web npm run build:pages
    ;;
  "shell")
    echo "🐚 Opening Container Shell..."
    docker compose run --rm web sh
    ;;
  "seed")
    echo "🌱 Seeding admin user..."
    # wrangler d1 execute를 통해 로컬 D1에 관리자 계정 삽입
    echo "Usage: Run the SQL below via:"
    echo "  docker compose run --rm web npx wrangler d1 execute portal-db --local --command \"INSERT INTO profiles …\""
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker compose logs -f web
    ;;
  *)
    echo "Usage: ./dev.sh [dev|migrate|studio|build|shell|logs]"
    exit 1
    ;;
esac
