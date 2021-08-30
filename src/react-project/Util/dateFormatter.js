import moment from 'moment';

export const formatDate = (date, format = 'YYYY-MM-DD, hh:mm A') => {
  const formattedDate = moment(date).format(format);

  return formattedDate;
};
