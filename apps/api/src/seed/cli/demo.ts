/**
 * Demo script to showcase the beautiful CLI
 */

import * as p from '@clack/prompts';
import color from 'picocolors';

async function demo() {
  console.clear();
  
  p.intro(color.bgCyan(color.black(' 🌱 Paramarsh SMS - Seed Data Manager v3.0 ')));

  // Simulate showing the menu
  console.log(color.gray('\n┌ What would you like to do?'));
  console.log(color.gray('│'));
  console.log(color.cyan('│  ●  🌱 Seed Data - Create test data for a branch'));
  console.log(color.gray('│  ○  🌳 Multi-Seed - Seed multiple branches at once'));
  console.log(color.gray('│  ○  ✅ Validate - Check existing data integrity'));
  console.log(color.gray('│  ○  🧹 Cleanup - Remove seeded data'));
  console.log(color.gray('│  ○  📊 Status - View seeding statistics'));
  console.log(color.gray('│  ○  👋 Exit'));
  console.log(color.gray('└'));

  // Simulate seeding process
  const s = p.spinner();
  s.start('Seeding Delhi Public School - Main Campus');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  s.stop('✅ Seeding completed successfully!');

  // Show results
  const results = `
Branch: ${color.cyan('dps-main')}
Total Records: ${color.green('827')}
Duration: ${color.yellow('3245ms')}

Entity Breakdown:
  ✅ tenants: ${color.blue('1')} records
  ✅ academicYears: ${color.blue('3')} records
  ✅ subjects: ${color.blue('12')} records
  ✅ classes: ${color.blue('24')} records
  ✅ teachers: ${color.blue('45')} records
  ✅ students: ${color.blue('500')} records
  ✅ guardians: ${color.blue('242')} records

Memory Usage: ${color.magenta('42MB')}`;

  p.note(results.trim(), '📊 Seeding Results');

  // Show beautiful progress bars
  console.log('\n' + color.bold('Progress Overview:'));
  
  const entities = [
    { name: 'Tenants', progress: 100, color: color.green },
    { name: 'Academic Years', progress: 100, color: color.green },
    { name: 'Subjects', progress: 100, color: color.blue },
    { name: 'Classes', progress: 100, color: color.blue },
    { name: 'Teachers', progress: 100, color: color.yellow },
    { name: 'Students', progress: 85, color: color.cyan },
    { name: 'Guardians', progress: 70, color: color.magenta },
  ];

  entities.forEach(entity => {
    const filled = Math.floor(entity.progress / 5);
    const empty = 20 - filled;
    const bar = entity.color('█'.repeat(filled)) + color.gray('░'.repeat(empty));
    console.log(`${entity.name.padEnd(15)} ${bar} ${entity.progress}%`);
  });

  p.outro(color.cyan('\n✨ Thanks for using Paramarsh SMS Seed Manager! ✨'));
}

demo().catch(console.error);