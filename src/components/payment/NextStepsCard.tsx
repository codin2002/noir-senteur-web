
import React from 'react';

const NextStepsCard = () => {
  return (
    <div className="mt-12 p-6 bg-darker/50 border border-gold/10 rounded-lg max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
      <ul className="text-muted-foreground text-left space-y-2">
        <li>• You will receive an order confirmation email shortly</li>
        <li>• Your order will be processed within 1-2 business days</li>
        <li>• Delivery typically takes 2-4 business days</li>
      </ul>
    </div>
  );
};

export default NextStepsCard;
