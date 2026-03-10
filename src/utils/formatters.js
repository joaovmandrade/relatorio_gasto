export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  // Avoid time zone date shifting by forcing format logic or just using simple split
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
