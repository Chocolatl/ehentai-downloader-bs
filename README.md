这里是[ehentai-downloader](https://github.com/Chocolatl/ehentai-downloader)的B/S端项目仓库

## 开发环境

1. 在`backend`目录下运行`npm start`，程序默认监听`3070`端口

2. 在`frontend`目录下运行`npm start`，程序默认监听`3000`端口

3. 浏览器中访问：<http://localhost:3000>

注：下载文件链接在开发环境服务器中不可用

## 生产环境

1. 在`frontend`目录下运行`npm build`

2. 将`frontend/build`目录中的文件复制到`backend/public`

3. 在`backend`目录下运行`npm start`

4. 浏览器中访问：<http://localhost:3070>