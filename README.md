# 🏪 Дэлгүүрийн Касын Систем

Дэлгүүрийн касын веб систем - 3 дэлгүүрийн барааны удирдлага, харилцагчдын мэдээлэл болон борлуулалтын талаарх мэдээллийг хянах боломжтой.

## 🚀 Онцлогууд

### 🔐 Нэвтрэх систем
- Username/Password authentication
- Нууцлалтай эрх олгох систем
- Демо эрх: `admin` / `password123`

### 🏬 Дэлгүүрийн удирдлага
Гурван дэлгүүрийн мэдээлэл:
1. **Мангас агуулах** - Бараанаас хадгалах агуулах
2. **Үндсэн дэлгүүр** - Үндсэн худалдаа
3. **255 агуулах** - Нэмэлт агуулах

### 📦 Барааны удирдлага
- Барааны нэр, тоо ширхэг, нэгжийн үнэ
- Барааны үлдэгдэл хянах
- Шинэ бараа нэмэх/устгах
- Тоо ширхэг өөрчлөх

### 👥 Харилцагчдын удирдлага
- Харилцагчийн нэр, утасны дугаар
- Худалдан авалтын түүх
- Харилцагчид бүртгэх

### 📊 Тайлан ба статистик
- Дэлгүүр тус бүрийн статистик
- Нийт орлого, борлуулалт
- Харилцагчдын тоо
- Барааны үлдэгдэл

## 🛠 Техникийн мэдээлэл

### Технологи
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Өгөгдөл**: localStorage (демо зорилгоор)

### Хуудаснуудын структур
```
/                    → Нүүр хуудас (redirect)
/login              → Нэвтрэх хуудас
/dashboard          → Үндсэн dashboard
/store/[storeId]    → Дэлгүүр тус бүрийн удирдлага
/customers          → Харилцагчдын удирдлага
/reports            → Тайлан хуудас
```

## 🚀 Эхлүүлэх заавар

Эхлээд development server ажиллуулна уу:

```bash
npm run dev
# эсвэл
yarn dev
# эсвэл
pnpm dev
```

Дараа нь [http://localhost:3000](http://localhost:3000) хандаж үзнэ үү.

### Эхний нэвтрэх мэдээлэл:
- **Хэрэглэгчийн нэр**: `admin`
- **Нууц үг**: `password123`

## 📝 Ашиглах заавар

1. `/login` хуудсанд нэвтэрнэ
2. Dashboard-с дэлгүүрүүдийг харна
3. Дэлгүүр тус бүр дээр дарж бараагаа удирдана
4. Харилцагчдын мэдээллийг `/customers` хуудсанд удирдана
5. Тайланг `/reports` хуудсанд харна

## 💾 Өгөгдлийн хадгалалт

### 🔄 Hybrid Data Storage System

Систем нь **хоёр төрлийн өгөгдөл хадгалах арга** ашигладаг:

#### Development режим:
- **localStorage** - Локал хөгжүүлэлтэд ашигладаг
- Browser-н storage дээр мэдээлэл хадгалагдана
- Browser цэвэрлэх үед мэдээлэл алагдана

#### Production режим (Vercel дээр):
- **Vercel KV (Redis)** - Жинхэнэ database
- Бүх мэдээлэл server дээр найдвартай хадгалагдана
- Users хооронд мэдээлэл хуваалцагдана
- Автоматаар backup хийгддэг

### 🚀 Vercel дээр Deploy хийх заавар

1. **GitHub repository үүсгэх:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

2. **Vercel дээр project нэмэх:**
   - [vercel.com](https://vercel.com) дээр нэвтэрнэ
   - "Add New Project" дарна
   - GitHub repository сонгоно
   - Deploy дарна

3. **Vercel KV Database нэмэх:**
   - Vercel dashboard дээр project сонгоно
   - "Storage" tab дээр ороно
   - "Create Database" → "KV" сонгоно
   - Database нэр өгч үүсгэнэ

4. **Environment Variables тохируулах:**
   Vercel project settings дээр дараах environment variables нэмнэ:
   ```
   KV_URL=your_kv_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
   ```

5. **Redeploy хийх:**
   - Settings хувиргасны дараа project-г дахин deploy хийнэ

### ⚡ Автоматаар Fallback

Система нь **автоматаар** дараах logic ашигладаг:
1. **Эхлээд API (Vercel KV) шалгана**
2. **Амжилтгүй бол localStorage fallback**
3. **Development режимд localStorage primary**
4. **Production режимд Vercel KV primary**

### 🔒 Найдвартай байдал

- ✅ **Development**: localStorage backup
- ✅ **Production**: Vercel KV database  
- ✅ **Auto-failover**: API алдаа гарвал localStorage ашиглана
- ✅ **Data persistence**: Production дээр өгөгдөл алдагдахгүй
- ✅ **Multi-user support**: Production дээр олон хэрэглэгч дата хуваалцдаг

### 📊 Production Features

Production дээр дараах нэмэлт боломжууд байна:
- 🔄 **Real-time data sync** between users
- 💾 **Automatic backups** via Vercel KV
- 🚀 **Better performance** with Redis caching
- 🔒 **Data security** with server-side storage
- 📈 **Scalability** for multiple stores/users

## 🔮 Ирээдүйн сайжруулалт

- [ ] Жинхэнэ database холболт
- [ ] Бараа борлуулах систем
- [ ] Backup/Export функц
- [ ] Өрөөсийн систем
- [ ] QR код буюу barcode скан
- [ ] Мобайл app

## 📱 Mobile-First Responsive Design

Системийг **гар утас ба tablet**-д илүү анхаарч бүтээсэн:

### 🎯 Mobile Optimizations
- **Touch-friendly controls** - Том товч, хялбар хүрэх зайнууд
- **Card-based layout** - Mobile дээр table-н оронд card харагдана
- **Hamburger navigation** - Mobile дээр collapse хийсэн цэс
- **Mobile-first grid system** - Утсан дээр илүү сайн харагдах grid
- **Large touch targets** - 44px+ товчууд, хялбар дарах
- **Optimized forms** - Mobile дээр зайлах зайтай form элементүүд

### 📐 Responsive Breakpoints
- **Mobile**: < 640px - Single column layout, cards, hamburger menu
- **Tablet**: 640px - 1024px - 2 column grid, expanded cards
- **Desktop**: > 1024px - Full 3 column layout, tables, full navigation

### 🔄 Adaptive Components
- **Tables → Cards**: Mobile дээр table-г card болгон хувиргана
- **Navigation**: Desktop дээр horizontal, mobile дээр hamburger menu
- **Forms**: Mobile дээр илүү том input field, better spacing
- **Buttons**: Touch-optimized sizing (minimum 44px height)

### ⚡ Performance Features
- **Optimized images** - Responsive loading
- **Touch gestures** - Tap, swipe-friendly interface
- **Fast navigation** - Single-tap access to main features

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
