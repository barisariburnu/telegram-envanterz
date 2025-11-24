# 🤖 Telegram Envanter Yönetim Botu | Telegram Inventory Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/barisariburnu/telegram-envanterz?style=social)](https://github.com/barisariburnu/telegram-envanterz)
[![GitHub issues](https://img.shields.io/github/issues/barisariburnu/telegram-envanterz)](https://github.com/barisariburnu/telegram-envanterz/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/barisariburnu/telegram-envanterz/pulls)

[English](#english) | [Türkçe](#turkish)

---

<a name="english"></a>
## 🌍 English

A powerful and user-friendly Telegram bot for inventory management with Supabase database integration. Built with Node.js, this bot allows authorized users to check stock levels and update quantities through an intuitive interface with inline keyboard buttons.

### ✨ Features

- **📊 Real-time Stock Queries**: Check current stock levels instantly
- **➕➖ Quick Inventory Updates**: Add or subtract stock with one-click buttons
- **🔐 User Authorization**: Secure bot access restricted to authorized users only
- **🎯 Intuitive Interface**: Easy-to-use inline keyboard buttons and menus
- **💾 Supabase Integration**: Reliable cloud database storage
- **🐳 Docker Support**: Containerized deployment with auto-restart
- **⚡ Multiple Input Formats**: Support for various product ID formats
- **🔄 Auto-restart**: PM2 and Docker configurations for production reliability

### 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Bot Token (from [BotFather](https://t.me/botfather))
- Supabase account with a project set up
- Docker and Docker Compose (optional, for containerized deployment)

### 🗄️ Database Setup

1. Create a new Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
2. Create a `stock` table with the following schema:

```sql
create table stock (
  id varchar(50) primary key,
  quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. (Optional) Create an `ebujiteri` table for Shopier integration:

```sql
create table ebujiteri (
  id varchar(50) primary key,
  shopier_id varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

4. Add row-level security policies as needed

### 📥 Installation

#### Standard Installation

1. Clone this repository:
```bash
git clone https://github.com/barisariburnu/telegram-envanterz.git
cd telegram-envanterz
```

2. Install dependencies:
```bash
npm install
```

3. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials (or run the setup script):
```bash
node setup.js
```

#### 🐳 Docker Installation

1. Clone this repository
2. Copy `.env.example` to `.env` and configure it
3. Build and start the Docker container:

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### 🚀 Usage

#### Running Locally

1. Start the bot:
```bash
npm start
```

2. For development with auto-restart:
```bash
npm run dev
```

3. Open Telegram and start a conversation with your bot
4. Use `/start` to see the main menu

#### Running with Docker

1. Start the container:
```bash
docker-compose up -d
```

2. Check container logs:
```bash
docker-compose logs -f
```

3. Stop the container:
```bash
docker-compose down
```

### 📱 Available Commands

- `/start` - Show the main menu
- `/help` - Display available commands and usage guide
- `/stock <product_id>` - Check stock level for a specific product
  - Example: `/stock PROD001`
- `/add <product_id> [amount]` - Add stock quantity (default: 1)
  - Example: `/add PROD001 10`
- `/sub <product_id> [amount]` - Subtract stock quantity (default: 1)
  - Example: `/sub PROD001 5`

**Quick Actions:**
- Simply type a product ID to see quick action buttons
- Supported formats: `PRODUCTID`, `AF-PRODUCTID-BTY`, `PRODUCTID-G`

### 🔒 Security

- Only authorized Telegram users (configured in `.env`) can use the bot
- All user inputs are validated to prevent SQL injection
- Supabase API keys are stored securely in `.env` (never commit this file!)
- Row Level Security (RLS) can be configured in Supabase for additional protection

### 🛠️ Development

Project structure:
```
telegram-envanterz/
├── src/
│   ├── index.js         # Main bot entry point
│   ├── auth.js          # Authentication logic
│   ├── commands.js      # Command handlers
│   ├── callbacks.js     # Callback query handlers
│   └── menus.js         # Menu definitions
├── .env.example         # Environment variables template
├── setup.js             # Interactive setup script
├── package.json         # Dependencies and scripts
├── Dockerfile           # Docker configuration
└── docker-compose.yml   # Docker Compose configuration
```

### 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 👤 Author

**Barış Arıburnu**
- GitHub: [@barisariburnu](https://github.com/barisariburnu)
- Project Link: [https://github.com/barisariburnu/telegram-envanterz](https://github.com/barisariburnu/telegram-envanterz)

### 🙏 Acknowledgments

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API wrapper
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- All contributors who help improve this project

---

<a name="turkish"></a>
## 🇹🇷 Türkçe

Supabase veritabanı entegrasyonu ile envanter yönetimi için güçlü ve kullanıcı dostu bir Telegram botu. Node.js ile geliştirilmiş bu bot, yetkili kullanıcıların sezgisel satır içi klavye butonları ile stok seviyelerini kontrol etmesine ve miktarları güncellemesine olanak tanır.

### ✨ Özellikler

- **📊 Gerçek Zamanlı Stok Sorguları**: Anlık stok seviyesi kontrolü
- **➕➖ Hızlı Envanter Güncellemeleri**: Tek tıkla stok ekleme/çıkarma
- **🔐 Kullanıcı Yetkilendirme**: Sadece yetkili kullanıcıların erişebildiği güvenli bot
- **🎯 Sezgisel Arayüz**: Kolay kullanımlı satır içi klavye butonları ve menüler
- **💾 Supabase Entegrasyonu**: Güvenilir bulut veritabanı depolama
- **🐳 Docker Desteği**: Otomatik yeniden başlatma ile konteyner dağıtımı
- **⚡ Çoklu Giriş Formatları**: Çeşitli ürün ID formatları desteği
- **🔄 Otomatik Yeniden Başlatma**: Üretim güvenilirliği için PM2 ve Docker yapılandırmaları

### 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Telegram Bot Token ([BotFather](https://t.me/botfather)'dan alınabilir)
- Kurulmuş bir Supabase projesi
- Docker ve Docker Compose (isteğe bağlı, konteyner dağıtımı için)

### 🗄️ Veritabanı Kurulumu

1. [https://app.supabase.io/](https://app.supabase.io/) adresinde yeni bir Supabase projesi oluşturun
2. Aşağıdaki şema ile bir `stock` tablosu oluşturun:

```sql
create table stock (
  id varchar(50) primary key,
  quantity integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

3. (İsteğe bağlı) Shopier entegrasyonu için `ebujiteri` tablosu oluşturun:

```sql
create table ebujiteri (
  id varchar(50) primary key,
  shopier_id varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

4. Gerektiğinde satır düzeyinde güvenlik politikaları ekleyin

### 📥 Kurulum

#### Standart Kurulum

1. Bu depoyu klonlayın:
```bash
git clone https://github.com/barisariburnu/telegram-envanterz.git
cd telegram-envanterz
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

4. `.env` dosyasını kimlik bilgilerinizle düzenleyin (veya kurulum betiğini çalıştırın):
```bash
node setup.js
```

#### 🐳 Docker Kurulumu

1. Bu depoyu klonlayın
2. `.env.example` dosyasını `.env` olarak kopyalayın ve yapılandırın
3. Docker konteynerini oluşturun ve başlatın:

**Windows:**
```bash
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### 🚀 Kullanım

#### Yerel Olarak Çalıştırma

1. Botu başlatın:
```bash
npm start
```

2. Geliştirme için otomatik yeniden başlatma ile:
```bash
npm run dev
```

3. Telegram'ı açın ve botunuzla sohbet başlatın
4. Ana menüyü görmek için `/start` komutunu kullanın

#### Docker ile Çalıştırma

1. Konteyneri başlatın:
```bash
docker-compose up -d
```

2. Konteyner loglarını kontrol edin:
```bash
docker-compose logs -f
```

3. Konteyneri durdurun:
```bash
docker-compose down
```

### 📱 Kullanılabilir Komutlar

- `/start` - Ana menüyü göster
- `/help` - Kullanılabilir komutları ve kullanım kılavuzunu göster
- `/stock <ürün_id>` - Belirli bir ürün için stok seviyesini kontrol et
  - Örnek: `/stock PROD001`
- `/add <ürün_id> [miktar]` - Stok miktarı ekle (varsayılan: 1)
  - Örnek: `/add PROD001 10`
- `/sub <ürün_id> [miktar]` - Stok miktarı çıkar (varsayılan: 1)
  - Örnek: `/sub PROD001 5`

**Hızlı İşlemler:**
- Hızlı işlem butonlarını görmek için sadece ürün ID'sini yazın
- Desteklenen formatlar: `PRODUCTID`, `AF-PRODUCTID-BTY`, `PRODUCTID-G`

### 🔒 Güvenlik

- Sadece yetkili Telegram kullanıcıları (`.env`'de yapılandırılmış) botu kullanabilir
- Tüm kullanıcı girdileri SQL enjeksiyonunu önlemek için doğrulanır
- Supabase API anahtarları `.env` dosyasında güvenle saklanır (bu dosyayı asla commit etmeyin!)
- Ek koruma için Supabase'de Satır Düzeyi Güvenlik (RLS) yapılandırılabilir

### 🛠️ Geliştirme

Proje yapısı:
```
telegram-envanterz/
├── src/
│   ├── index.js         # Ana bot giriş noktası
│   ├── auth.js          # Kimlik doğrulama mantığı
│   ├── commands.js      # Komut işleyicileri
│   ├── callbacks.js     # Callback sorgu işleyicileri
│   └── menus.js         # Menü tanımlamaları
├── .env.example         # Ortam değişkenleri şablonu
├── setup.js             # Etkileşimli kurulum betiği
├── package.json         # Bağımlılıklar ve betikler
├── Dockerfile           # Docker yapılandırması
└── docker-compose.yml   # Docker Compose yapılandırması
```

### 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Davranış kurallarımız ve pull request gönderme süreci hakkında detaylar için lütfen [Katkıda Bulunma Rehberi](CONTRIBUTING.md)'ni okuyun.

### 📝 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

### 👤 Yazar

**Barış Arıburnu**
- GitHub: [@barisariburnu](https://github.com/barisariburnu)
- Proje Linki: [https://github.com/barisariburnu/telegram-envanterz](https://github.com/barisariburnu/telegram-envanterz)

### 🙏 Teşekkürler

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API sarmalayıcısı
- [Supabase](https://supabase.io/) - Açık kaynak Firebase alternatifi
- Bu projeyi geliştirmeye yardımcı olan tüm katkıda bulunanlara

---

## 📸 Screenshots | Ekran Görüntüleri

Coming soon... | Yakında...

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Product categories
- [ ] Low stock alerts
- [ ] Export reports (CSV, Excel)
- [ ] Barcode scanning support
- [ ] Web dashboard
- [ ] Statistics and analytics

---

**⭐ If you find this project useful, please consider giving it a star!**

**⭐ Bu projeyi faydalı bulduysanız, lütfen yıldız vermeyi düşünün!**