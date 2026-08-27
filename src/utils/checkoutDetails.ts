export const UAE_EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

export interface CheckoutDetails {
  name: string;
  phoneNumber: string;
  emirate: string;
  deliveryAddress: string;
  email: string;
  reminderConsent: boolean;
}

export const emptyCheckoutDetails = (): CheckoutDetails => ({
  name: '',
  phoneNumber: '',
  emirate: '',
  deliveryAddress: '',
  email: '',
  reminderConsent: false,
});

export const isValidUaeMobile = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return /^05\d{8}$/.test(digits) || /^9715\d{8}$/.test(digits);
};

export const isCheckoutDetailsValid = (details: CheckoutDetails) => {
  const emailIsValid = !details.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim());
  return Boolean(
    details.name.trim() &&
    isValidUaeMobile(details.phoneNumber) &&
    details.emirate.trim() &&
    details.deliveryAddress.trim() &&
    emailIsValid,
  );
};

export const formatCheckoutDeliveryAddress = (details: CheckoutDetails) => [
  `Address: ${details.deliveryAddress.trim()}`,
  `Emirate: ${details.emirate.trim()}`,
  `Contact: ${details.name.trim()}`,
  `Email: ${details.email.trim()}`,
  `Phone: ${details.phoneNumber.trim()}`,
].join(' | ');
