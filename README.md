# leadorubSoftware
переписываю бэкенд и фронтенд старой (нерабочей) CRM


# instruction
чтобы задеплоить это приложение нужно сделать сначала:
1) npm run build (сбилдить vite vue часть)  => client/dist  (UPD если изменения только на бэкенде то повтороно npm run build не нужно )
2) docker build -t <login/imageName> .
3) docker push <login/imageName>
4) на сервере спулить имадж docker pull
5) на сервере запустить контенйер docker run -d -p 3000:3000 (порт бэкенда фронт не нужон) --name <containerName> <imageName>