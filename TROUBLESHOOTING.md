# Vercel Deployment Troubleshooting

## 1. Browser кэш цэвэрлэх
- **Chrome/Edge**: Ctrl+Shift+R (Hard refresh)
- **Firefox**: Ctrl+F5
- Эсвэл Incognito/Private mode ашиглах

## 2. Vercel Dashboard шалгах
1. https://vercel.com/dashboard руу орно уу
2. Zeel project дээр дарна уу  
3. **Deployments** tab шалгана уу
4. Хамгийн сүүлийн deployment "Ready" статустай эсэхийг шалгана уу

## 3. DNS/CDN кэш
- Vercel-ийн CDN кэш шинэчлэгдэхэд 5-10 минут хүрч болно
- https://zeel-woad.vercel.app/?v=1 гэж параметр нэмж оролдоно уу

## 4. Environment Variables шалгах
Vercel project settings дээр:
- KV_URL
- KV_REST_API_URL  
- KV_REST_API_TOKEN
- KV_REST_API_READ_ONLY_TOKEN

Энэ variables байгаа эсэхийг шалгана уу.

## 5. Build logs шалгах
Vercel Dashboard дээр Functions tab-д build error байгаа эсэхийг шалгана уу.

## 6. Manual redeploy
Vercel Dashboard дээр "Redeploy" товч дарж manual deployment хийнэ үү.

## 7. Domain шалгах
Хэрэв custom domain ашиглаж байвал DNS settings зөв эсэхийг шалгана уу.

---

**Анхаарах зүйл**: GitHub repository-тэй холбосон Vercel project нь автоматаар deploy хийдэг. Main branch дээр push хийх бүрд шинэ deployment үүснэ.