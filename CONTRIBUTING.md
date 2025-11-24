# Contributing to Telegram Inventory Bot

[English](#english) | [Türkçe](#turkish)

---

<a name="english"></a>
## 🌍 English

First off, thank you for considering contributing to the Telegram Inventory Bot! It's people like you that make this bot a great tool for everyone.

### 🤔 Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/barisariburnu/telegram-envanterz/issues) if there's something similar to what you have in mind. If there isn't, feel free to open a new issue!

### 🍴 Fork & create a branch

If this is something you think you can fix or implement, then fork the repository and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```bash
git checkout -b feature/325-add-barcode-support
```

or

```bash
git checkout -b fix/325-stock-update-error
```

### 🔨 Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first.

#### Code Style Guidelines

- Use **meaningful variable and function names**
- Write **comments** for complex logic
- Follow **existing code style** (use 2 spaces for indentation)
- Add **JSDoc comments** for functions
- Keep functions **small and focused** on a single task

#### Example:

```javascript
/**
 * Calculate the new stock quantity after an update
 * @param {number} currentQuantity - Current stock quantity
 * @param {number} updateAmount - Amount to add or subtract
 * @param {string} action - 'add' or 'subtract'
 * @returns {number} - New stock quantity
 */
function calculateNewQuantity(currentQuantity, updateAmount, action) {
  return action === 'add' 
    ? currentQuantity + updateAmount 
    : currentQuantity - updateAmount;
}
```

### ✅ Test your changes

Make sure to test your changes thoroughly:

1. **Manual Testing**: Run the bot locally and test all affected functionality
2. **Edge Cases**: Test with invalid inputs, empty values, etc.
3. **Authorization**: Ensure security features still work correctly
4. **Database**: Verify database operations work as expected

### 📝 Make a Pull Request

At this point, you should switch back to your main branch and make sure it's up to date:

```bash
git checkout main
git pull origin main
```

Then update your feature branch from your local copy of main and push it:

```bash
git checkout feature/325-add-barcode-support
git rebase main
git push --set-upstream origin feature/325-add-barcode-support
```

Finally, go to GitHub and [make a Pull Request](https://github.com/barisariburnu/telegram-envanterz/compare).

#### Pull Request Guidelines

- **Clear title**: Describe what the PR does
- **Description**: Explain the changes and why they're needed
- **Reference issues**: Link to related issues (e.g., "Fixes #325")
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested the changes

### 🔍 Code Review Process

The core team looks at Pull Requests on a regular basis. After feedback has been given, we expect responses within two weeks. After two weeks, we may close the PR if it isn't showing any activity.

### 📋 Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

#### Examples:

```
feat: Add barcode scanning support

Implements barcode scanning using @zxing library.
Fixes #325
```

```
fix: Resolve stock update error for negative values

Previously, the bot allowed negative stock values.
Now it validates and prevents negative quantities.
Fixes #420
```

### 🎯 Types of Contributions

#### 🐛 Report Bugs

Before creating bug reports, please check the existing issues. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed**
- **Explain which behavior you expected to see instead**
- **Include screenshots** if applicable
- **Include your environment details** (Node.js version, OS, etc.)

#### ✨ Suggest Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain the behavior you expected to see**
- **Explain why this enhancement would be useful**

#### 📖 Improve Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or grammatical errors
- Adding missing information
- Improving clarity
- Adding examples
- Translating to other languages

#### 💻 Code Contributions

Look for issues labeled with:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `beginner friendly` - Suitable for beginners

---

<a name="turkish"></a>
## 🇹🇷 Türkçe

Öncelikle, Telegram Envanter Botuna katkıda bulunmayı düşündüğünüz için teşekkür ederiz! Bu botu herkes için harika bir araç yapan sizin gibi insanlardır.

### 🤔 Nereden başlamalıyım?

Bir hata fark ettiyseniz veya bir özellik isteğiniz varsa, aklınızdakine benzer bir şey olup olmadığını görmek için [Issues](https://github.com/barisariburnu/telegram-envanterz/issues) bölümünü kontrol edin. Yoksa, yeni bir issue açmaktan çekinmeyin!

### 🍴 Fork ve branch oluşturma

Bu sizin düzeltebileceğiniz veya uygulayabileceğiniz bir şeyse, depoyu fork edin ve açıklayıcı bir adla branch oluşturun.

İyi bir branch adı şöyle olabilir (#325 üzerinde çalıştığınız ticket olsun):

```bash
git checkout -b feature/325-barkod-destegi-ekle
```

veya

```bash
git checkout -b fix/325-stok-guncelleme-hatasi
```

### 🔨 Düzeltmenizi veya özelliğinizi uygulayın

Bu noktada, değişikliklerinizi yapmaya hazırsınız! Yardım istemekten çekinmeyin; herkes başlangıçta acemidir.

#### Kod Stil Kuralları

- **Anlamlı değişken ve fonksiyon isimleri** kullanın
- Karmaşık mantık için **yorumlar** yazın
- **Mevcut kod stilini** takip edin (girinti için 2 boşluk kullanın)
- Fonksiyonlar için **JSDoc yorumları** ekleyin
- Fonksiyonları **küçük ve tek bir göreve odaklı** tutun

#### Örnek:

```javascript
/**
 * Güncelleme sonrası yeni stok miktarını hesapla
 * @param {number} mevcutMiktar - Mevcut stok miktarı
 * @param {number} guncellemeMiktari - Eklenecek veya çıkarılacak miktar
 * @param {string} islem - 'add' veya 'subtract'
 * @returns {number} - Yeni stok miktarı
 */
function yeniMiktarHesapla(mevcutMiktar, guncellemeMiktari, islem) {
  return islem === 'add' 
    ? mevcutMiktar + guncellemeMiktari 
    : mevcutMiktar - guncellemeMiktari;
}
```

### ✅ Değişikliklerinizi test edin

Değişikliklerinizi kapsamlı şekilde test ettiğinizden emin olun:

1. **Manuel Test**: Botu yerel olarak çalıştırın ve etkilenen tüm işlevleri test edin
2. **Uç Durumlar**: Geçersiz girdiler, boş değerler vb. ile test edin
3. **Yetkilendirme**: Güvenlik özelliklerinin hala doğru çalıştığından emin olun
4. **Veritabanı**: Veritabanı işlemlerinin beklendiği gibi çalıştığını doğrulayın

### 📝 Pull Request oluşturun

Bu noktada, ana dalınıza geri dönmeli ve güncel olduğundan emin olmalısınız:

```bash
git checkout main
git pull origin main
```

Ardından özellik dalınızı yerel main kopyasından güncelleyin ve push edin:

```bash
git checkout feature/325-barkod-destegi-ekle
git rebase main
git push --set-upstream origin feature/325-barkod-destegi-ekle
```

Son olarak, GitHub'a gidin ve [Pull Request oluşturun](https://github.com/barisariburnu/telegram-envanterz/compare).

#### Pull Request Kuralları

- **Net başlık**: PR'nin ne yaptığını açıklayın
- **Açıklama**: Değişiklikleri ve neden gerekli olduklarını açıklayın
- **Issue referansı**: İlgili issue'lara link verin (örn. "Fixes #325")
- **Ekran görüntüleri**: UI değişiklikleri için ekran görüntüleri ekleyin
- **Test**: Değişiklikleri nasıl test ettiğinizi açıklayın

### 🔍 Kod İnceleme Süreci

Çekirdek ekip, Pull Request'leri düzenli olarak inceler. Geri bildirim verildikten sonra, iki hafta içinde yanıt bekliyoruz. İki hafta sonra, herhangi bir aktivite göstermiyorsa PR'yi kapatabiliriz.

### 📋 Commit Mesajı Kuralları

- Şimdiki zaman kullanın ("Özellik ekle" değil "Özellik eklendi")
- Emir kipi kullanın
- İlk satırı 72 karakter veya daha az tutun
- İlk satırdan sonra issue ve pull request'lere bol bol referans verin

#### Örnekler:

```
feat: Barkod okuma desteği ekle

@zxing kütüphanesi kullanarak barkod okuma özelliği uygulandı.
Fixes #325
```

```
fix: Negatif değerler için stok güncelleme hatasını çöz

Önceden bot negatif stok değerlerine izin veriyordu.
Şimdi doğrulama yapıyor ve negatif miktarları engelliyor.
Fixes #420
```

### 🎯 Katkı Türleri

#### 🐛 Hata Bildirme

Hata raporları oluşturmadan önce, lütfen mevcut issue'ları kontrol edin. Bir hata raporu oluştururken, lütfen mümkün olduğunca fazla detay ekleyin:

- **Net ve açıklayıcı bir başlık kullanın**
- **Sorunu yeniden oluşturmak için tam adımları açıklayın**
- **Belirli örnekler sağlayın**
- **Gözlemlediğiniz davranışı açıklayın**
- **Bunun yerine görmeyi beklediğiniz davranışı açıklayın**
- Uygunsa **ekran görüntüleri ekleyin**
- **Ortam detaylarınızı dahil edin** (Node.js sürümü, OS, vb.)

#### ✨ Geliştirme Önerileri

Geliştirme önerileri GitHub issue'ları olarak takip edilir. Bir geliştirme önerisi oluştururken, lütfen şunları ekleyin:

- **Net ve açıklayıcı bir başlık kullanın**
- Önerilen geliştirmenin **adım adım açıklamasını** sağlayın
- Adımları göstermek için **belirli örnekler** sağlayın
- **Mevcut davranışı açıklayın** ve **görmeyi beklediğiniz davranışı açıklayın**
- Bu geliştirmenin neden **yararlı olacağını açıklayın**

#### 📖 Dokümantasyon İyileştirmeleri

Dokümantasyon iyileştirmeleri her zaman hoş karşılanır! Bu şunları içerir:

- Yazım hatalarını veya dilbilgisi hatalarını düzeltme
- Eksik bilgi ekleme
- Netliği artırma
- Örnekler ekleme
- Diğer dillere çevirme

#### 💻 Kod Katkıları

Şu etiketlerle işaretlenmiş issue'ları arayın:
- `good first issue` - Yeni gelenler için iyi
- `help wanted` - Ekstra dikkat gerekli
- `beginner friendly` - Yeni başlayanlar için uygun

---

## 🏆 Recognition

Contributors will be recognized in our README.md file. Thank you for making this project better!

Katkıda bulunanlar README.md dosyamızda tanınacaktır. Bu projeyi daha iyi hale getirdiğiniz için teşekkür ederiz!

---

**Questions?** Feel free to open an issue or contact the maintainers.

**Sorularınız mı var?** Bir issue açmaktan veya bakıcılarla iletişime geçmekten çekinmeyin.
