# 🚀 LOCAL DEVELOPMENT SETUP - Sistem Percetakan New Rizquna Elfath

**Tanggal:** 20 Februari 2026  
**Status:** ✅ Ready for Local Development

---

## 📋 **REQUIREMENTS**

### **System Requirements:**
- ✅ PHP 8.2+ (Current: 8.4.17)
- ✅ Composer 2.9+ (Current: 2.9.3)
- ✅ Node.js 18+ 
- ✅ npm 9+
- ✅ SQLite (default) or PostgreSQL 16
- ✅ Git

### **Optional:**
- Docker (for containerized development)
- Redis (for queue/caching in production)

---

## 🔧 **INSTALLATION STEPS**

### **Step 1: Clone & Install Dependencies**

```bash
# Navigate to project
cd /Users/macm4/Documents/Projek/NRE

# Install PHP dependencies
composer install

# Install Node dependencies (admin-panel)
cd admin-panel
npm install
cd ..
```

---

### **Step 2: Environment Configuration**

```bash
# Copy environment file
cp .env.example .env.local

# Generate application key
php artisan key:generate

# Edit .env.local if needed:
# - DB_CONNECTION=sqlite (default)
# - APP_URL=http://localhost:8000
```

**Recommended .env.local for Local Development:**
```env
APP_NAME="New Rizquna Elfath"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

LOG_LEVEL=debug
```

---

### **Step 3: Database Setup**

```bash
# Create SQLite database (if not exists)
touch database/database.sqlite

# Run migrations
php artisan migrate

# (Optional) Seed sample data
php artisan db:seed
```

**Expected Output:**
```
INFO  Running migrations.

  0001_01_01_000000_create_users_table ..................... 4.32ms DONE
  2026_02_20_120001_create_percetakan_core_tables ......... 18.54ms DONE
  ...
```

---

### **Step 4: Create Test User**

```bash
php artisan tinker
```

```php
// Create admin user
$user = App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@newrizqunaelfath.com',
    'username' => 'admin',
    'password' => Hash::make('password'),
    'is_active' => true,
]);

// Assign Admin role
$user->assignRole('Admin');

// Create test token for API testing
$token = $user->createToken('admin-token')->plainTextToken;
echo "Admin Token: " . $token . PHP_EOL;

// Create author user
$author = App\Models\User::create([
    'name' => 'Test Author',
    'email' => 'author@newrizqunaelfath.com',
    'username' => 'author',
    'password' => Hash::make('password'),
    'is_active' => true,
]);

$author->assignRole('Author');

// Create author profile
App\Models\Percetakan\Customer::create([
    'code' => 'CUST-' . date('Ymd') . '-0001',
    'name' => 'Test Author',
    'email' => 'author@newrizqunaelfath.com',
    'type' => 'retail',
    'user_id' => $author->id,
]);

echo "Setup complete!" . PHP_EOL;
exit
```

---

### **Step 5: Build Frontend**

```bash
cd admin-panel

# Development build (with hot reload)
npm run dev

# OR production build
npm run build

cd ..
```

**Expected Output:**
```
✓ built in 3.79s
```

---

### **Step 6: Start Development Servers**

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve --port=8000
```

**Terminal 2 - Frontend (Optional - for hot reload):**
```bash
cd admin-panel
npm run dev
```

**Access:**
- **Frontend:** http://localhost:8000/admin
- **API:** http://localhost:8000/api/v1

---

## 🧪 **TESTING LOCALLY**

### **1. Test Login**

**URL:** http://localhost:8000/admin/login

**Credentials:**
- Email: `admin@newrizqunaelfath.com`
- Password: `password`

**Expected:** Login successful → Dashboard

---

### **2. Test Percetakan Menu**

**Navigate to:**
```
Sidebar → 🏭 Percetakan → Orders
```

**Expected:**
- Menu expands
- Order List page loads
- No console errors

---

### **3. Test Create Order**

**URL:** http://localhost:8000/admin/percetakan/orders/new

**Test:**
1. Fill customer dropdown
2. Fill product dropdown
3. Set specifications
4. Enter quantity: 1000
5. Enter unit price: 5000
6. Verify pricing auto-calculates
7. Click "Simpan Order"

**Expected:**
- Success notification
- Redirect to order list
- Order created in database

---

### **4. Test API with cURL**

**Get Customers:**
```bash
curl -X GET http://localhost:8000/api/v1/percetakan/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Order:**
```bash
curl -X POST http://localhost:8000/api/v1/percetakan/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "product_id": 1,
    "quantity": 1000,
    "unit_price": 5000,
    "deadline": "2026-03-01",
    "specifications": {
      "size": "A4",
      "paper_type": "Art Paper",
      "paper_weight": "120gsm",
      "colors_inside": "0/0",
      "colors_outside": "4/0"
    }
  }'
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue 1: Migration Fails**

**Error:**
```
SQLSTATE[HY000]: General error: 1 table already exists
```

**Solution:**
```bash
# Drop all tables and re-migrate
php artisan migrate:fresh --seed
```

---

### **Issue 2: Frontend Not Loading**

**Error:**
```
404 Not Found - /admin/index.html
```

**Solution:**
```bash
cd admin-panel
npm run build
cd ..
```

---

### **Issue 3: API 401 Unauthorized**

**Error:**
```json
{
  "message": "Unauthenticated."
}
```

**Solution:**
- Check token is valid
- Regenerate token:
```bash
php artisan tinker
>>> User::first()->tokens()->delete();
>>> User::first()->createToken('new-token')->plainTextToken;
```

---

### **Issue 4: Port 8000 Already in Use**

**Error:**
```
Address already in use
```

**Solution:**
```bash
# Use different port
php artisan serve --port=8001

# Or kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

---

### **Issue 5: Class Not Found**

**Error:**
```
Class 'App\Models\Percetakan\Customer' not found
```

**Solution:**
```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

---

## 📊 **LOCAL DEVELOPMENT CHECKLIST**

### **Daily Development:**

**Morning Setup:**
- [ ] Pull latest changes: `git pull`
- [ ] Install dependencies: `composer install && npm install`
- [ ] Start Laravel: `php artisan serve`
- [ ] Start Vite: `npm run dev` (in admin-panel)
- [ ] Open browser: http://localhost:8000/admin

**During Development:**
- [ ] Make changes to backend (PHP)
- [ ] Make changes to frontend (React/TypeScript)
- [ ] Test in browser
- [ ] Test API with Postman/cURL
- [ ] Commit changes: `git add -A && git commit -m "message"`

**End of Day:**
- [ ] Run tests: `php artisan test`
- [ ] Push changes: `git push`
- [ ] Stop servers: `Ctrl+C`

---

## 🔍 **DEBUGGING TOOLS**

### **Laravel Debugging:**

**Enable Query Log:**
```php
DB::enableQueryLog();
// ... your code
dd(DB::getQueryLog());
```

**Laravel Telescope (Optional):**
```bash
composer require laravel/telescope
php artisan telescope:install
php artisan migrate
```

**Access:** http://localhost:8000/telescope

---

### **Frontend Debugging:**

**React DevTools:**
- Install Chrome extension
- Inspect React components
- Check props & state

**Network Tab:**
- Check API requests
- Verify headers (Authorization)
- Check response data

**Console:**
- Check for errors
- Log variables: `console.log()`

---

## 📝 **COMMON TASKS**

### **Create New Migration:**
```bash
php artisan make:migration create_print_orders_table
```

### **Create New Model:**
```bash
php artisan make:model PrintOrder -m
```

### **Create New Controller:**
```bash
php artisan make:controller Api/Percetakan/PrintOrderController --api
```

### **Create New React Component:**
```bash
cd admin-panel
mkdir -p src/components/percetakan
touch src/components/percetakan/OrderCard.tsx
```

---

## 🎯 **LOCAL DEVELOPMENT WORKFLOW**

### **Feature Development:**

1. **Create Branch:**
```bash
git checkout -b feature/print-orders
```

2. **Backend Development:**
```bash
# Create migration
php artisan make:migration create_print_orders_table

# Run migration
php artisan migrate

# Create model & controller
php artisan make:model PrintOrder -mc

# Implement API endpoints
# Edit: app/Http/Controllers/Api/Percetakan/PrintOrderController.php
```

3. **Frontend Development:**
```bash
# Create page
touch admin-panel/src/pages/percetakan/PrintOrdersPage.tsx

# Add route in App.tsx
# Add menu item in sidebar

# Implement UI
# Edit: admin-panel/src/pages/percetakan/PrintOrdersPage.tsx
```

4. **Testing:**
```bash
# Test API
curl http://localhost:8000/api/v1/percetakan/print-orders

# Test UI
# Open browser: http://localhost:8000/admin/percetakan/print-orders
```

5. **Commit:**
```bash
git add -A
git commit -m "feat: Add print orders management"
git push origin feature/print-orders
```

---

## 📚 **USEFUL COMMANDS**

### **Laravel Commands:**
```bash
php artisan serve              # Start development server
php artisan migrate            # Run migrations
php artisan migrate:fresh      # Drop & re-migrate
php artisan db:seed            # Seed database
php artisan test               # Run tests
php artisan route:list         # List all routes
php artisan config:clear       # Clear config cache
php artisan cache:clear        # Clear application cache
php artisan view:clear         # Clear view cache
```

### **NPM Commands:**
```bash
npm run dev                    # Development with hot reload
npm run build                  # Production build
npm install                    # Install dependencies
npm outdated                   # Check outdated packages
npm audit                      # Security audit
```

### **Git Commands:**
```bash
git status                     # Check status
git add -A                     # Stage all changes
git commit -m "message"        # Commit changes
git push                       # Push to remote
git pull                       # Pull latest changes
git log --oneline              # View commit history
```

---

## ✅ **VERIFICATION CHECKLIST**

**After setup, verify:**

- [ ] Laravel server running on port 8000
- [ ] Frontend builds without errors
- [ ] Can access http://localhost:8000/admin
- [ ] Can login with admin credentials
- [ ] Percetakan menu visible in sidebar
- [ ] Can navigate to Orders page
- [ ] Can create new order
- [ ] API responds correctly
- [ ] No console errors
- [ ] Database migrations ran successfully

---

## 🚀 **READY TO DEVELOP!**

**Your local environment is ready!**

**Next Steps:**
1. ✅ Test all features locally
2. ✅ Add sample data for testing
3. ✅ Customize as needed
4. ✅ Develop new features
5. ✅ Run tests before committing

---

**Happy Coding! 💻🎉**

**Support:**
- Check `docs/TESTING_GUIDE.md` for API testing
- Check `docs/BROWSER_TESTING_GUIDE.md` for browser testing
- Check `docs/POSTMAN_COLLECTION.md` for Postman setup
