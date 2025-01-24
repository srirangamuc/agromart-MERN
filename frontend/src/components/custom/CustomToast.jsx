import React from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const CustomToast = ({ type, message }) => {
  let Icon;
  switch (type) {
    case 'success':
      Icon = CheckCircle;
      break;
    case 'error':
      Icon = XCircle;
      break;
    case 'loading':
      Icon = Loader;
      break;
    default:
      Icon = null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {Icon && <Icon style={{ marginRight: '10px' }} />}
      <span>{message}</span>
    </div>
  );
};

export default CustomToast;