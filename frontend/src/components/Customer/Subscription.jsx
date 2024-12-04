import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userServices';
import { 
  CheckCircleIcon, 
  StarIcon, 
  BoltIcon, 
  ShieldCheckIcon 
} from 'lucide-react';

const SubscriptionPage = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Subscription plans configuration
  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: '₹0',
      features: [
        'Basic delivery tracking',
        'Standard support',
        'Limited features'
      ],
      icon: StarIcon,
      currentPlan: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₹599/year',
      features: [
        'Faster deliveries',
        'Priority support',
        'Advanced tracking',
        'Monthly insights'
      ],
      icon: BoltIcon,
      currentPlan: false
    },
    {
      id: 'pro plus',
      name: 'Pro Plus Plan',
      price: '₹899/year',
      features: [
        'Fastest deliveries',
        'VIP customer support',
        'Comprehensive insights',
        'Priority issue resolution',
        'Exclusive features'
      ],
      icon: ShieldCheckIcon,
      currentPlan: false
    }
  ];

  // Fetch current subscription on component mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscription = await userService.getCurrentSubscription();
        setCurrentSubscription(subscription);

        // Mark current plan
        subscriptionPlans.forEach(plan => {
          plan.currentPlan = plan.id === subscription?.tier;
        });
      } catch (err) {
        console.error('Error fetching subscription:', err);
      }
    };

    fetchSubscription();
  }, []);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setError(null);
    setSelectedPlan(plan);

    try {
      // If user has current plan, show upgrade/manage options
      if (currentSubscription) {
        if (plan === currentSubscription.tier) {
          navigate('/account/manage-subscription');
          return;
        }
      }

      // Fetch Stripe session URL
      const { sessionUrl } = await userService.purchaseSubscription(plan);
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Error during subscription:', err.message);
      setError('Failed to initiate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await userService.cancelSubscription();
      setCurrentSubscription(null);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
        Choose Your Subscription
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Unlock powerful features and enhance your delivery experience
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
          {error}
        </div>
      )}

      {currentSubscription && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center mb-6 flex items-center justify-center">
          <CheckCircleIcon className="mr-2" />
          Currently Subscribed to {currentSubscription.tier.toUpperCase()} Plan
          <button 
            onClick={handleCancelSubscription}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const PlanIcon = plan.icon;
          return (
            <div 
              key={plan.id}
              className={`
                relative p-6 border rounded-lg transition-all duration-300 
                ${plan.currentPlan 
                  ? 'border-green-500 bg-green-50 scale-105' 
                  : 'border-gray-300 hover:scale-105 hover:shadow-lg'}
                ${selectedPlan === plan.id ? 'ring-2 ring-green-500' : ''}
              `}
              onMouseEnter={() => setSelectedPlan(plan.id)}
              onMouseLeave={() => setSelectedPlan(null)}
              onClick={() => handleSubscribe(plan.id)}
            >
              <div className="flex flex-col items-center">
                <PlanIcon 
                  className={`
                    w-12 h-12 mb-4 
                    ${plan.currentPlan ? 'text-green-600' : 'text-blue-500'}
                  `} 
                />
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-800 mb-4">{plan.price}</p>
                
                <ul className="w-full text-left mb-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-sm text-gray-600"
                    >
                      <CheckCircleIcon 
                        className={`
                          mr-2 w-4 h-4 
                          ${plan.currentPlan ? 'text-green-500' : 'text-blue-500'}
                        `} 
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`
                    w-full py-2 px-4 rounded-md font-semibold 
                    ${plan.currentPlan 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-500 text-white hover:bg-green-600'}
                    disabled:bg-gray-400
                  `}
                  disabled={loading}
                >
                  {plan.currentPlan 
                    ? 'Current Plan' 
                    : (loading && selectedPlan === plan.id 
                      ? 'Processing...' 
                      : 'Select Plan')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        By subscribing, you agree to our{' '}
        <a 
          href="/terms" 
          className="text-green-500 hover:underline"
        >
          Terms and Conditions
        </a>
        .
      </div>
    </div>
  );
};

export default SubscriptionPage;