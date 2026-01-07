import { SeedOrchestrator } from './src/seed/core/SeedOrchestrator';

async function runOrchestrator() {
  console.log('🌱 Running new modular seeders via SeedOrchestrator...\n');
  
  const orchestrator = new SeedOrchestrator({
    branchId: 'dps-main',
    verbose: true,
    dryRun: false,
    batchSize: 100,
    parallel: false,
    useCheckpoints: false
  });
  
  const result = await orchestrator.seed();
  
  console.log('\n📊 Final results:');
  console.log(`Success: ${result.success}`);
  console.log(`Total seeders run: ${result.results.length}`);
  
  result.results.forEach(r => {
    console.log(`  ${r.entityName}: ${r.metrics.successCount}/${r.metrics.totalRecords} records`);
  });
}

runOrchestrator().catch(console.error);