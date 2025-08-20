// src/services/paymentService.ts
import { supabase } from '../lib/supabaseClient';
import { SubscriptionPlan, Subscription } from '../types/payment'; // Assuming these types are defined

class PaymentService {
  // Define plans data directly in the service
  private plans: SubscriptionPlan[] = [
    {
      id: 'career_pro_max',
      name: 'Career Pro Max',
      price: 1999,
      duration: 'One-time Purchase',
      durationInHours: 24 * 365 * 10, // 10 years in hours
      optimizations: 50,
      scoreChecks: 50,
      linkedinMessages: Infinity,
      guidedBuilds: 5,
      tag: 'Ultimate Value',
      tagColor: 'text-purple-800 bg-purple-100',
      gradient: 'from-purple-500 to-indigo-500',
      icon: 'crown',
      features: [
        '✅ 50 Resume Optimizations',
        '✅ 50 Score Checks',
        '✅ Unlimited LinkedIn Messages',
        '✅ 5 Guided Resume Builds',
        '✅ Priority Support',
      ],
      popular: true,
    },
    {
      id: 'career_boost_plus',
      name: 'Career Boost+',
      price: 1499,
      duration: 'One-time Purchase',
      durationInHours: 24 * 365 * 10, // 10 years in hours
      optimizations: 30,
      scoreChecks: 30,
      linkedinMessages: Infinity,
      guidedBuilds: 3,
      tag: 'Best Seller',
      tagColor: 'text-blue-800 bg-blue-100',
      gradient: 'from-blue-500 to-cyan-500',
      icon: 'zap',
      features: [
        '✅ 30 Resume Optimizations',
        '✅ 30 Score Checks',
        '✅ Unlimited LinkedIn Messages',
        '✅ 3 Guided Resume Builds',
        '✅ Standard Support',
      ],
    },
    {
      id: 'pro_resume_kit',
      name: 'Pro Resume Kit',
      price: 999,
      duration: 'One-time Purchase',
      durationInHours: 24 * 365 * 10, // 10 years in hours
      optimizations: 20,
      scoreChecks: 20,
      linkedinMessages: 100,
      guidedBuilds: 2,
      tag: 'Great Start',
      tagColor: 'text-green-800 bg-green-100',
      gradient: 'from-green-500 to-emerald-500',
      icon: 'rocket',
      features: [
        '✅ 20 Resume Optimizations',
        '✅ 20 Score Checks',
        '✅ 100 LinkedIn Messages',
        '✅ 2 Guided Resume Builds',
        '✅ Email Support',
      ],
    },
    {
      id: 'smart_apply_pack',
      name: 'Smart Apply Pack',
      price: 499,
      duration: 'One-time Purchase',
      durationInHours: 24 * 365 * 10, // 10 years in hours
      optimizations: 10,
      scoreChecks: 10,
      linkedinMessages: 50,
      guidedBuilds: 1,
      tag: 'Quick Boost',
      tagColor: 'text-yellow-800 bg-yellow-100',
      gradient: 'from-yellow-500 to-orange-500',
      icon: 'target',
      features: [
        '✅ 10 Resume Optimizations',
        '✅ 10 Score Checks',
        '✅ 50 LinkedIn Messages',
        '✅ 1 Guided Resume Build',
        '✅ Basic Support',
      ],
    },
    {
      id: 'resume_fix_pack',
      name: 'Resume Fix Pack',
      price: 199,
      duration: 'One-time Purchase',
      durationInHours: 24 * 365 * 10, // 10 years in hours
      optimizations: 5,
      scoreChecks: 2,
      linkedinMessages: 0,
      guidedBuilds: 0,
      tag: 'Essential',
      tagColor: 'text-red-800 bg-red-100',
      gradient: 'from-red-500 to-pink-500',
      icon: 'wrench',
      features: [
        '✅ 5 Resume Optimizations',
        '✅ 2 Score Checks',
        '❌ LinkedIn Messages',
        '❌ Guided Builds',
        '❌ Priority Support',
      ],
    },
    {
      id: 'lite_check',
      name: 'Lite Check',
      price: 99,
      duration: 'One-time Purchase', // Changed from 'Trial' for consistency in duration handling
      durationInHours: 24 * 365 * 10, // 10 years in hours, ensuring valid end_date for trials
      optimizations: 2,
      scoreChecks: 2,
      linkedinMessages: 10,
      guidedBuilds: 0,
      tag: 'Trial',
      tagColor: 'text-gray-800 bg-gray-100',
      gradient: 'from-gray-500 to-gray-700',
      icon: 'check_circle',
      features: [
        '✅ 2 Resume Optimizations',
        '✅ 2 Score Checks',
        '✅ 10 LinkedIn Messages',
        '❌ Guided Builds',
        '❌ Priority Support',
      ],
    },
  ];

  // Define add-ons data directly in the service
  private addOns = [
    {
      id: 'jd_optimization_single',
      name: 'JD-Based Optimization (1x)',
      price: 49,
      type: 'optimization',
      quantity: 1,
    },
    {
      id: 'guided_resume_build_single',
      name: 'Guided Resume Build (1x)',
      price: 99,
      type: 'guided_build',
      quantity: 1,
    },
    {
      id: 'resume_score_check_single',
      name: 'Resume Score Check (1x)',
      price: 19,
      type: 'score_check',
      quantity: 1,
    },
    {
      id: 'linkedin_messages_50',
      name: 'LinkedIn Messages (50x)',
      price: 29,
      type: 'linkedin_messages',
      quantity: 50,
    },
    {
      id: 'linkedin_optimization_single',
      name: 'LinkedIn Optimization (1x Review)',
      price: 199,
      type: 'linkedin_optimization',
      quantity: 1,
    },
    {
      id: 'resume_guidance_session',
      name: 'Resume Guidance Session (Live)',
      price: 299,
      type: 'guidance_session',
      quantity: 1,
    },
  ];

  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  getAddOns(): any[] {
    return this.addOns;
  }

  getPlanById(id: string): SubscriptionPlan | undefined {
    return this.plans.find((p) => p.id === id);
  }

  getAddOnById(id: string): any | undefined {
    return this.addOns.find((a) => a.id === id);
  }

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

  async useLinkedInMessage(userId: string): Promise<{ success: boolean; remaining?: number; error?: string }> {
    console.log('PaymentService: Attempting to use LinkedIn message for userId:', userId);
    try {
      const { data: currentSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id, linkedin_messages_used, linkedin_messages_total')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('PaymentService: Error fetching current subscription for useLinkedInMessage:', fetchError);
        return { success: false, error: 'Failed to fetch current subscription.' };
      }

      if (!currentSubscription) {
        console.warn('PaymentService: No active subscription found for useLinkedInMessage for userId:', userId);
        return { success: false, error: 'No active subscription found.' };
      }

      const newLinkedInMessagesUsed = currentSubscription.linkedin_messages_used + 1;
      const remaining = currentSubscription.linkedin_messages_total - newLinkedInMessagesUsed;

      if (remaining < 0 && currentSubscription.linkedin_messages_total !== Infinity) {
        console.warn('PaymentService: LinkedIn message credits exhausted for userId:', userId);
        return { success: false, error: 'LinkedIn message credits exhausted.' };
      }

      console.log(`PaymentService: Updating linkedin_messages_used for subscription ${currentSubscription.id} from ${currentSubscription.linkedin_messages_used} to ${newLinkedInMessagesUsed}`);
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          linkedin_messages_used: newLinkedInMessagesUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSubscription.id);

      if (updateError) {
        console.error('PaymentService: Error updating linkedin_messages_used:', updateError);
        return { success: false, error: 'Failed to update LinkedIn message usage.' };
      }

      console.log(`PaymentService: Successfully used LinkedIn message for userId: ${userId}. Remaining: ${remaining}`);
      return { success: true, remaining: remaining };
    } catch (error) {
      console.error('PaymentService: Unexpected error in useLinkedInMessage:', error);
      return { success: false, error: 'An unexpected error occurred while using LinkedIn message.' };
    }
  }

  async activateFreeTrial(userId: string): Promise<void> {
    console.log('PaymentService: Attempting to activate free trial for userId:', userId);
    try {
      // Check if user already has an active or past free trial
      const { data: existingTrial, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('plan_id', 'lite_check') // Assuming 'lite_check' is the free trial plan
        .maybeSingle();

      if (fetchError) {
        console.error('PaymentService: Error checking for existing free trial:', fetchError);
        throw new Error('Failed to check for existing free trial.');
      }

      if (existingTrial) {
        console.log('PaymentService: User already has a free trial, skipping activation.');
        return;
      }

      // Get the 'lite_check' plan details
      const freePlan = this.getPlanById('lite_check');
      if (!freePlan) {
        throw new Error('Free trial plan configuration not found.');
      }

      // Create a new subscription for the free trial
      const { error: insertError } = await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_id: freePlan.id,
        status: 'active',
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day free trial
        optimizations_used: 0,
        optimizations_total: freePlan.optimizations,
        score_checks_used: 0,
        score_checks_total: freePlan.scoreChecks,
        linkedin_messages_used: 0,
        linkedin_messages_total: freePlan.linkedinMessages,
        guided_builds_used: 0,
        guided_builds_total: freePlan.guidedBuilds,
        payment_id: null, // No payment for free trial
        coupon_used: 'free_trial',
      });

      if (insertError) {
        console.error('PaymentService: Error activating free trial:', insertError);
        throw new Error('Failed to activate free trial.');
      }
      console.log('PaymentService: Free trial activated successfully for userId:', userId);
    } catch (error) {
      console.error('PaymentService: Unexpected error in activateFreeTrial:', error);
      throw error;
    }
  }

  async applyCoupon(planId: string, couponCode: string, userId: string | null): Promise<{ couponApplied: string | null; discountAmount: number; finalAmount: number; error?: string }> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      return { couponApplied: null, discountAmount: 0, finalAmount: 0, error: 'Invalid plan selected' };
    }

    let discountAmount = 0;
    let finalAmount = plan.price * 100; // Convert plan price to paise

    const normalizedCoupon = couponCode.toLowerCase().trim();

    if (normalizedCoupon === 'fullsupport' && planId === 'career_pro_max') {
      discountAmount = plan.price * 100;
      finalAmount = 0;
    } else if (normalizedCoupon === 'first100' && planId === 'lite_check') {
      discountAmount = plan.price * 100;
      finalAmount = 0;
    } else if (normalizedCoupon === 'first500' && planId === 'lite_check') {
      // This coupon requires a backend check for usage limit.
      // For frontend simulation, we'll assume it's valid if it reaches here.
      // The actual check will happen in the Supabase Edge Function.
      discountAmount = Math.floor(plan.price * 100 * 0.98);
      finalAmount = (plan.price * 100) - discountAmount;
    } else if (normalizedCoupon === 'worthyone' && planId === 'career_pro_max') {
      discountAmount = Math.floor(plan.price * 100 * 0.5);
      finalAmount = (plan.price * 100) - discountAmount;
    } else {
      return { couponApplied: null, discountAmount: 0, finalAmount: plan.price * 100, error: 'Invalid coupon code or not applicable to selected plan' };
    }

    return { couponApplied: normalizedCoupon, discountAmount, finalAmount };
  }

  async processPayment(
    paymentData: { planId: string; amount: number; currency: string },
    userEmail: string,
    userName: string,
    accessToken: string,
    couponCode?: string,
    walletDeduction?: number,
    addOnsTotal?: number,
    selectedAddOns?: { [key: string]: number }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('PaymentService: Calling create-order Edge Function...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          planId: paymentData.planId,
          amount: paymentData.amount, // Amount in paise
          couponCode: couponCode,
          walletDeduction: walletDeduction, // In paise
          addOnsTotal: addOnsTotal, // In paise
          selectedAddOns: selectedAddOns,
        }),
      });

      const orderResult = await response.json();

      if (!response.ok) {
        console.error('PaymentService: Error from create-order:', orderResult.error);
        return { success: false, error: orderResult.error || 'Failed to create order.' };
      }

      const { orderId, amount, keyId, currency, transactionId } = orderResult;

      return new Promise((resolve) => {
        const options = {
          key: keyId,
          amount: amount, // Amount in paise
          currency: currency,
          name: 'PrimoBoost AI',
          description: 'Resume Optimization Plan',
          order_id: orderId,
          handler: async (response: any) => {
            try {
              console.log('PaymentService: Calling verify-payment Edge Function...');
              const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  transactionId: transactionId,
                }),
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResponse.ok && verifyResult.success) {
                resolve({ success: true });
              } else {
                console.error('PaymentService: Error from verify-payment:', verifyResult.error);
                resolve({ success: false, error: verifyResult.error || 'Payment verification failed.' });
              }
            } catch (error) {
              console.error('PaymentService: Error during payment verification:', error);
              resolve({ success: false, error: 'An error occurred during payment verification.' });
            }
          },
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: '#4F46E5', // Indigo-600
          },
          modal: {
            ondismiss: () => {
              console.log('PaymentService: Payment modal dismissed.');
              resolve({ success: false, error: 'Payment cancelled by user.' });
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      console.error('PaymentService: Error in processPayment:', error);
      return { success: false, error: (error as Error).message || 'Failed to process payment.' };
    }
  }

  async processFreeSubscription(
    planId: string,
    userId: string,
    couponCode?: string,
    addOnsTotal?: number,
    selectedAddOns?: { [key: string]: number },
    originalPlanAmount?: number, // In paise
    walletDeduction?: number // In paise
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('PaymentService: Processing free subscription...');

      // Get the plan details
      const plan = this.getPlanById(planId);
      if (!plan && planId !== 'addon_only_purchase') {
        throw new Error('Invalid plan selected for free subscription.');
      }

      // Create a pending transaction record for the free plan
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          plan_id: planId === 'addon_only_purchase' ? null : planId,
          status: 'success', // Mark as success directly for free plans
          amount: originalPlanAmount || 0, // Original plan amount in paise
          currency: 'INR',
          coupon_code: couponCode,
          discount_amount: originalPlanAmount || 0, // Full discount for free plans
          final_amount: 0, // Final amount is 0
          purchase_type: planId === 'addon_only_purchase' ? 'addon_only' : (Object.keys(selectedAddOns || {}).length > 0 ? 'plan_with_addons' : 'plan'),
          wallet_deduction_amount: walletDeduction || 0,
          payment_id: 'FREE_PLAN_ACTIVATION',
          order_id: 'FREE_PLAN_ORDER',
        })
        .select('id')
        .single();

      if (transactionError) {
        console.error('PaymentService: Error inserting free transaction:', transactionError);
        throw new Error('Failed to record free plan activation.');
      }
      const transactionId = transaction.id;

      // Process add-on credits if any
      if (selectedAddOns && Object.keys(selectedAddOns).length > 0) {
        console.log(`[${new Date().toISOString()}] - Processing add-on credits for user: ${userId}`);
        for (const addOnKey in selectedAddOns) {
          const quantity = selectedAddOns[addOnKey];
          const addOn = this.getAddOnById(addOnKey);
          if (!addOn) {
            console.error(`[${new Date().toISOString()}] - Add-on with ID ${addOnKey} not found in configuration. Skipping.`);
            continue;
          }

          const { data: addonType, error: addonTypeError } = await supabase
            .from("addon_types")
            .select("id")
            .eq("type_key", addOn.type)
            .single();

          if (addonTypeError || !addonType) {
            console.error(`[${new Date().toISOString()}] - Error finding addon_type for key ${addOn.type}:`, addonTypeError);
            continue;
          }

          const { error: creditInsertError } = await supabase
            .from("user_addon_credits")
            .insert({
              user_id: userId,
              addon_type_id: addonType.id,
              quantity_purchased: quantity,
              quantity_remaining: quantity,
              payment_transaction_id: transactionId,
            });

          if (creditInsertError) {
            console.error(`[${new Date().toISOString()}] - Error inserting add-on credits for ${addOn.type}:`, creditInsertError);
          }
        }
      }

      // Create subscription if it's a plan activation (not just add-ons)
      if (planId && planId !== 'addon_only_purchase') {
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + (plan!.durationInHours * 60 * 60 * 1000)).toISOString(),
            optimizations_used: 0,
            optimizations_total: plan!.optimizations,
            score_checks_used: 0,
            score_checks_total: plan!.scoreChecks,
            linkedin_messages_used: 0,
            linkedin_messages_total: plan!.linkedinMessages,
            guided_builds_used: 0,
            guided_builds_total: plan!.guidedBuilds,
            payment_id: 'FREE_PLAN_ACTIVATION',
            coupon_used: couponCode,
          })
          .select()
          .single();

        if (subscriptionError) {
          console.error('PaymentService: Subscription creation error for free plan:', subscriptionError);
          throw new Error('Failed to create subscription for free plan.');
        }

        // Update payment transaction with subscription ID
        const { error: updateSubscriptionIdError } = await supabase
          .from("payment_transactions")
          .update({ subscription_id: subscription.id })
          .eq("id", transactionId);

        if (updateSubscriptionIdError) {
          console.error("Error updating payment transaction with subscription_id for free plan:", updateSubscriptionIdError);
        }
      }

      // Handle wallet deduction for free plans
      if (walletDeduction && walletDeduction > 0) {
        const { error: walletError } = await supabase
          .from("wallet_transactions")
          .insert({
            user_id: userId,
            type: "purchase_use",
            amount: -(walletDeduction), // Store as negative for deduction
            status: "completed",
            transaction_ref: `free_plan_deduction_${transactionId}`,
            redeem_details: {
              plan_id: planId,
              original_amount: originalPlanAmount ? originalPlanAmount / 100 : 0,
              addons_purchased: selectedAddOns,
            },
          });

        if (walletError) {
          console.error(`[${new Date().toISOString()}] - Wallet deduction recording error for free plan:`, walletError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('PaymentService: Error in processFreeSubscription:', error);
      return { success: false, error: (error as Error).message || 'Failed to activate free subscription.' };
    }
  }
}

export const paymentService = new PaymentService();
