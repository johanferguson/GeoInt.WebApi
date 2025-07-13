import { defineStore } from 'pinia';
import { Message, MessageType } from '@/types/common';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as Message[],
    maxMessages: 5
  }),
  
  getters: {
    getMessagesByType: (state) => (type: MessageType) => {
      return state.messages.filter(message => message.type === type);
    },
    
    hasMessages: (state) => state.messages.length > 0,
    
    getLatestMessage: (state) => {
      return state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;
    }
  },
  
  actions: {
    addMessage(type: MessageType, title: string, content: string, duration?: number) {
      const message: Message = {
        id: generateId(),
        type,
        title,
        content,
        duration: duration || this.getDefaultDuration(type)
      };
      
      this.messages.push(message);
      
      // Auto-remove after duration
      if (message.duration > 0) {
        setTimeout(() => {
          this.removeMessage(message.id);
        }, message.duration);
      }
      
      // Keep only max messages
      if (this.messages.length > this.maxMessages) {
        this.messages.splice(0, this.messages.length - this.maxMessages);
      }
      
      return message;
    },
    
    removeMessage(id: string) {
      const index = this.messages.findIndex(message => message.id === id);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    },
    
    clearMessages() {
      this.messages = [];
    },
    
    clearMessagesByType(type: MessageType) {
      this.messages = this.messages.filter(message => message.type !== type);
    },
    
    // Convenience methods
    showSuccess(title: string, content?: string, duration?: number) {
      return this.addMessage('success', title, content || '', duration);
    },
    
    showError(title: string, error?: Error | string, duration?: number) {
      const content = error instanceof Error ? error.message : (error || '');
      return this.addMessage('error', title, content, duration);
    },
    
    showWarning(title: string, content?: string, duration?: number) {
      return this.addMessage('warning', title, content || '', duration);
    },
    
    showInfo(title: string, content?: string, duration?: number) {
      return this.addMessage('info', title, content || '', duration);
    },
    
    // Helper methods
    getDefaultDuration(type: MessageType): number {
      switch (type) {
        case 'success':
          return 3000;
        case 'info':
          return 4000;
        case 'warning':
          return 5000;
        case 'error':
          return 0; // Don't auto-remove errors
        default:
          return 4000;
      }
    }
  }
});

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
} 