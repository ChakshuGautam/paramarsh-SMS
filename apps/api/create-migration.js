const { execSync } = require('child_process');

// Set environment to be interactive
process.env.CI = '';

try {
  console.log('Creating new migration...');
  execSync('npx prisma migrate dev --name init_complete_schema --create-only', {
    stdio: 'inherit',
    env: { ...process.env, CI: '' }
  });
  console.log('Migration created successfully!');
} catch (error) {
  console.error('Error creating migration:', error.message);
  process.exit(1);
}