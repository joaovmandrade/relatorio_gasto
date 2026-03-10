const STORAGE_KEY = 'car_payments_data';

export const getPayments = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayment = (payment) => {
  const payments = getPayments();
  const newPayment = {
    ...payment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  
  const updatedPayments = [...payments, newPayment];
  // Sort by date descending
  updatedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPayments));
  return updatedPayments;
};

export const deletePayment = (id) => {
  const payments = getPayments();
  const updatedPayments = payments.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPayments));
  return updatedPayments;
};
