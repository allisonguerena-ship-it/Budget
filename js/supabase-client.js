// Supabase client and database queries
// This module abstracts all Supabase interactions

class SupabaseDataClient {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Budget operations
   */

  async getBudget(userId) {
    const { data, error } = await this.supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data;
  }

  async upsertBudget(userId, budgetData) {
    const { data, error } = await this.supabase
      .from("budgets")
      .upsert({
        user_id: userId,
        current_month: budgetData.currentMonth,
        income: budgetData.income,
        opening_pot: budgetData.openingPot,
        learned_categories: budgetData.learnedCategories || {},
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Fixed bills operations
   */

  async getFixedBills(userId) {
    const { data, error } = await this.supabase
      .from("fixed_bills")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async upsertFixedBill(userId, bill) {
    const { data, error } = await this.supabase
      .from("fixed_bills")
      .upsert({
        id: bill.id,
        user_id: userId,
        name: bill.name,
        category: bill.category,
        amount: bill.amount,
        start_date: bill.startDate,
        end_date: bill.endDate || "",
        active: bill.active,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFixedBill(billId) {
    const { error } = await this.supabase
      .from("fixed_bills")
      .delete()
      .eq("id", billId);

    if (error) throw error;
  }

  /**
   * Cash flow settings operations
   */

  async getCashFlowSettings(userId) {
    const { data, error } = await this.supabase
      .from("cash_flow_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async upsertCashFlowSettings(userId, settings) {
    const { data, error } = await this.supabase
      .from("cash_flow_settings")
      .upsert({
        user_id: userId,
        cash_start: settings.cashStart,
        paycheck_amount: settings.paycheckAmount,
        payday_1: settings.payday1,
        payday_2: settings.payday2,
        rent_due_day: settings.rentDueDay,
        rent_amount: settings.rentAmount,
        cc_due_day: settings.ccDueDay,
        cc_payment_amount: settings.ccPaymentAmount,
        buffer_target: settings.bufferTarget,
        locked: settings.locked,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Planned expenses operations
   */

  async getPlannedExpenses(userId) {
    const { data, error } = await this.supabase
      .from("planned_expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async upsertPlannedExpense(userId, expense) {
    const { data, error } = await this.supabase
      .from("planned_expenses")
      .upsert({
        id: expense.id,
        user_id: userId,
        date: expense.date,
        description: expense.desc,
        type: expense.type,
        amount: expense.amount,
        paid: expense.paid,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePlannedExpense(expenseId) {
    const { error } = await this.supabase
      .from("planned_expenses")
      .delete()
      .eq("id", expenseId);

    if (error) throw error;
  }

  /**
   * Months operations
   */

  async getMonth(userId, monthKey) {
    const { data, error } = await this.supabase
      .from("months")
      .select("*")
      .eq("user_id", userId)
      .eq("month_key", monthKey)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async getAllMonths(userId) {
    const { data, error } = await this.supabase
      .from("months")
      .select("*")
      .eq("user_id", userId)
      .order("month_key", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async upsertMonth(userId, monthKey, monthData) {
    const { data, error } = await this.supabase
      .from("months")
      .upsert({
        user_id: userId,
        month_key: monthKey,
        week_starts: monthData.weekStarts || [],
        expenses: monthData.expenses || [],
        finalized_weeks: monthData.finalizedWeeks || {},
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,month_key" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Batch operations for initial sync
   */

  async getAllUserData(userId) {
    try {
      const [budget, fixedBills, cashFlow, plannedExpenses, months] = await Promise.all([
        this.getBudget(userId),
        this.getFixedBills(userId),
        this.getCashFlowSettings(userId),
        this.getPlannedExpenses(userId),
        this.getAllMonths(userId)
      ]);

      return {
        budget,
        fixedBills,
        cashFlow,
        plannedExpenses,
        months
      };
    } catch (error) {
      console.error("Failed to fetch all user data:", error);
      throw error;
    }
  }

  /**
   * Real-time subscriptions
   */

  subscribeToUpdates(userId, callback) {
    const subscription = this.supabase
      .channel(`user:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", filter: `user_id=eq.${userId}` },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
}

// Export class - will be instantiated with Supabase client
