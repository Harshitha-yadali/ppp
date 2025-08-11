// src/services/paymentService.ts
import { supabase } from '../lib/supabaseClient';
import { SubscriptionPlan, Subscription } from '../types/payment'; // Assuming these types are defined

class PaymentService {
  // ... (other methods like getPlans, getAddOns, getPlanById, getAddOnById)

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    console.log('PaymentService: Fetching user subscription for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active') // Ensure we only fetch active subscriptions
        .order('created_at', { ascending: false }) // Get the latest one if multiple
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('PaymentService: Error fetching user subscription:', error);
        return null;
      }

      if (!data) {
        console.log('PaymentService: No active subscription found for user:', userId);
        return null;
      }

      // Map Supabase data to your Subscription interface
      const subscription: Subscription = {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        optimizationsUsed: data.optimizations_used,
        optimizationsTotal: data.optimizations_total,
        paymentId: data.payment_id,
        couponUsed: data.coupon_used,
        scoreChecksUsed: data.score_checks_used,
        scoreChecksTotal: data.score_checks_total,
        linkedinMessagesUsed: data.linkedin_messages_used,
        linkedinMessagesTotal: data.linkedin_messages_total,
        guidedBuildsUsed: data.guided_builds_used,
        guidedBuildsTotal: data.guided_builds_total,
      };
      console.log('PaymentService: Successfully fetched user subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('PaymentService: Unexpected error in getUserSubscription:', error);
      return null;
    }
  }

  async useOptimization(userId: string): Promise<{ success: boolean; remaining?: number; error?: string }> {
    console.log('PaymentService: Attempting to use optimization for userId:', userId);
    try {
      // 1. Fetch the current subscription to get the latest usage count
      const { data: currentSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, optimizations_used, optimizations_total')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('PaymentService: Error fetching current subscription for useOptimization:', fetchError);
        return { success: false, error: 'Failed to fetch current subscription.' };
      }

      if (!currentSubscription) {
        console.warn('PaymentService: No active subscription found for useOptimization for userId:', userId);
        return { success: false, error: 'No active subscription found.' };
      }

      const newOptimizationsUsed = currentSubscription.optimizations_used + 1;
      const remaining = currentSubscription.optimizations_total - newOptimizationsUsed;

      // 2. Check if there are enough optimizations remaining
      if (remaining < 0 && currentSubscription.optimizations_total !== Infinity) {
        console.warn('PaymentService: Optimization credits exhausted for userId:', userId);
        return { success: false, error: 'Optimization credits exhausted.' };
      }

      // 3. Update the optimizations_used count in the database
      console.log(`PaymentService: Updating optimizations_used for subscription ${currentSubscription.id} from ${currentSubscription.optimizations_used} to ${newOptimizationsUsed}`);
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          optimizations_used: newOptimizationsUsed,
          updated_at: new Date().toISOString(), // Ensure updated_at is also updated
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
        console.error('PaymentService: Error updating optimizations_used:', updateError);
        return { success: false, error: 'Failed to update optimization usage.' };
      }

      console.log(`PaymentService: Successfully used optimization for userId: ${userId}. Remaining: ${remaining}`);
      return { success: true, remaining: remaining };
    } catch (error) {
      console.error('PaymentService: Unexpected error in useOptimization:', error);
      return { success: false, error: 'An unexpected error occurred while using optimization.' };
    }
  }

  // ... (other usage methods like useScoreCheck, useLinkedInMessage, etc. should follow a similar pattern)

  // Example for useScoreCheck (similar logic to useOptimization)
  async useScoreCheck(userId: string): Promise<{ success: boolean; remaining?: number; error?: string }> {
    console.log('PaymentService: Attempting to use score check for userId:', userId);
    try {
      const { data: currentSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, score_checks_used, score_checks_total')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('PaymentService: Error fetching current subscription for useScoreCheck:', fetchError);
        return { success: false, error: 'Failed to fetch current subscription.' };
      }

      if (!currentSubscription) {
        console.warn('PaymentService: No active subscription found for useScoreCheck for userId:', userId);
        return { success: false, error: 'No active subscription found.' };
      }

      const newScoreChecksUsed = currentSubscription.score_checks_used + 1;
      const remaining = currentSubscription.score_checks_total - newScoreChecksUsed;

      if (remaining < 0 && currentSubscription.score_checks_total !== Infinity) {
        console.warn('PaymentService: Score check credits exhausted for userId:', userId);
        return { success: false, error: 'Score check credits exhausted.' };
      }

      console.log(`PaymentService: Updating score_checks_used for subscription ${currentSubscription.id} from ${currentSubscription.score_checks_used} to ${newScoreChecksUsed}`);
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          score_checks_used: newScoreChecksUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
        console.error('PaymentService: Error updating score_checks_used:', updateError);
        return { success: false, error: 'Failed to update score check usage.' };
      }

      console.log(`PaymentService: Successfully used score check for userId: ${userId}. Remaining: ${remaining}`);
      return { success: true, remaining: remaining };
    } catch (error) {
      console.error('PaymentService: Unexpected error in useScoreCheck:', error);
      return { success: false, error: 'An unexpected error occurred while using score check.' };
    }
  }
}

export const paymentService = new PaymentService();
