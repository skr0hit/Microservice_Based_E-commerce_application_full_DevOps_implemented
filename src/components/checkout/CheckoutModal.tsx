import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { CreditCard, MapPin, User, Mail } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [shippingData, setShippingData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: user?.name || ''
  });
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearCart();
    setIsProcessing(false);
    setCurrentStep(4); // Success step
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <Input
              label="Street Address"
              placeholder="123 Main Street"
              value={shippingData.street}
              onChange={(value) => setShippingData({ ...shippingData, street: value })}
              icon={MapPin}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="New York"
                value={shippingData.city}
                onChange={(value) => setShippingData({ ...shippingData, city: value })}
                required
              />
              <Input
                label="State"
                placeholder="NY"
                value={shippingData.state}
                onChange={(value) => setShippingData({ ...shippingData, state: value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                placeholder="10001"
                value={shippingData.zipCode}
                onChange={(value) => setShippingData({ ...shippingData, zipCode: value })}
                required
              />
              <Input
                label="Country"
                value={shippingData.country}
                onChange={(value) => setShippingData({ ...shippingData, country: value })}
                required
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <Input
              label="Name on Card"
              placeholder="John Doe"
              value={paymentData.nameOnCard}
              onChange={(value) => setPaymentData({ ...paymentData, nameOnCard: value })}
              icon={User}
              required
            />
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={(value) => setPaymentData({ ...paymentData, cardNumber: value })}
              icon={CreditCard}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentData.expiryDate}
                onChange={(value) => setPaymentData({ ...paymentData, expiryDate: value })}
                required
              />
              <Input
                label="CVV"
                placeholder="123"
                value={paymentData.cvv}
                onChange={(value) => setPaymentData({ ...paymentData, cvv: value })}
                required
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            
            {/* Order Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 py-2">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentStep === 4 ? '' : 'Checkout'}
      size="lg"
    >
      <div className="p-6">
        {currentStep < 4 && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        )}
        
        {renderStep()}
        
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep === 3 ? (
              <Button
                onClick={handlePlaceOrder}
                loading={isProcessing}
              >
                Place Order
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}