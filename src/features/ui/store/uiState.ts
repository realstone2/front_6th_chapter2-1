/**
 * ========================================
 * UI 도메인 전역 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * React의 useReducer처럼 단일 함수로 모든 UI 상태 관리를 처리합니다.
 * 나중에 React로 마이그레이션 시 useReducer로 쉽게 변환할 수 있습니다.
 */

/**
 * UI 도메인 상태 인터페이스
 */
interface UIState {
  // 헤더 관련 상태
  header: {
    itemCount: number;
    isVisible: boolean;
  };

  // 모달 관련 상태
  modal: {
    isManualOpen: boolean;
    isOverlayVisible: boolean;
    activeModal: string | null;
  };

  // 알림 관련 상태
  notification: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  };

  // 토글 관련 상태
  toggle: {
    isManualToggleActive: boolean;
    isCartVisible: boolean;
    isSummaryVisible: boolean;
  };

  // 로딩 상태
  loading: {
    isCalculating: boolean;
    isUpdating: boolean;
    isProcessing: boolean;
  };

  // 테마 관련 상태
  theme: {
    isDarkMode: boolean;
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * UI 액션 타입들
 */
type UIAction =
  | { type: 'SET_HEADER_ITEM_COUNT'; payload: number }
  | { type: 'SET_HEADER_VISIBILITY'; payload: boolean }
  | { type: 'OPEN_MANUAL_MODAL' }
  | { type: 'CLOSE_MANUAL_MODAL' }
  | { type: 'SET_MODAL_OVERLAY_VISIBILITY'; payload: boolean }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | {
      type: 'SHOW_NOTIFICATION';
      payload: {
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
      };
    }
  | { type: 'HIDE_NOTIFICATION' }
  | { type: 'SET_MANUAL_TOGGLE_ACTIVE'; payload: boolean }
  | { type: 'SET_CART_VISIBILITY'; payload: boolean }
  | { type: 'SET_SUMMARY_VISIBILITY'; payload: boolean }
  | { type: 'SET_CALCULATING_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING_LOADING'; payload: boolean }
  | { type: 'SET_PROCESSING_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_SECONDARY_COLOR'; payload: string }
  | { type: 'RESET_UI_STATE' };

/**
 * 전역 상태 (useReducer 스타일)
 */
let uiState: UIState = {
  header: {
    itemCount: 0,
    isVisible: true,
  },
  modal: {
    isManualOpen: false,
    isOverlayVisible: false,
    activeModal: null,
  },
  notification: {
    isVisible: false,
    message: '',
    type: 'info',
    duration: 3000,
  },
  toggle: {
    isManualToggleActive: false,
    isCartVisible: true,
    isSummaryVisible: true,
  },
  loading: {
    isCalculating: false,
    isUpdating: false,
    isProcessing: false,
  },
  theme: {
    isDarkMode: false,
    primaryColor: '#000000',
    secondaryColor: '#6B7280',
  },
};

/**
 * UI 리듀서 (useReducer 스타일)
 */
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_HEADER_ITEM_COUNT':
      return {
        ...state,
        header: {
          ...state.header,
          itemCount: action.payload,
        },
      };

    case 'SET_HEADER_VISIBILITY':
      return {
        ...state,
        header: {
          ...state.header,
          isVisible: action.payload,
        },
      };

    case 'OPEN_MANUAL_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          isManualOpen: true,
          isOverlayVisible: true,
          activeModal: 'manual',
        },
      };

    case 'CLOSE_MANUAL_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          isManualOpen: false,
          isOverlayVisible: false,
          activeModal: null,
        },
      };

    case 'SET_MODAL_OVERLAY_VISIBILITY':
      return {
        ...state,
        modal: {
          ...state.modal,
          isOverlayVisible: action.payload,
        },
      };

    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        modal: {
          ...state.modal,
          activeModal: action.payload,
        },
      };

    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notification: {
          isVisible: true,
          message: action.payload.message,
          type: action.payload.type,
          duration: action.payload.duration || 3000,
        },
      };

    case 'HIDE_NOTIFICATION':
      return {
        ...state,
        notification: {
          ...state.notification,
          isVisible: false,
        },
      };

    case 'SET_MANUAL_TOGGLE_ACTIVE':
      return {
        ...state,
        toggle: {
          ...state.toggle,
          isManualToggleActive: action.payload,
        },
      };

    case 'SET_CART_VISIBILITY':
      return {
        ...state,
        toggle: {
          ...state.toggle,
          isCartVisible: action.payload,
        },
      };

    case 'SET_SUMMARY_VISIBILITY':
      return {
        ...state,
        toggle: {
          ...state.toggle,
          isSummaryVisible: action.payload,
        },
      };

    case 'SET_CALCULATING_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          isCalculating: action.payload,
        },
      };

    case 'SET_UPDATING_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          isUpdating: action.payload,
        },
      };

    case 'SET_PROCESSING_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          isProcessing: action.payload,
        },
      };

    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        theme: {
          ...state.theme,
          isDarkMode: !state.theme.isDarkMode,
        },
      };

    case 'SET_PRIMARY_COLOR':
      return {
        ...state,
        theme: {
          ...state.theme,
          primaryColor: action.payload,
        },
      };

    case 'SET_SECONDARY_COLOR':
      return {
        ...state,
        theme: {
          ...state.theme,
          secondaryColor: action.payload,
        },
      };

    case 'RESET_UI_STATE':
      return {
        header: {
          itemCount: 0,
          isVisible: true,
        },
        modal: {
          isManualOpen: false,
          isOverlayVisible: false,
          activeModal: null,
        },
        notification: {
          isVisible: false,
          message: '',
          type: 'info',
          duration: 3000,
        },
        toggle: {
          isManualToggleActive: false,
          isCartVisible: true,
          isSummaryVisible: true,
        },
        loading: {
          isCalculating: false,
          isUpdating: false,
          isProcessing: false,
        },
        theme: {
          isDarkMode: false,
          primaryColor: '#000000',
          secondaryColor: '#6B7280',
        },
      };

    default:
      return state;
  }
}

/**
 * 디스패치 함수 (useReducer 스타일)
 */
function dispatch(action: UIAction): void {
  uiState = uiReducer(uiState, action);
}

/**
 * 상태 조회 함수 (useReducer 스타일)
 */
function getState(): UIState {
  return { ...uiState };
}

/**
 * ========================================
 * UI 상태 관리 (useReducer 스타일)
 * ========================================
 *
 * useReducer처럼 { getState, dispatch } 형태로 export합니다.
 */
export const useUIState = () => {
  return {
    getState,
    dispatch,
  };
};
