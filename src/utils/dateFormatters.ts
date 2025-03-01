
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'PPP', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return {
      date: format(date, 'PPP', { locale: es }),
      time: format(date, 'HH:mm', { locale: es })
    };
  } catch (error) {
    return { date: 'Fecha inválida', time: '' };
  }
};
