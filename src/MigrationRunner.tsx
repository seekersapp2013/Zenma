import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AdminLayout } from "./AdminLayout";

export function MigrationRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>("");

  const migrateToCategoryItems = useMutation(api.migrateCategoryItems.migrateToCategoryItems);

  const handleRunMigration = async () => {
    if (!confirm("This will migrate existing items to the new many-to-many category system. Continue?")) {
      return;
    }

    setIsRunning(true);
    setResult("");

    try {
      const migrationResult = await migrateToCategoryItems();
      setResult(JSON.stringify(migrationResult, null, 2));
      alert("Migration completed successfully!");
    } catch (error) {
      setResult(`Error: ${error}`);
      alert(`Migration failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AdminLayout currentPage="settings" pageTitle="Database Migration">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div style={{
              backgroundColor: '#2b2b31',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>
                Category Items Migration
              </h3>
              
              <div style={{ 
                backgroundColor: '#1a1a1a', 
                padding: '20px', 
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #404040'
              }}>
                <h5 style={{ color: '#ff9800', marginBottom: '15px' }}>
                  ⚠️ What does this migration do?
                </h5>
                <ul style={{ color: '#b3b3b3', lineHeight: '1.8' }}>
                  <li>Creates many-to-many relationships between movies and categories</li>
                  <li>Allows movies to appear in multiple categories</li>
                  <li>Preserves all existing data</li>
                  <li>Safe to run multiple times (skips existing relationships)</li>
                </ul>
              </div>

              <div style={{ 
                backgroundColor: '#1a4d1a', 
                padding: '15px', 
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #4caf50'
              }}>
                <p style={{ color: '#4caf50', margin: 0 }}>
                  ✓ This migration is backward compatible and won't break existing functionality
                </p>
              </div>

              <button
                onClick={handleRunMigration}
                disabled={isRunning}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isRunning ? '#666' : '#ff1493',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  width: '100%',
                  marginBottom: '20px'
                }}
              >
                {isRunning ? 'Running Migration...' : 'Run Migration'}
              </button>

              {result && (
                <div style={{
                  backgroundColor: '#1a1a1a',
                  padding: '15px',
                  borderRadius: '6px',
                  border: '1px solid #404040',
                  marginTop: '20px'
                }}>
                  <h5 style={{ color: '#fff', marginBottom: '10px' }}>Result:</h5>
                  <pre style={{ 
                    color: '#4caf50', 
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {result}
                  </pre>
                </div>
              )}

              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #404040' }}>
                <h5 style={{ color: '#fff', marginBottom: '15px' }}>After Migration:</h5>
                <ol style={{ color: '#b3b3b3', lineHeight: '1.8' }}>
                  <li>Go to the Movies page to manage all movies</li>
                  <li>Go to Categories page to import movies into categories</li>
                  <li>Movies can now appear in multiple categories</li>
                  <li>Removing a movie from a category won't delete it</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
