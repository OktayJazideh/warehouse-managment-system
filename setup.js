#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏭 Warehouse Management System Setup');
console.log('=====================================\n');

// Check if Node.js version is sufficient
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required.');
    console.error(`Current version: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if PostgreSQL is installed
try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed');
} catch (error) {
    console.log('⚠️ PostgreSQL not found in PATH. Please ensure PostgreSQL is installed and accessible.');
}

// Function to run command with error handling
function runCommand(command, cwd = process.cwd()) {
    try {
        console.log(`🔄 Running: ${command}`);
        execSync(command, { cwd, stdio: 'inherit' });
        console.log('✅ Command completed successfully\n');
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

// Setup backend
console.log('📦 Setting up backend dependencies...');
if (!fs.existsSync(path.join(__dirname, 'backend', 'node_modules'))) {
    runCommand('npm install', path.join(__dirname, 'backend'));
} else {
    console.log('✅ Backend dependencies already installed\n');
}

// Setup frontend
console.log('🎨 Setting up frontend dependencies...');
if (!fs.existsSync(path.join(__dirname, 'frontend', 'node_modules'))) {
    runCommand('npm install', path.join(__dirname, 'frontend'));
} else {
    console.log('✅ Frontend dependencies already installed\n');
}

// Copy environment file
const envExamplePath = path.join(__dirname, 'backend', '.env.example');
const envPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Environment file created (.env)');
        console.log('⚠️ Please update the database credentials in backend/.env\n');
    } else {
        console.log('⚠️ .env.example not found, creating default .env file...');
        const defaultEnv = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warehouse_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Upload Configuration
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880`;
        
        fs.writeFileSync(envPath, defaultEnv);
        console.log('✅ Default .env file created');
        console.log('⚠️ Please update the database credentials in backend/.env\n');
    }
} else {
    console.log('✅ Environment file already exists\n');
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update database credentials in backend/.env');
console.log('2. Create PostgreSQL database: warehouse_db');
console.log('3. Run database setup: cd backend && npm run setup');
console.log('4. Start backend: cd backend && npm run dev');
console.log('5. Start frontend: cd frontend && npm run dev');
console.log('\n🌐 Access the application:');
console.log('- Frontend: http://localhost:8080');
console.log('- Backend API: http://localhost:3000');
console.log('\n👤 Default login credentials:');
console.log('- Admin: username=admin, password=admin123');
console.log('- Manager: username=manager, password=manager123');
console.log('\n📚 For more information, see README.md');