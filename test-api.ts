import { getReviewDashboardSnapshot } from './src/lib/place-review-store.ts';

async function run() {
  const data = await getReviewDashboardSnapshot(1000);
  console.log("Raw results:", data.rawResults.length);
  console.log("Stats pending:", data.stats.pendingRawPlaces);
}
run();
