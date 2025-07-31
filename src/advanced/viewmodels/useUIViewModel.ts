/**
 * ========================================
 * UI ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * UI 관련 비즈니스 로직을 담당하는 ViewModel입니다.
 * 기존 basic/features/ui/store/uiState.ts의 로직을 React hooks로 변환합니다.
 */

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { uiStateAtom } from '../features/ui/model/UIModel';

/**
 * UI ViewModel
 *
 * UI 상태 관리를 담당하는 ViewModel
 * 기존 uiState.ts의 로직을 React hooks로 변환
 */
export const useUIViewModel = () => {
  const [uiState, setUIState] = useAtom(uiStateAtom);

  /**
   * 헤더 아이템 카운트 설정
   */
  const setHeaderItemCount = useCallback(
    (itemCount: number) => {
      setUIState(prev => ({
        ...prev,
        header: {
          ...prev.header,
          itemCount,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 헤더 표시 여부 설정
   */
  const setHeaderVisibility = useCallback(
    (isVisible: boolean) => {
      setUIState(prev => ({
        ...prev,
        header: {
          ...prev.header,
          isVisible,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 도움말 모달 열기
   */
  const openManualModal = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      modal: {
        ...prev.modal,
        isManualOpen: true,
        isOverlayVisible: true,
        activeModal: 'manual',
      },
    }));
  }, [setUIState]);

  /**
   * 도움말 모달 닫기
   */
  const closeManualModal = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      modal: {
        ...prev.modal,
        isManualOpen: false,
        isOverlayVisible: false,
        activeModal: null,
      },
    }));
  }, [setUIState]);

  /**
   * 모달 오버레이 표시 여부 설정
   */
  const setModalOverlayVisibility = useCallback(
    (isVisible: boolean) => {
      setUIState(prev => ({
        ...prev,
        modal: {
          ...prev.modal,
          isOverlayVisible: isVisible,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 활성 모달 설정
   */
  const setActiveModal = useCallback(
    (modalName: string | null) => {
      setUIState(prev => ({
        ...prev,
        modal: {
          ...prev.modal,
          activeModal: modalName,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 알림 표시
   */
  const showNotification = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration: number = 3000
    ) => {
      setUIState(prev => ({
        ...prev,
        notification: {
          isVisible: true,
          message,
          type,
          duration,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 알림 숨기기
   */
  const hideNotification = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      notification: {
        ...prev.notification,
        isVisible: false,
      },
    }));
  }, [setUIState]);

  /**
   * 도움말 토글 활성화 설정
   */
  const setManualToggleActive = useCallback(
    (isActive: boolean) => {
      setUIState(prev => ({
        ...prev,
        toggle: {
          ...prev.toggle,
          isManualToggleActive: isActive,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 장바구니 표시 여부 설정
   */
  const setCartVisibility = useCallback(
    (isVisible: boolean) => {
      setUIState(prev => ({
        ...prev,
        toggle: {
          ...prev.toggle,
          isCartVisible: isVisible,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 요약 표시 여부 설정
   */
  const setSummaryVisibility = useCallback(
    (isVisible: boolean) => {
      setUIState(prev => ({
        ...prev,
        toggle: {
          ...prev.toggle,
          isSummaryVisible: isVisible,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 계산 로딩 상태 설정
   */
  const setCalculatingLoading = useCallback(
    (isCalculating: boolean) => {
      setUIState(prev => ({
        ...prev,
        loading: {
          ...prev.loading,
          isCalculating,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 업데이트 로딩 상태 설정
   */
  const setUpdatingLoading = useCallback(
    (isUpdating: boolean) => {
      setUIState(prev => ({
        ...prev,
        loading: {
          ...prev.loading,
          isUpdating,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 처리 로딩 상태 설정
   */
  const setProcessingLoading = useCallback(
    (isProcessing: boolean) => {
      setUIState(prev => ({
        ...prev,
        loading: {
          ...prev.loading,
          isProcessing,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 다크 모드 토글
   */
  const toggleDarkMode = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        isDarkMode: !prev.theme.isDarkMode,
      },
    }));
  }, [setUIState]);

  /**
   * 기본 색상 설정
   */
  const setPrimaryColor = useCallback(
    (color: string) => {
      setUIState(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          primaryColor: color,
        },
      }));
    },
    [setUIState]
  );

  /**
   * 보조 색상 설정
   */
  const setSecondaryColor = useCallback(
    (color: string) => {
      setUIState(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          secondaryColor: color,
        },
      }));
    },
    [setUIState]
  );

  /**
   * UI 상태 초기화
   */
  const resetUIState = useCallback(() => {
    setUIState({
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
    });
  }, [setUIState]);

  /**
   * 도움말 모달 토글
   */
  const toggleManualModal = useCallback(() => {
    if (uiState.modal.isManualOpen) {
      closeManualModal();
    } else {
      openManualModal();
    }
  }, [uiState.modal.isManualOpen, openManualModal, closeManualModal]);

  /**
   * 성공 알림 표시
   */
  const showSuccessNotification = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'success', duration);
    },
    [showNotification]
  );

  /**
   * 에러 알림 표시
   */
  const showErrorNotification = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'error', duration);
    },
    [showNotification]
  );

  /**
   * 경고 알림 표시
   */
  const showWarningNotification = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'warning', duration);
    },
    [showNotification]
  );

  /**
   * 정보 알림 표시
   */
  const showInfoNotification = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'info', duration);
    },
    [showNotification]
  );

  /**
   * 로딩 상태 확인
   */
  const isLoading = useCallback(() => {
    return (
      uiState.loading.isCalculating ||
      uiState.loading.isUpdating ||
      uiState.loading.isProcessing
    );
  }, [uiState.loading]);

  /**
   * 모달이 열려있는지 확인
   */
  const isModalOpen = useCallback(() => {
    return uiState.modal.isManualOpen || uiState.modal.activeModal !== null;
  }, [uiState.modal]);

  /**
   * 알림이 표시되고 있는지 확인
   */
  const isNotificationVisible = useCallback(() => {
    return uiState.notification.isVisible;
  }, [uiState.notification.isVisible]);

  return {
    // 상태
    uiState,
    header: uiState.header,
    modal: uiState.modal,
    notification: uiState.notification,
    toggle: uiState.toggle,
    loading: uiState.loading,
    theme: uiState.theme,

    // 헤더 관련 함수들
    setHeaderItemCount,
    setHeaderVisibility,

    // 모달 관련 함수들
    openManualModal,
    closeManualModal,
    toggleManualModal,
    setModalOverlayVisibility,
    setActiveModal,

    // 알림 관련 함수들
    showNotification,
    hideNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,

    // 토글 관련 함수들
    setManualToggleActive,
    setCartVisibility,
    setSummaryVisibility,

    // 로딩 관련 함수들
    setCalculatingLoading,
    setUpdatingLoading,
    setProcessingLoading,

    // 테마 관련 함수들
    toggleDarkMode,
    setPrimaryColor,
    setSecondaryColor,

    // 유틸리티 함수들
    resetUIState,
    isLoading,
    isModalOpen,
    isNotificationVisible,
  };
};
