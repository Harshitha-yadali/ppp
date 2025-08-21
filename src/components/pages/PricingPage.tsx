// src/components/pages/PricingPage.tsx
import React, { useState } from 'react';
import {
  Check,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
  PlusCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Award,
  Shield,
  Clock,
  Users,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';

interface PricingPageProps {
  onShowAuth: () => void;
  onShowSubscriptionPlans: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onShowAuth,
  onShowSubscriptionPlans
}) => {
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('career_boost_plus');

  // Defensive initialization: Ensure plans and addOns are always arrays
  // This explicitly checks if the result of getPlans()/getAddOns() is an array.
  const plans = Array.isArray(paymentService?.getPlans()) ? paymentService.getPlans() : [];
  const addOns = Array.isArray(paymentService?.getAddOns()) ? paymentService.getAddOns() : [];

  console.log('PricingPage: plans value (after defensive check):', plans);
  console.log('PricingPage: addOns value (after defensive check):', addOns);

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'JD-Based Optimization',
      description: 'AI analyzes job descriptions and tailors your resume for maximum ATS compatibility and recruiter appeal.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Resume Score Analysis',
      description: 'Get detailed scoring across 9 categories with specific improvement recommendations.'
    },
    {
      icon: <PlusCircle className="w-8 h-8" />,
      title: 'Guided Resume Builder',
      description: 'Step-by-step AI-powered resume creation from scratch with professional templates.'
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'LinkedIn Message Generator',
      description: 'Create personalized connection requests and outreach messages that get responses.'
    }
  ];

  const faqs = [
    {
      question: 'How does the AI resume optimization work?',
      answer: 'Our AI analyzes your resume against job descriptions, identifies gaps, and suggests improvements for better ATS compatibility and recruiter appeal.'
    },
    {
      question: 'What happens when I run out of credits?',
      answer: 'You can purchase individual tool credits or upgrade to a higher plan. All credits are clearly tracked in your dashboard.'
    },
    {
      question: 'Are the payments secure?',
      answer: 'Yes, we use Razorpay for secure payment processing with bank-level encryption. We never store your payment information.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with the results, contact us for a full refund.'
    }
  ];

  const getPlanIcon = (iconType: string) => {
    switch (iconType) {
      case 'crown': return <Crown className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'rocket': return <Award className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-50 dark:to-dark-200 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white dark:from-neon-cyan-500 dark:to-neon-purple-500">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg dark:bg-neon-cyan-500/20 dark:shadow-neon-cyan">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Choose Your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dark:from-neon-cyan-300 dark:to-neon-blue-300">
                Success Plan
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 dark:text-gray-200 mb-8 leading-relaxed">
              Flexible pricing for every career stage. Start free, upgrade when you need more power.
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="py-20 bg-white dark:bg-dark-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">What You Get</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Professional AI-powered tools to transform your career prospects
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 h-full border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 dark:from-dark-200 dark:to-dark-300 dark:border-dark-400 dark:hover:shadow-neon-cyan/20">
                    <div className="text-blue-600 dark:text-neon-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-dark-200 dark:to-dark-300">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your needs. All plans include our core AI optimization features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/20 ring-4 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        🏆 Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className={`bg-gradient-to-r ${plan.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                        {getPlanIcon(plan.icon)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        ₹{plan.price}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{plan.duration}</p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 text-center mb-6 dark:from-dark-200 dark:to-dark-300">
                      <div className="text-3xl font-bold text-blue-600 dark:text-neon-cyan-400">{plan.optimizations}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Resume Optimizations</div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          onShowSubscriptionPlans();
                        } else {
                          onShowAuth();
                        }
                      }}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-300 dark:hover:bg-dark-300'
                      }`}
                    >
                      {isAuthenticated ? 'Select Plan' : 'Sign Up & Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Individual Tool Pricing */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Or Buy Individual Tools
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Need just one optimization? Purchase individual tool credits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {addOns.filter(addon => addon.id.includes('_purchase')).map((addon) => (
                  <div key={addon.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 dark:bg-dark-100 dark:border-dark-300">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                        <Target className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{addon.name}</h4>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">₹{addon.price}</div>
                      <button
                        onClick={() => {
                          if (isAuthenticated) {
                            onShowSubscriptionPlans();
                          } else {
                            onShowAuth();
                          }
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Purchase Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white dark:bg-dark-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">Everything you need to know about our pricing and features</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 dark:bg-dark-200 dark:border-dark-300">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-start">
                    <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 dark:bg-neon-cyan-500/20">
                      <span className="text-blue-600 dark:text-neon-cyan-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-9">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white dark:from-neon-cyan-500 dark:to-neon-purple-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
            <p className="text-xl text-blue-100 dark:text-gray-200 mb-8">
              Join thousands of professionals who have already upgraded their resumes and landed their dream jobs.
            </p>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onShowSubscriptionPlans();
                } else {
                  onShowAuth();
                }
              }}
              className="bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 dark:bg-dark-100 dark:text-neon-cyan-400 dark:hover:bg-dark-200 dark:shadow-neon-cyan"
            >
              Start Optimizing Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
