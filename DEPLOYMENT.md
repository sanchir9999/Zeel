# Deployment Guide - Zeel Store Management System

## Өгөгдлийн сангийн тохиргоо

Энэ системийг Vercel дээр deploy хийхэд өгөгдөл хадгалагдахын тулд дараах алхмуудыг дагана уу:

### 1. Vercel KV Database тохируулах

1. **Vercel Dashboard** руу орно уу: https://vercel.com/dashboard
2. **Storage** tab дээр дарж **Create Database** сонгоно уу
3. **KV** сонгоно уу
4. Database нэр өгөөд (жишээ: zeel-store-db) **Create** дарна уу

### 2. Environment Variables тохируулах

Vercel дээр татаж авсан environment variables-г дараах байдлаар тохируулна уу:

1. Vercel project settings дээр орно уу
2. **Environment Variables** tab сонгоно уу  
3. Дараах variables нэмнэ үү:

```
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here  
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token_here
```

### 3. Системийн онцлог

Энэ систем **Hybrid Storage** ашигладаг:
- **Production (Vercel KV)**: Өгөгдөл Vercel KV database дээр хадгалагдана
- **Development/Fallback (localStorage)**: Хэрэв KV байхгүй бол localStorage ашиглана

### 4. Дэлгүүрийн мэдээлэл

Системд 3 дэлгүүр байгааг анхнаас нь тодорхойлсон:

1. **Мангас агуулах** (ID: mangas)
2. **Үндсэн дэлгүүр** (ID: main)  
3. **255 агуулах** (ID: warehouse255)

### 5. Нэвтрэх мэдээлэл

```
Админ:
Username: admin
Password: admin123

Менежер:
Username: manager  
Password: manager123
```

### 6. Системийн боломжууд

- ✅ **Дэлгүүрүүдийн удирдлага**: 3 дэлгүүрийн бараа, тоо ширхэг, үнэ
- ✅ **Хэрэглэгчдийн мэдээлэл**: Нэр, утас, худалдааны түүх
- ✅ **Тайлан**: Дэлгүүр бүрийн статистик, орлого
- ✅ **Mobile-responsive**: Гар утас, таблет дээр оновчтой
- ✅ **Real-time sync**: Өгөгдөл шууд шинэчлэгддэг
- ✅ **Automatic fallback**: Сүлжээ таслагдахад localStorage ашиглана

### 7. Deployment commands

Local development:
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Deployment check:
```bash
npm run deploy:check
```

### 8. Файлийн бүтэц

```
app/
├── api/                    # REST API routes
│   ├── auth/              # Authentication
│   ├── customers/         # Customer management  
│   ├── products/          # Product management
│   └── purchases/         # Purchase tracking
├── components/            # Reusable components
├── dashboard/             # Main dashboard
├── login/                 # Authentication page
├── store/[storeId]/       # Individual store management
├── customers/             # Customer management page
└── reports/               # Analytics and reports

lib/
├── types.ts               # TypeScript type definitions
├── database.ts            # Database abstraction layer
└── api-client.ts          # Hybrid API/localStorage client
```

### 9. Техникийн stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel KV (Redis) + localStorage fallback
- **Deployment**: Vercel

### 10. Анхаарах зүйлс

1. KV environment variables зөв тохируулахаа мартаж болохгүй
2. localStorage нь browser дээр local storage ашигладаг
3. Өгөгдөл production дээр KV database дээр автоматаар хадгалагдана
4. System responsive тул mobile device дээр ч сайн ажиллана

**Амжилттай deployment!** 🚀