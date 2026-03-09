FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 개발 환경에서는 로컬 볼륨 바인딩을 통해 코드를 마운트하여 실행함
# 로컬에 node_modules가 없을 수 있으므로 항상 컨테이너 기동 시 npm install을 수행하게 함
CMD npm install && npm run dev
