# XAMPP-এর সঙ্গে Project Connect করার ধাপ

এই project-টি Node.js backend এবং XAMPP MySQL/MariaDB database ব্যবহার করে। Project folder `htdocs`-এ রাখার প্রয়োজন নেই। Node server আলাদাভাবে চলবে এবং XAMPP-এর MySQL database-এর সঙ্গে connect করবে।

## ১. প্রয়োজনীয় software install করুন

কম্পিউটারে নিচের software থাকতে হবে:

- XAMPP
- Node.js 18 বা তার পরের version
- Postman
- Git
- VS Code বা অন্য code editor

Terminal-এ version দেখুন:

```bash
node -v
npm -v
```

## ২. ZIP extract করুন

ZIP file extract করে folder-টির নাম রাখতে পারেন:

```text
travel-management-system-bangladesh
```

উদাহরণ location:

```text
D:\Projects\travel-management-system-bangladesh
```

## ৩. XAMPP চালু করুন

1. XAMPP Control Panel খুলুন।
2. **Apache**-এর পাশে `Start` চাপুন।
3. **MySQL**-এর পাশে `Start` চাপুন।
4. MySQL-এর status সবুজ হয়েছে কি না দেখুন।

MySQL start না হলে সাধারণত port 3306 অন্য service ব্যবহার করছে। XAMPP-এর `Config > my.ini` থেকে port দেখুন এবং একই port `.env` file-এ দিন।

## ৪. Database import করুন

### পদ্ধতি A: phpMyAdmin দিয়ে

1. Browser-এ `http://localhost/phpmyadmin` খুলুন।
2. উপরের **Import** tab-এ যান।
3. প্রথমে `database/schema.sql` নির্বাচন করে **Import** করুন।
4. Import শেষ হলে আবার **Import** tab-এ যান।
5. এবার `database/seed.sql` নির্বাচন করে **Import** করুন।
6. বাম পাশে `travel_management_bd` database এবং tables দেখা যাবে।

### পদ্ধতি B: Terminal দিয়ে

Project folder-এ terminal খুলে:

```bash
copy .env.example .env
npm install
npm run db:setup
```

Windows PowerShell-এ copy command:

```powershell
Copy-Item .env.example .env
```

`npm run db:setup` চালালে schema এবং seed দুটোই import হবে। এটি existing data reset করে, তাই production database-এ ব্যবহার করবেন না।

## ৫. `.env` তৈরি ও edit করুন

`.env.example` copy করে `.env` করুন। Default XAMPP configuration হলে:

```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=travel_management_bd
DB_CONNECTION_LIMIT=10
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_DAYS=7

CORS_ORIGIN=http://localhost:5000,http://localhost:3000
ENABLE_API_LOGS=true
```

XAMPP root user-এর password set করা থাকলে `DB_PASSWORD`-এ সেই password দিন।

## ৬. Dependency install করুন

Project folder-এ:

```bash
npm install
```

তারপর code syntax check:

```bash
npm run check
```

Test run:

```bash
npm test
```

## ৭. Backend চালু করুন

Development mode:

```bash
npm run dev
```

অথবা:

```bash
npm start
```

Success হলে terminal-এ দেখাবে:

```text
Database connection established.
API: http://localhost:5000/api
Health: http://localhost:5000/api/health
Demo UI: http://localhost:5000
```

## ৮. Browser দিয়ে verify করুন

Browser-এ খুলুন:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Travel Management System Bangladesh API is running."
}
```

Demo interface:

```text
http://localhost:5000
```

## ৯. Postman connect করুন

1. Postman খুলুন।
2. `postman/Travel-Management-BD.postman_collection.json` import করুন।
3. `postman/Travel-Management-BD-Local.postman_environment.json` import করুন।
4. Environment হিসেবে **Travel Management BD - Local** নির্বাচন করুন।
5. `Authentication > Login User` request send করুন।
6. Test script access token এবং refresh token environment-এ save করবে।
7. এরপর Smart Routes, Trips, Ratings এবং অন্যান্য protected request চালাতে পারবেন।

## ১০. Demo login

Admin:

```text
Email: admin@travelbd.local
Password: Admin@123
```

User:

```text
Email: user@travelbd.local
Password: User@123
```

## ১১. Common সমস্যা

### `ECONNREFUSED 127.0.0.1:3306`

MySQL start হয়নি বা port ভুল। XAMPP-এ MySQL start করুন এবং `.env`-এর `DB_PORT` ঠিক করুন।

### `Access denied for user 'root'`

MySQL root password আছে, কিন্তু `.env`-এ দেওয়া হয়নি। `DB_PASSWORD` update করুন।

### `Unknown database 'travel_management_bd'`

`schema.sql` import হয়নি। phpMyAdmin থেকে আবার import করুন।

### `Port 5000 already in use`

`.env`-এ অন্য port দিন:

```env
PORT=5001
```

### Login কাজ করছে না

`seed.sql` import হয়েছে কি না দেখুন। phpMyAdmin-এ `users` table খুলে admin এবং demo user আছে কি না verify করুন।

### Logout কীভাবে কাজ করে

Login response থেকে পাওয়া `refreshToken` দিয়ে:

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

সব device থেকে logout করতে:

```json
{
  "allDevices": true
}
```
