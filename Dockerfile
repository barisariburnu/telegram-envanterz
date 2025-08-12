FROM node:16-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install --production

# Uygulama kodunu kopyala
COPY . .

# Uygulamayı başlat
CMD ["npm", "start"]