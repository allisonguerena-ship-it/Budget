// Backup utilities for JSON export/import
// Provides safe serialization and deserialization of app state

/**
 * Export current app data as JSON backup
 * @param {Object} data - App data object
 * @returns {string} JSON string with version and timestamp
 */
function exportDataAsJSON(data) {
  const backup = {
    version: "5",
    exportedAt: new Date().toISOString(),
    data: data
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Import data from JSON backup file
 * Validates structure and version compatibility
 * @param {string} jsonString - JSON backup content
 * @returns {Object} Validated data object
 * @throws {Error} If backup format is invalid
 */
function importDataFromJSON(jsonString) {
  let backup;
  
  try {
    backup = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
  
  // Validate structure
  if (!backup || typeof backup !== "object") {
    throw new Error("Invalid backup format: root must be an object");
  }
  
  if (!backup.data || typeof backup.data !== "object") {
    throw new Error("Invalid backup format: missing 'data' field");
  }
  
  if (!backup.version) {
    throw new Error("Invalid backup format: missing 'version' field");
  }
  
  // Warn if version mismatch
  if (backup.version !== "5") {
    console.warn(`Backup version ${backup.version} may not be fully compatible with v5`);
  }
  
  // Validate minimal required fields in data
  const required = ["currentMonth", "income", "months"];
  for (const field of required) {
    if (!(field in backup.data)) {
      throw new Error(`Invalid backup: missing required field '${field}'`);
    }
  }
  
  // Return the data portion (will be passed through loadDataWithMigration)
  return backup.data;
}

/**
 * Download JSON backup as file
 * @param {Object} data - App data to export
 */
function downloadJSONBackup(data) {
  try {
    const json = exportDataAsJSON(data);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pot-budget-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, message: "✅ JSON backup downloaded" };
  } catch (error) {
    return { success: false, message: `❌ Export failed: ${error.message}` };
  }
}

/**
 * Import JSON backup from file
 * User must confirm restore, as current data will be replaced
 * @param {File} file - JSON backup file
 * @param {Function} onSuccess - Callback on successful import
 * @param {Function} onError - Callback on error
 */
function importJSONBackupFromFile(file, onSuccess, onError) {
  if (!file) {
    onError("No file selected");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const importedData = importDataFromJSON(e.target.result);
      
      // Confirm with user before overwriting
      const monthName = importedData.currentMonth || "unknown";
      if (!confirm(`Restore backup from ${monthName}?\n\nCurrent data will be replaced with this backup.\n\nNote: You can export a backup of your current data first if you want to keep it.`)) {
        onError("Restore cancelled");
        return;
      }
      
      // Apply full migration to imported data to ensure all defaults/structure are correct
      // This replicates the migration logic from storage.js loadData()
      if (!importedData.months || typeof importedData.months !== "object") {
        throw new Error("Imported data structure invalid: missing months");
      }
      
      // Ensure all required fields with proper defaults
      importedData.currentMonth ||= monthKeyFromDate(new Date());
      importedData.openingPot = Number(importedData.openingPot ?? importedData.startingPot ?? 0) || 0;
      importedData.income = Number(importedData.income ?? 5708.68) || 0;
      importedData.fixedBills ||= [{ name: "Fixed bills legacy total", category: "Other", amount: Number(importedData.fixed) || 0, startDate: importedData.currentMonth + "-01", endDate: "", active: true }];
      importedData.cash ||= { cashStart: 0, paycheckAmount: 2854.34, payday1: 5, payday2: 20, rentDueDay: 30, rentAmount: 3098, ccDueDay: 14, ccPaymentAmount: 0, bufferTarget: 2000, locked: true };
      importedData.cash.locked = importedData.cash.locked !== false;
      importedData.plannedExpenses ||= [];
      importedData.learnedCategories ||= {};
      importedData.months ||= {};
      
      // Apply defaults to each month
      for (const [m, obj] of Object.entries(importedData.months)) {
        obj.weekStarts ||= defaultWeekStarts(m);
        obj.expenses ||= [];
        obj.finalizedWeeks ||= {};
      }
      
      // Ensure current month exists
      if (!importedData.months[importedData.currentMonth]) {
        importedData.months[importedData.currentMonth] = {
          weekStarts: defaultWeekStarts(importedData.currentMonth),
          expenses: [],
          finalizedWeeks: {}
        };
      }
      
      // Replace global data and save
      data = importedData;
      save();
      render();
      onSuccess("✅ Data restored from backup");
    } catch (error) {
      onError(`❌ Import failed: ${error.message}`);
    }
  };
  
  reader.onerror = function() {
    onError("Failed to read file");
  };
  
  reader.readAsText(file);
}
