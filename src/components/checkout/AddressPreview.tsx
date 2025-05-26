
import React from 'react';

interface AddressPreviewProps {
  selectedAddress: string;
}

const AddressPreview: React.FC<AddressPreviewProps> = ({ selectedAddress }) => {
  if (!selectedAddress) return null;

  return (
    <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
      <h4 className="font-medium mb-2">Selected Address:</h4>
      <p className="text-sm">{selectedAddress}</p>
    </div>
  );
};

export default AddressPreview;
