# توثيق نظام WhatsQubatiBot وبيانات الاتصال والحسابات
**تاريخ التوثيق:** 26 سبتمبر 2026  
**اسم المشروع:** WhatsQubatiBot (WhatsApp & Multi-Channel CRM & Automation)  
**الحالة:** نشط ومربوط بقاعدة بيانات سحابية دائمة (TiDB Cloud Serverless)  

---

## 1. بيانات الاتصال بقاعدة البيانات (TiDB Cloud MySQL)

تم الانتقال والترقية إلى خدمة **TiDB Cloud Serverless** المجانية والدائمة (Free-Forever)، المتوافقة كلياً مع MySQL 8.0 مع دعم التشفير والاتصال الآمن TLS/SSL.

| البند | القيمة | ملاحظات |
| :--- | :--- | :--- |
| **مزود الخدمة** | [TiDB Cloud](https://tidbcloud.com/) | خطة Serverless دائمة مجاناً |
| **المضيف (Host)** | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com` | منطقة AWS طوكيو |
| **المنفذ (Port)** | `4000` | منفذ MySQL الافتراضي لـ TiDB |
| **اسم المستخدم (User)** | `3WY8tL2Hp26Mfr6.root` | المستخدم الرئيسي |
| **كلمة المرور (Password)** | `egsFV2ynQl3lCW12` | كلمة مرور القاعدة |
| **اسم قاعدة البيانات (DB Name)** | `whatscrm` | 43 جدولاً مهيأة بالكامل |
| **التشفير (DB_SSL)** | `true` | إلزامي للاتصال السحابي الآمن |
| **سعة الاتصالات (Pool Limit)** | `25` | مهيأ تلقائياً في الكود لتفادي استهلاك الموارد |

> **ملاحظة أمنية هامة لقاعدة البيانات:**  
> يُرجى التأكد دائماً في لوحة تحكم TiDB Cloud (ضمن **Security > IP Access List**) من وجود العنوان `0.0.0.0/0` للسماح لخوادم Render بالاتصال دون حظر.

---

## 2. بيانات السيرفر والاستضافة (Render Hosting)

| البند | القيمة |
| :--- | :--- |
| **المنصة** | [Render Dashboard](https://dashboard.render.com/) |
| **اسم الخدمة (Service Name)** | `whatsqubatibot-9x83` |
| **نوع الخدمة** | Web Service (Node.js) |
| **الرابط المباشر (Live URL)** | `https://whatsqubatibot-9x83.onrender.com` |
| **صفحة تسجيل الدخول** | `https://whatsqubatibot-9x83.onrender.com/user/login` |
| **صفحة دخول المدير (Admin)** | `https://whatsqubatibot-9x83.onrender.com/admin/login` |

### المتغيرات البيئية الإلزامية في Render (Environment Variables):
يجب التأكد من وجودها ومطابقتها في Render > Environment:
```env
HOST=127.0.0.1
PORT=3004
DBHOST=gateway01.ap-northeast-1.prod.aws.tidbcloud.com
DBPORT=4000
DBUSER=3WY8tL2Hp26Mfr6.root
DBPASS=egsFV2ynQl3lCW12
DBNAME=whatscrm
DB_SSL=true
JWTKEY=NCRUp5hKovUAcZd9OwIw0BCKmjZj9JxpNCRUp5hKovUAcZd9OwIw0BCKmjZj9JxpNCRUp5hKovUAcZd9OwIw0BCKmjZj9Jxp
FRONTENDURI=https://whatsqubatibot-9x83.onrender.com
BACKURI=https://whatsqubatibot-9x83.onrender.com
NODE_ENV=production
```

---

## 3. الحسابات والمستخدمين المهيأة في النظام

### 1) حساب المستخدم: عبدالله قنما
- **البريد الإلكتروني:** `gnma@whatsqubatibot.com`
- **كلمة المرور:** `Qnma@573017X#`
- **الاسم الظاهر:** عبدالله قنما
- **نوع الحساب:** `user`
- **الخطة (Plan):** **بلاتنيوم (Platinum)** كاملة الصلاحيات
- **مدة الخطة:** مفتوحة مالا نهاية / مدى الحياة (حتى 01/01/2100)
- **مميزات الخطة المفعلة:**
  - 24 جهاز واتساب (`qr_account: 24`)
  - حد جهات الاتصال: 10,000 (`contact_limit: 10000`)
  - مفعل: الذكاء الاصطناعي والشات بوت (`allow_chatbot: 1`)
  - مفعل: مسخن الواتساب للحماية من الحظر (`wa_warmer: 1`)
  - مفعل: واجهة برمجة التطبيقات (`allow_api: 1`, `rest_api_qr: 1`)
  - مفعل: صندوق وارد انستغرام وتيليجرام (`instagram_inbox: 1`, `telegram_inbox: 1`)
  - مفعل: نماذج الواتساب والوسوم والملاحظات (`allow_wa_forms: 1`, `allow_tag: 1`, `allow_note: 1`)

---

### 2) حساب الأدمن الرئيسي (System Administrator)
- **البريد الإلكتروني:** `admin@admin.com`
- **كلمة المرور:** `Password@123`
- **نوع الحساب:** `admin` (صلاحيات كاملة على كل النظام وإدارة المستخدمين والخطط)
- **الرابط:** `/admin/login`

---

### 3) الحساب التجريبي (Demo User)
- **البريد الإلكتروني:** `user@user.com`
- **كلمة المرور:** `Password@123`
- **الاسم الظاهر:** Demo User
- **نوع الحساب:** `user`
- **الخطة:** بلاتنيوم غير محدودة

---

## 4. مستودع الأكواد (GitHub Repository)

- **الرابط:** `https://github.com/momoqubati-ctrl/whatscrm.git`
- **الفرع الرئيسي:** `main`
- **النشر التلقائي (Auto-Deploy):** مربوط تلقائياً بـ Render؛ أي دفع إلى `origin main` يؤدي إلى إعادة البناء والنشر التلقائي للخدمة.

---

## 5. ملفات قواعد البيانات والسكربتات الاحتياطية

1. **ملف السكيما الكامل لـ TiDB:**  
   `database/tidb_schema.sql`  
   يحتوي على كافة الجداول الـ 43 مع تعديل مفاتيح `AUTO_INCREMENT` ليتوافق بنسبة 100% مع معمارية المحرك السحابي الموزع.

2. **سكربت استيراد وإعادة تهيئة القاعدة والمستخدمين:**  
   `extract_to _server/database/import_tidb.js`  
   يمكن تشغيله عبر الأمر:
   ```bash
   node database/import_tidb.js
   ```
   (يقوم بتهيئة الجداول، إضافة أعمدة 5.9.8، وإنشاء المستخدمين وتشفير كلمات السر فورياً).

---

## 6. ملخص الحل لأبرز المشكلات السابقة

1. **سبب ظهور `user@user.com` و "John Doe" في البروفايل عند تسجيل الخروج:**
   - في كود الواجهة الأمامية React (`main.d12aca39.js`)، عند انقطاع الاتصال بقاعدة البيانات وفشل طلب `/api/user/fetch_profile`، يضع النظام تلقائياً قيماً افتراضية ثابتة هي `name: "John Doe"` و `email: "user@user.com"`. المشكلة كانت بسبب توقف سيرفر قاعدة بيانات Aiven السابقة وانقطاع الاتصال وليس بسبب تداخل حسابات.
2. **سبب خطأ تسجيل الدخول "Server error" / "Something went wrong":**
   - خادم قاعدة بيانات Aiven المجاني المؤقت تم إيقافه وحذف سجل الـ DNS الخاص به مما تسبب في انتهاء مهلة الاتصال (`ETIMEDOUT`). تم حل المشكلة جذرياً بنقل القاعدة إلى TiDB Cloud Serverless الدائمة.
