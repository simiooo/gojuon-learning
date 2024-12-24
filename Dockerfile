# 使用官方 Node.js 20 镜像
FROM node:20.18.0 AS builder

# 设置工作目录
WORKDIR /app

# 复制项目的 package.json 和 pnpm-lock.yaml 文件
COPY package.json pnpm-lock.yaml ./

# 更换 npm 源为淘宝源，并安装 pnpm 包管理器
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install -g pnpm@8.13.1

    # 更换 pnpm 的源为淘宝源
RUN pnpm config set registry https://registry.npmmirror.com/
# 安装项目依赖
RUN pnpm install

# 复制项目的所有文件到工作目录
COPY . .

# 编译项目
RUN pnpm build

# 第二阶段：Nginx 部署环境
FROM nginx:latest

COPY --from=builder /app/dist /usr/share/nginx/html

# 配置 Nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]