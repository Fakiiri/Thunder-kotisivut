// Read-only operator check. Run with the existing DATABASE_URL in the environment.
// Prints aggregate queue counts only; never addresses, tokens, keys or project content.
import { MysqlVault } from "./vault";
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required in the environment.");
    process.exitCode = 1;
  } else {
    const repo = new MysqlVault(url);
    try {
      const health = await repo.syncHealth();
      console.log(JSON.stringify({ coverJourney: health }));
      if (health.review || health.oldestDueSeconds > 300) process.exitCode = 2;
    } catch {
      console.error(
        "Cover queue health unavailable. Check database connectivity and schema."
      );
      process.exitCode = 1;
    } finally {
      await repo.pool.end();
    }
  }
}
void main().catch(() => {
  console.error("Cover queue status check failed.");
  process.exitCode = 1;
});
