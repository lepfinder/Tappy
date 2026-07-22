# 1. 使用 Node.js 22 基础镜像
FROM node:22-slim

# 2. 设置工作目录
WORKDIR /app

# 3. 复制依赖文件并安装
COPY package*.json ./
RUN npm ci || npm install

# 4. 复制源码并构建
COPY . .
RUN npm run build

# 5. 显式暴露 8080 端口，并设置环境变量 PORT=8080
EXPOSE 8080
ENV PORT=8080

# 6. 启动服务
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
