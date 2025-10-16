# 🚀 شروع سریع (بدون نصب دیتابیس!)

## ✅ آماده شدن (2 دقیقه)

### گام 1: نصب وابستگی‌ها
```bash
# در پوشه اصلی پروژه
node setup.js
```

### گام 2: ایجاد دیتابیس و داده‌های نمونه
```bash
cd backend
npm run setup
```

### گام 3: اجرای برنامه
Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend  
npm run dev
```

## 🌐 دسترسی
- **وب‌سایت**: http://localhost:8080
- **API**: http://localhost:3000

## 👤 ورود به سیستم
- **مدیر**: username=`admin` / password=`admin123`
- **انباردار**: username=`manager` / password=`manager123`

## 📁 فایل‌های مهم
- `backend/database.sqlite` - فایل دیتابیس (خودکار ساخته می‌شه)
- `backend/.env` - تنظیمات (SQLite فعال شده)

## 🎉 تمام!
هیچ نصبی لازم نیست! فقط Node.js کافی است.

---

💡 **نکته**: اگر می‌خواهید PostgreSQL استفاده کنید، فایل `database-setup-guide.md` را ببینید.