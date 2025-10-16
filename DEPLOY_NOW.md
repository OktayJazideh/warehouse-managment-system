# 🚀 Deploy الان - مراحل سریع

## 1️⃣ GitHub Upload

```bash
# GitHub repository بساز:
# نام: warehouse-management-system
# Public انتخاب کن

# بعد کد رو آپلود کن:
git remote add origin https://github.com/YOUR-USERNAME/warehouse-management-system.git
git branch -M main  
git push -u origin main
```

## 2️⃣ Vercel Deploy  

### برو به [vercel.com](https://vercel.com)
1. **"New Project"** → **"Import Git Repository"**
2. GitHub repository انتخاب کن
3. **"Import"** بزن
4. **Deploy** میزنه (ممکنه اول fail کنه - نگران نباش!)

## 3️⃣ Environment Variables

در **Vercel Dashboard > Settings > Environment Variables** این 7 تا متغیر رو اضافه کن:

```
DB_TYPE = postgres
DB_HOST = db.qnfrqxhoepcnshwvyzms.supabase.co  
DB_PORT = 5432
DB_NAME = postgres
DB_USER = postgres
DB_PASS = 92#B.Aj2x.RYYcn
JWT_SECRET = SuperSecretJWTKeyForProductionWarehouseSystem2025
```

## 4️⃣ Redeploy

- **Deployments** tab برو
- **"Redeploy"** بزن (چون environment variables اضافه کردی)

## 5️⃣ تست سایت

### سایتت الان کار می‌کنه:
- ✅ Frontend لود می‌شه
- ✅ `/api/health` کار می‌کنه  
- ✅ Login صفحه نمایش داده می‌شه
- ✅ با `admin` / `admin123` لاگین می‌شی

## 🎉 تموم!

**آدرس سایتت:** `https://warehouse-management-system-xyz.vercel.app`

---

## 🔧 اگر مشکل داشتی:

### Build Failed?
- **Functions** tab → **View Logs** 
- معمولاً Environment Variables فراموش شده

### Database Connection?  
- Environment Variables رو دوباره چک کن
- Supabase project فعال باشه

### 404 Error?
- `vercel.json` درست باشه (که هست!)
- Redeploy کن

---

## 📱 Next Steps:

1. ✅ Admin password عوض کن
2. ✅ محصول اضافه کن تست کن  
3. ✅ Transaction اضافه کن تست کن
4. ✅ با دوستات share کن! 

**موفق باشی! 🎯**