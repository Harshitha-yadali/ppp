// src/components/payment/PlanSelectionModal.tsx
import React, { useState } from 'react';
import { X, Sparkles, Target, Briefcase, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCareerPlans: () => void;
  onSubscriptionSuccess: () => void;
  onShowAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error', actionText?: string, onAction?: () => void) => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCareerPlans,
  onSubscriptionSuccess,
  onShowAlert,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePurchaseJDOptimizer = async () => {
    if (!user) {
      onShowAlert('Authentication Required', 'Please sign in to complete your purchase.', 'error', 'Sign In', () => {});
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const jdOptimizerAddOn = paymentService.getAddOnById('jd_optimization_single_purchase');
      if (!jdOptimizerAddOn) {
        throw new Error('JD-Based Optimization product not found.');
      }

      const { data: { session }, error: sessionError } = await paymentService.supabase.auth.getSession();
      if (sessionError || !session || !session.access_token) {
        throw new Error('No active session found. Please log in again.');
      }

      const paymentData = {
        planId: 'addon_only_purchase', // Special ID for add-on only purchase
        amount: jdOptimizerAddOn.price * 100, // Convert to paise
        currency: 'INR',
      };

      const selectedAddOns = {
        [jdOptimizerAddOn.id]: jdOptimizerAddOn.quantity,
      };

      const result = await paymentService.processPayment(
        paymentData,
        user.email,
        user.name,
        session.access_token,
        undefined, // No coupon
        0, // No wallet deduction for this direct purchase
        jdOptimizerAddOn.price * 100, // Total add-ons amount
        selectedAddOns
      );

      if (result.success) {
        onSubscriptionSuccess(); // Refresh user's subscription status
        onShowAlert('Purchase Successful!', 'Your JD-Based Optimization credit has been added.', 'success');
        onClose();
        navigate('/optimizer'); // Redirect to the optimizer page
      } else {
        setError(result.error || 'Payment failed. Please try again.');
        onShowAlert('Payment Failed', result.error || 'Payment processing failed. Please try again.', 'error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      onShowAlert('Error', err instanceof Error ? err.message : 'An unexpected error occurred.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm dark:bg-black/80">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto dark:bg-dark-100 dark:shadow-dark-xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-gray-200 dark:from-dark-200 dark:to-dark-300 dark:border-dark-400">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50 z-10 min-w-[44px] min-h-[44px] dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-dark-300/50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <div className="bg-gradient-to-br from-neon-cyan-500 to-neon-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg dark:shadow-neon-cyan">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Choose Your Path to Success
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Select the option that best fits your resume optimization needs.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-500/50">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handlePurchaseJDOptimizer}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed dark:from-neon-cyan-500 dark:to-neon-blue-500 dark:hover:from-neon-cyan-400 dark:hover:to-neon-blue-400 dark:shadow-neon-cyan"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span>Purchase JD-Based Optimization (1 Use)</span>
              </>
            )}
          </button>

          <button
            onClick={onSelectCareerPlans}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed dark:from-neon-purple-500 dark:to-neon-pink-500 dark:hover:from-neon-purple-400 dark:hover:to-neon-pink-400 dark:shadow-neon-purple"
          >
            <Briefcase className="w-5 h-5" />
            <span>Explore Career Plans</span>
          </button>
        </div>
      </div>
    </div>
  );
};
