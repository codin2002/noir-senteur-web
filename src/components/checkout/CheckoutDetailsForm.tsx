import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckoutDetails, UAE_EMIRATES, isValidUaeMobile } from '@/utils/checkoutDetails';

interface CheckoutDetailsFormProps {
  details: CheckoutDetails;
  onChange: (details: CheckoutDetails) => void;
  disabled?: boolean;
  idPrefix: string;
}

const fieldClass = 'h-12 rounded-lg border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-gold/60';

const CheckoutDetailsForm: React.FC<CheckoutDetailsFormProps> = ({ details, onChange, disabled = false, idPrefix }) => {
  const setField = <K extends keyof CheckoutDetails>(field: K, value: CheckoutDetails[K]) => {
    onChange({ ...details, [field]: value });
  };
  const phoneStarted = details.phoneNumber.trim().length > 0;
  const emailInvalid = details.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-name`} className="mb-2 block text-sm text-white/80">Full name *</Label>
          <Input
            id={`${idPrefix}-name`}
            autoComplete="name"
            value={details.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Your full name"
            className={fieldClass}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-phone`} className="mb-2 block text-sm text-white/80">UAE mobile number *</Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={details.phoneNumber}
            onChange={(event) => setField('phoneNumber', event.target.value)}
            placeholder="05X XXX XXXX"
            className={fieldClass}
            aria-invalid={phoneStarted && !isValidUaeMobile(details.phoneNumber)}
            disabled={disabled}
            required
          />
          {phoneStarted && !isValidUaeMobile(details.phoneNumber) && (
            <p className="mt-1 text-xs text-amber-300">Enter a UAE mobile number, for example 050 123 4567.</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-emirate`} className="mb-2 block text-sm text-white/80">Emirate *</Label>
        <select
          id={`${idPrefix}-emirate`}
          autoComplete="address-level1"
          value={details.emirate}
          onChange={(event) => setField('emirate', event.target.value)}
          className={`${fieldClass} w-full px-3`}
          disabled={disabled}
          required
        >
          <option value="" className="bg-darker">Choose your Emirate</option>
          {UAE_EMIRATES.map((emirate) => <option key={emirate} value={emirate} className="bg-darker">{emirate}</option>)}
        </select>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-address`} className="mb-2 block text-sm text-white/80">Full delivery address *</Label>
        <Textarea
          id={`${idPrefix}-address`}
          autoComplete="street-address"
          value={details.deliveryAddress}
          onChange={(event) => setField('deliveryAddress', event.target.value)}
          placeholder="Building or villa, apartment, street and area"
          className="min-h-[88px] rounded-lg border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-gold/60"
          disabled={disabled}
          required
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-email`} className="mb-2 block text-sm text-white/80">Email <span className="text-white/45">(optional, for confirmation)</span></Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={details.email}
          onChange={(event) => setField('email', event.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
          aria-invalid={emailInvalid}
          disabled={disabled}
        />
        {emailInvalid && <p className="mt-1 text-xs text-amber-300">Enter a valid email or leave this blank.</p>}
      </div>

    </div>
  );
};

export default CheckoutDetailsForm;
