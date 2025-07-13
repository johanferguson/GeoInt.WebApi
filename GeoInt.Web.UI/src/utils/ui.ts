import { ref, readonly, type Ref } from 'vue'

export type MessageBoxType = 'confirmation' | 'error' | 'warning' | 'success' | 'info'
export type ButtonType = 'primary' | 'danger' | 'success' | 'warning'

export interface MessageBoxOptions {
  type?: MessageBoxType
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  confirmButtonType?: ButtonType
  closeOnOverlayClick?: boolean
}

export interface MessageBoxState {
  type: Ref<MessageBoxType>
  title: Ref<string>
  message: Ref<string>
  showCancel: Ref<boolean>
  confirmText: Ref<string>
  cancelText: Ref<string>
  confirmButtonType: Ref<ButtonType>
  resolve: Ref<((value: boolean) => void) | null>
}

/**
 * Creates a reactive message box state for use in Vue components
 */
export function useMessageBox() {
  const messageBoxType = ref<MessageBoxType>('info')
  const messageBoxTitle = ref('')
  const messageBoxMessage = ref('')
  const messageBoxShowCancel = ref(false)
  const messageBoxConfirmText = ref('OK')
  const messageBoxCancelText = ref('Cancel')
  const messageBoxConfirmButtonType = ref<ButtonType>('primary')
  let messageBoxResolve: ((value: boolean) => void) | null = null

  const state: MessageBoxState = {
    type: messageBoxType,
    title: messageBoxTitle,
    message: messageBoxMessage,
    showCancel: messageBoxShowCancel,
    confirmText: messageBoxConfirmText,
    cancelText: messageBoxCancelText,
    confirmButtonType: messageBoxConfirmButtonType,
    resolve: ref(messageBoxResolve)
  }

  const showMessage = (options: MessageBoxOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      messageBoxType.value = options.type || 'info'
      messageBoxTitle.value = options.title || ''
      messageBoxMessage.value = options.message
      messageBoxShowCancel.value = options.showCancel || false
      messageBoxConfirmText.value = options.confirmText || 'OK'
      messageBoxCancelText.value = options.cancelText || 'Cancel'
      messageBoxConfirmButtonType.value = options.confirmButtonType || 'primary'
      messageBoxResolve = resolve
      state.resolve.value = resolve
    })
  }

  const showConfirmation = (
    message: string,
    title: string = 'Confirm',
    options: Partial<MessageBoxOptions> = {}
  ): Promise<boolean> => {
    return showMessage({
      type: 'confirmation',
      title,
      message,
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No',
      confirmButtonType: 'primary',
      ...options
    })
  }

  const showError = (
    message: string,
    title: string = 'Error',
    options: Partial<MessageBoxOptions> = {}
  ): Promise<boolean> => {
    return showMessage({
      type: 'error',
      title,
      message,
      showCancel: false,
      confirmText: 'OK',
      confirmButtonType: 'danger',
      ...options
    })
  }

  const showWarning = (
    message: string,
    title: string = 'Warning',
    options: Partial<MessageBoxOptions> = {}
  ): Promise<boolean> => {
    return showMessage({
      type: 'warning',
      title,
      message,
      showCancel: false,
      confirmText: 'OK',
      confirmButtonType: 'warning',
      ...options
    })
  }

  const showSuccess = (
    message: string,
    title: string = 'Success',
    options: Partial<MessageBoxOptions> = {}
  ): Promise<boolean> => {
    return showMessage({
      type: 'success',
      title,
      message,
      showCancel: false,
      confirmText: 'OK',
      confirmButtonType: 'success',
      ...options
    })
  }

  const showInfo = (
    message: string,
    title: string = 'Information',
    options: Partial<MessageBoxOptions> = {}
  ): Promise<boolean> => {
    return showMessage({
      type: 'info',
      title,
      message,
      showCancel: false,
      confirmText: 'OK',
      confirmButtonType: 'primary',
      ...options
    })
  }

  const handleConfirm = () => {
    if (messageBoxResolve) {
      messageBoxResolve(true)
      messageBoxResolve = null
    }
  }

  const handleCancel = () => {
    if (messageBoxResolve) {
      messageBoxResolve(false)
      messageBoxResolve = null
    }
  }

  const handleClose = () => {
    if (messageBoxResolve) {
      messageBoxResolve(false)
      messageBoxResolve = null
    }
  }

  return {
    // State
    ...state,
    
    // Helper functions
    showMessage,
    showConfirmation,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    
    // Event handlers
    handleConfirm,
    handleCancel,
    handleClose
  }
}

/**
 * Creates a reactive loading state for use in Vue components
 */
export function useLoadingState(initialState: boolean = false) {
  const loading = ref(initialState)
  const error = ref<string | null>(null)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const withLoading = async <T>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true)
    clearError()
    try {
      const result = await operation()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    setLoading,
    setError,
    clearError,
    withLoading
  }
}

/**
 * Utility function to format error messages consistently
 */
export function formatError(error: unknown, fallback: string = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/**
 * Utility function to handle async operations with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  onError?: (error: string) => void
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (err) {
    const error = formatError(err)
    if (onError) {
      onError(error)
    }
    return { success: false, error }
  }
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Utility function to trigger file downloads
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Utility function to format dates consistently
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date)
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Utility function to copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
} 