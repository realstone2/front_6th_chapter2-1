/**
 * ========================================
 * UI ViewModel 테스트 (MVVM - ViewModel)
 * ========================================
 *
 * UI ViewModel의 기능을 테스트합니다.
 * 기존 basic 테스트의 UI 관련 로직을 React Testing Library로 변환합니다.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
import { useUIViewModel } from '../viewmodels/useUIViewModel';

/**
 * 테스트용 Provider 래퍼
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

const renderHookWithProvider = <T,>(hook: () => T) => {
  return renderHook(hook, { wrapper });
};

describe('UI ViewModel', () => {
  describe('useUIViewModel', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.header.itemCount).toBe(0);
      expect(result.current.header.isVisible).toBe(true);
      expect(result.current.modal.isManualOpen).toBe(false);
      expect(result.current.modal.isOverlayVisible).toBe(false);
      expect(result.current.modal.activeModal).toBeNull();
      expect(result.current.notification.isVisible).toBe(false);
      expect(result.current.notification.message).toBe('');
      expect(result.current.notification.type).toBe('info');
      expect(result.current.toggle.isManualToggleActive).toBe(false);
      expect(result.current.toggle.isCartVisible).toBe(true);
      expect(result.current.toggle.isSummaryVisible).toBe(true);
      expect(result.current.loading.isCalculating).toBe(false);
      expect(result.current.loading.isUpdating).toBe(false);
      expect(result.current.loading.isProcessing).toBe(false);
      expect(result.current.theme.isDarkMode).toBe(false);
      expect(result.current.theme.primaryColor).toBe('#000000');
      expect(result.current.theme.secondaryColor).toBe('#6B7280');
    });

    it('헤더 아이템 카운트를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setHeaderItemCount(5);
      });

      expect(result.current.header.itemCount).toBe(5);
    });

    it('헤더 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setHeaderVisibility(false);
      });

      expect(result.current.header.isVisible).toBe(false);
    });

    it('도움말 모달을 열 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.openManualModal();
      });

      expect(result.current.modal.isManualOpen).toBe(true);
      expect(result.current.modal.isOverlayVisible).toBe(true);
      expect(result.current.modal.activeModal).toBe('manual');
    });

    it('도움말 모달을 닫을 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      // 먼저 모달 열기
      act(() => {
        result.current.openManualModal();
      });

      expect(result.current.modal.isManualOpen).toBe(true);

      // 모달 닫기
      act(() => {
        result.current.closeManualModal();
      });

      expect(result.current.modal.isManualOpen).toBe(false);
      expect(result.current.modal.isOverlayVisible).toBe(false);
      expect(result.current.modal.activeModal).toBeNull();
    });

    it('모달 오버레이 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setModalOverlayVisibility(true);
      });

      expect(result.current.modal.isOverlayVisible).toBe(true);
    });

    it('활성 모달을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setActiveModal('test-modal');
      });

      expect(result.current.modal.activeModal).toBe('test-modal');
    });

    it('알림을 표시할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.showNotification('테스트 메시지', 'success', 5000);
      });

      expect(result.current.notification.isVisible).toBe(true);
      expect(result.current.notification.message).toBe('테스트 메시지');
      expect(result.current.notification.type).toBe('success');
      expect(result.current.notification.duration).toBe(5000);
    });

    it('알림을 숨길 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      // 먼저 알림 표시
      act(() => {
        result.current.showNotification('테스트 메시지');
      });

      expect(result.current.notification.isVisible).toBe(true);

      // 알림 숨기기
      act(() => {
        result.current.hideNotification();
      });

      expect(result.current.notification.isVisible).toBe(false);
    });

    it('도움말 토글 활성화를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setManualToggleActive(true);
      });

      expect(result.current.toggle.isManualToggleActive).toBe(true);
    });

    it('장바구니 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setCartVisibility(false);
      });

      expect(result.current.toggle.isCartVisible).toBe(false);
    });

    it('요약 표시 여부를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setSummaryVisibility(false);
      });

      expect(result.current.toggle.isSummaryVisible).toBe(false);
    });

    it('계산 로딩 상태를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setCalculatingLoading(true);
      });

      expect(result.current.loading.isCalculating).toBe(true);
    });

    it('업데이트 로딩 상태를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setUpdatingLoading(true);
      });

      expect(result.current.loading.isUpdating).toBe(true);
    });

    it('처리 로딩 상태를 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setProcessingLoading(true);
      });

      expect(result.current.loading.isProcessing).toBe(true);
    });

    it('다크 모드를 토글할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.theme.isDarkMode).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.theme.isDarkMode).toBe(true);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.theme.isDarkMode).toBe(false);
    });

    it('기본 색상을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setPrimaryColor('#FF0000');
      });

      expect(result.current.theme.primaryColor).toBe('#FF0000');
    });

    it('보조 색상을 설정할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.setSecondaryColor('#00FF00');
      });

      expect(result.current.theme.secondaryColor).toBe('#00FF00');
    });

    it('UI 상태를 초기화할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      // 먼저 상태 변경
      act(() => {
        result.current.setHeaderItemCount(10);
        result.current.openManualModal();
        result.current.showNotification('테스트');
        result.current.setManualToggleActive(true);
        result.current.setCalculatingLoading(true);
        result.current.toggleDarkMode();
      });

      // 초기화
      act(() => {
        result.current.resetUIState();
      });

      expect(result.current.header.itemCount).toBe(0);
      expect(result.current.modal.isManualOpen).toBe(false);
      expect(result.current.notification.isVisible).toBe(false);
      expect(result.current.toggle.isManualToggleActive).toBe(false);
      expect(result.current.loading.isCalculating).toBe(false);
      expect(result.current.theme.isDarkMode).toBe(false);
    });

    it('도움말 모달을 토글할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.modal.isManualOpen).toBe(false);

      // 모달 열기
      act(() => {
        result.current.toggleManualModal();
      });

      expect(result.current.modal.isManualOpen).toBe(true);

      // 모달 닫기
      act(() => {
        result.current.toggleManualModal();
      });

      expect(result.current.modal.isManualOpen).toBe(false);
    });

    it('성공 알림을 표시할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.showSuccessNotification('성공 메시지');
      });

      expect(result.current.notification.isVisible).toBe(true);
      expect(result.current.notification.message).toBe('성공 메시지');
      expect(result.current.notification.type).toBe('success');
    });

    it('에러 알림을 표시할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.showErrorNotification('에러 메시지');
      });

      expect(result.current.notification.isVisible).toBe(true);
      expect(result.current.notification.message).toBe('에러 메시지');
      expect(result.current.notification.type).toBe('error');
    });

    it('경고 알림을 표시할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.showWarningNotification('경고 메시지');
      });

      expect(result.current.notification.isVisible).toBe(true);
      expect(result.current.notification.message).toBe('경고 메시지');
      expect(result.current.notification.type).toBe('warning');
    });

    it('정보 알림을 표시할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      act(() => {
        result.current.showInfoNotification('정보 메시지');
      });

      expect(result.current.notification.isVisible).toBe(true);
      expect(result.current.notification.message).toBe('정보 메시지');
      expect(result.current.notification.type).toBe('info');
    });

    it('로딩 상태를 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.isLoading()).toBe(false);

      act(() => {
        result.current.setCalculatingLoading(true);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setCalculatingLoading(false);
        result.current.setUpdatingLoading(true);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setUpdatingLoading(false);
        result.current.setProcessingLoading(true);
      });

      expect(result.current.isLoading()).toBe(true);

      act(() => {
        result.current.setProcessingLoading(false);
      });

      expect(result.current.isLoading()).toBe(false);
    });

    it('모달이 열려있는지 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.isModalOpen()).toBe(false);

      act(() => {
        result.current.openManualModal();
      });

      expect(result.current.isModalOpen()).toBe(true);

      act(() => {
        result.current.closeManualModal();
      });

      expect(result.current.isModalOpen()).toBe(false);

      act(() => {
        result.current.setActiveModal('test-modal');
      });

      expect(result.current.isModalOpen()).toBe(true);
    });

    it('알림이 표시되고 있는지 확인할 수 있어야 함', () => {
      const { result } = renderHookWithProvider(useUIViewModel);

      expect(result.current.isNotificationVisible()).toBe(false);

      act(() => {
        result.current.showNotification('테스트 메시지');
      });

      expect(result.current.isNotificationVisible()).toBe(true);

      act(() => {
        result.current.hideNotification();
      });

      expect(result.current.isNotificationVisible()).toBe(false);
    });
  });
});
