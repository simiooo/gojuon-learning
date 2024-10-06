# 使用官方 Node.js 20 镜像
FROM node:20.18.0

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

# 暴露端口 8081
EXPOSE 8081

# 定义环境变量的默认值，可以在 docker run 时通过 -e 参数覆盖
ENV MONGO_USERNAME=root \
    MONGO_PWD=rootPwd123 \
    MONGO_HOST=localhost:27017 \
    MONGO_DBNAME=japanese_words

# 启动命令
CMD ["pnpm", "start:api"]
