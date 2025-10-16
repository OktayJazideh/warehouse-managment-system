# 🚀 راهنمای Deploy رایگان روی Vercel

## 📋 پیش‌نیازها

### 1. ایجاد اکانت‌های رایگان:
- **Vercel Account:** [vercel.com](https://vercel.com) 
- **Supabase Account:** [supabase.com](https://supabase.com) - برای PostgreSQL رایگان
- **GitHub Account:** [github.com](https://github.com) - برای کد
- **Cloudinary Account:** [cloudinary.com](https://cloudinary.com) - برای فایل آپلود (اختیاری)

## 🎯 مرحله 1: تنظیم Database (Supabase)

### ساخت پروژه Supabase:
1. برو به [supabase.com](https://supabase.com)
2. **"New project"** رو بزن
3. نام پروژه: `warehouse-management`
4. Password قوی انتخاب کن و یادداشت کن
5. Region: `Southeast Asia (Singapore)` یا نزدیک‌ترین منطقه
6. **"Create new project"** بزن

### دریافت اطلاعات اتصال:
1. از dashboard Supabase، برو به **Settings > Database**
2. اطلاعات زیر را کپی کن:
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432  
   Database: postgres
   User: postgres
   Password: [پسورد که انتخاب کردی]
   ```

## 🎯 مرحله 2: آپلود کد به GitHub

### ساخت Repository:
1. برو به [github.com](https://github.com) 
2. **"New repository"** بزن
3. نام: `warehouse-management-system`
4. Public انتخاب کن
5. **"Create repository"** بزن

### آپلود کد:
```bash
# در پوشه پروژه
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/warehouse-management-system.git
git push -u origin main
```

## 🎯 مرحله 3: Deploy روی Vercel

### اتصال GitHub به Vercel:
1. برو به [vercel.com](https://vercel.com)
2. **"New Project"** بزن
3. GitHub repository رو انتخاب کن
4. **"Import"** بزن

### تنظیمات Build:
- **Framework Preset:** Other
- **Root Directory:** `.` (خالی بذار)
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`

## 🎯 مرحله 4: تنظیم Environment Variables

در Vercel dashboard، برو به **Settings > Environment Variables** و این متغیرها رو اضافه کن:

### Database Variables:
```
DB_TYPE = postgres
DB_HOST = db.xxxxxxxxxxxxx.supabase.co
DB_PORT = 5432  
DB_NAME = postgres
DB_USER = postgres
DB_PASS = [پسورد Supabase]
```

### Security Variables:
```
JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV = production
VERCEL = 1
```

### Domain Variables:
```
FRONTEND_URL = https://your-app-name.vercel.app
```

## 🎯 مرحله 5: بررسی و تست

### چک کردن Deployment:
1. در Vercel dashboard، **"Visit"** رو بزن
2. اگر خطا داشت، **"Functions"** tab رو چک کن
3. لاگ‌ها رو بررسی کن

### تست کردن:
1. سایت باز بشه ✅
2. صفحه login نمایش داده بشه ✅  
3. با admin/admin123 لاگین کن ✅
4. منوها کار کنن ✅

## 🛠️ رفع مشکلات معمول

### مشکل 1: Database Connection
```bash
# اگر database connect نمی‌شه:
# 1. تو Supabase برو به Settings > Database > Connection pooling
# 2. Transaction mode رو انتخاب کن  
# 3. Host جدید رو کپی کن (حاوی pooler)
```

### مشکل 2: Build Failed
```bash
# اگر build نشد:
# 1. تو Vercel برو به Deployments > View Function Logs
# 2. خطا رو بررسی کن
# 3. معمولاً مربوط به missing environment variables
```

### مشکل 3: API Routes 404
```bash
# اگر API کار نمی‌کنه:
# 1. ببین آیا /api پیش از URL هست
# 2. Functions tab رو چک کن
# 3. Serverless function logs رو ببین
```

## 📊 محدودیت‌های رایگان

### Vercel Free Tier:
- ✅ 100GB Bandwidth/ماه
- ✅ Serverless Functions تا 10s
- ✅ Custom domains
- ❌ Background jobs
- ❌ محدودیت build time: 45 دقیقه

### Supabase Free Tier:
- ✅ 500MB Database
- ✅ 50MB File Storage  
- ✅ 50,000 Monthly Active Users
- ❌ بعد از 7 روز inactivity، pause می‌شه

## 🔧 بهینه‌سازی برای Production

### Performance:
```javascript
// تو api.js اضافه کن:
api.defaults.timeout = 30000; // 30 seconds for Vercel
```

### Error Handling:
```javascript
// تو server.js:
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
```

## 📝 مراحل بعد از Deploy

### Security:
1. ✅ پسورد admin رو تغییر بده
2. ✅ JWT_SECRET رو عوض کن
3. ✅ Database password رو قوی انتخاب کن

### Monitoring:
1. Vercel analytics رو فعال کن
2. Supabase logs رو چک کن
3. Error tracking تنظیم کن

### Backup:
1. Supabase automatic backup داره
2. GitHub رو بروز نگه دار
3. Environment variables رو backup کن

## 🆘 پشتیبانی

### مشکل داری؟
1. **Vercel Logs:** Functions tab > View Logs
2. **Supabase Logs:** Logs & Analytics section  
3. **GitHub Issues:** Repository issues
4. **Vercel Community:** [vercel.com/community](https://vercel.com/community)

## ✅ چک‌لیست نهایی

- [ ] Supabase پروژه ساخته شد
- [ ] GitHub repository آماده
- [ ] Vercel deployment موفق
- [ ] Environment variables تنظیم شد
- [ ] Database متصل شد
- [ ] سایت کار می‌کنه
- [ ] Login کار می‌کنه  
- [ ] Admin password تغییر کرد

---

## 🎉 تبریک! 

سیستم مدیریت انبار شما روی Vercel deploy شد و کاملاً رایگان در دسترس است!

**آدرس سایت:** `https://your-app-name.vercel.app`

**اطلاعات ورود پیش‌فرض:**
- Username: `admin`  
- Password: `admin123`

⚠️ **مهم:** حتماً پسورد admin رو تغییر بدید!