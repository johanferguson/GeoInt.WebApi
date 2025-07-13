import { ref, reactive } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export function useNotifications() {
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    
    notifications.value.push(newNotification);
    
    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const showSuccess = (title: string, message?: string) => {
    return showNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    return showNotification({ type: 'error', title, message, duration: 7000 });
  };

  const showInfo = (title: string, message?: string) => {
    return showNotification({ type: 'info', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    return showNotification({ type: 'warning', title, message });
  };

  const clearAll = () => {
    notifications.value = [];
  };

  return {
    notifications: notifications.value,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAll,
  };
} 