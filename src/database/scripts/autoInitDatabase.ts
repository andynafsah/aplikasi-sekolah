import fs from 'fs';
import path from 'path';
import { ConnectionManager } from '../connection/ConnectionManager';

/**
 * Enterprise Database Automatic Initialization Service (Opsi B)
 * Programmatically parses and executes SQL schema statements sequentially.
 */
export async function initializeDatabaseSchemaProgrammatically(): Promise<{
  success: boolean;
  totalStatementsExecuted: number;
  message: string;
  error?: string;
}> {
  console.log('[DB-INIT] Starting Programmatic Database Initialization (Opsi B)...');
  
  // 1. Locate the master SQL schema file
  const sqlPath = path.resolve(process.cwd(), 'mysql_sprint29_master.sql');
  if (!fs.existsSync(sqlPath)) {
    return {
      success: false,
      totalStatementsExecuted: 0,
      message: `SQL Schema file not found at path: ${sqlPath}`
    };
  }

  // 2. Read the file contents
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // 3. Parse SQL statements safely
  const statements = parseSqlStatements(sqlContent);
  console.log(`[DB-INIT] Parsed ${statements.length} valid SQL statements from mysql_sprint29_master.sql`);

  // 4. Retrieve database provider instance
  const provider = ConnectionManager.getInstance().getProvider();
  let totalStatementsExecuted = 0;

  try {
    // 5. Run table creation within a safe transactional lifecycle if supported,
    // or run statement-by-statement for DDL operations
    // Note: DDL operations (CREATE/DROP) in MySQL trigger implicit commit,
    // so we execute them sequentially with foreign key checks managed correctly.
    
    // Disable Foreign Key Checks during initialization
    await provider.execute('SET FOREIGN_KEY_CHECKS = 0');

    for (const statement of statements) {
      const cleanStatement = statement.trim();
      if (!cleanStatement) continue;

      try {
        await provider.execute(cleanStatement);
        totalStatementsExecuted++;
      } catch (stmtError: any) {
        console.error(`[DB-INIT] Failed executing statement #${totalStatementsExecuted + 1}:`);
        console.error(`Statement: ${cleanStatement.substring(0, 150)}...`);
        console.error(`Error: ${stmtError.message}`);
        
        // Re-enable Foreign Key Checks before throwing
        await provider.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        throw new Error(`Statement execution failed: ${stmtError.message}`);
      }
    }

    // Re-enable Foreign Key Checks
    await provider.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`[DB-INIT] Success! Executed ${totalStatementsExecuted} database DDL/DML statements.`);
    return {
      success: true,
      totalStatementsExecuted,
      message: `Database schema has been initialized successfully. ${totalStatementsExecuted} queries executed.`
    };
  } catch (error: any) {
    console.error('[DB-INIT] Critical Error during programmatic initialization:', error);
    return {
      success: false,
      totalStatementsExecuted,
      message: 'Database schema initialization failed programmatically.',
      error: error.message || String(error)
    };
  }
}

/**
 * Safely parses raw SQL strings into an array of executable individual queries
 */
function parseSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  const lines = sql.split('\n');
  let currentStatement = '';

  for (let line of lines) {
    // Remove leading/trailing whitespaces
    line = line.trim();

    // Skip empty lines or single-line comments (-- or #)
    if (!line || line.startsWith('--') || line.startsWith('#')) {
      continue;
    }

    // Append line to current statement
    currentStatement += (currentStatement ? ' ' : '') + line;

    // Check if the statement ends with a semicolon
    if (line.endsWith(';')) {
      statements.push(currentStatement);
      currentStatement = '';
    }
  }

  // Add final statement if any remaining
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}
