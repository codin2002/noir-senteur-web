
import React from 'react';

const NextStepsCard = () => {
  return (
    <div className="mt-12 p-6 bg-darker/50 border border-gold/10 rounded-lg max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">Important Note</h3>
      <p className="text-muted-foreground text-left">
        Kindly wait until you are redirected back to the website after payment; do not close the tab or exit the website or your order will not be processed.
      </p>
    </div>
  );
};

export default NextStepsCard;
