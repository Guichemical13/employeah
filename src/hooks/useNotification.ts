import { useState } from 'react';

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showNotification = ({
    type,
    title,
    message,
    confirmText = 'OK',
    onConfirm,
  }: Omit<NotificationState, 'isOpen'>) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Funções de conveniência
  const showSuccess = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
    showNotification({ type: 'success', title, message, onConfirm, confirmText: confirmText || 'OK' });
  };

  const showError = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
    showNotification({ type: 'error', title, message, onConfirm, confirmText: confirmText || 'OK' });
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
    showNotification({ type: 'warning', title, message, onConfirm, confirmText: confirmText || 'OK' });
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
    showNotification({ type: 'info', title, message, onConfirm, confirmText: confirmText || 'OK' });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
