/**
 * ========================================
 * UI Model Types & Data (MVVM - Model)
 * ========================================
 *
 * UI 도메인의 데이터 타입과 초기 데이터를 정의합니다.
 * 기존 src/basic/features/ui/store/uiState.ts를 기반으로 구성합니다.
 */

import { atom } from 'jotai';

/**
 * 헤더 상태 모델 인터페이스
 */
export interface HeaderState {
  /** 장바구니 아이템 개수 */
  itemCount: number;

  /** 헤더 표시 여부 */
  isVisible: boolean;
}

/**
 * 모달 상태 모델 인터페이스
 */
export interface ModalState {
  /** 도움말 모달 열림 상태 */
  isManualOpen: boolean;

  /** 오버레이 표시 여부 */
  isOverlayVisible: boolean;

  /** 활성화된 모달 ID */
  activeModal: string | null;
}

/**
 * 알림 상태 모델 인터페이스
 */
export interface NotificationState {
  /** 알림 표시 여부 */
  isVisible: boolean;

  /** 알림 메시지 */
  message: string;

  /** 알림 타입 */
  type: 'success' | 'error' | 'warning' | 'info';

  /** 표시 시간 (ms) */
  duration: number;
}

/**
 * 토글 상태 모델 인터페이스
 */
export interface ToggleState {
  /** 도움말 토글 활성화 상태 */
  isManualToggleActive: boolean;

  /** 장바구니 표시 여부 */
  isCartVisible: boolean;

  /** 주문 요약 표시 여부 */
  isSummaryVisible: boolean;
}

/**
 * 로딩 상태 모델 인터페이스
 */
export interface LoadingState {
  /** 계산 중 로딩 */
  isCalculating: boolean;

  /** 업데이트 중 로딩 */
  isUpdating: boolean;

  /** 처리 중 로딩 */
  isProcessing: boolean;
}

/**
 * 테마 상태 모델 인터페이스
 */
export interface ThemeState {
  /** 다크모드 여부 */
  isDarkMode: boolean;

  /** 주요 색상 */
  primaryColor: string;

  /** 보조 색상 */
  secondaryColor: string;
}

/**
 * UI 상태 모델 인터페이스
 * 기존 UIState 인터페이스와 동일
 */
export interface UIState {
  /** 헤더 관련 상태 */
  header: HeaderState;

  /** 모달 관련 상태 */
  modal: ModalState;

  /** 알림 관련 상태 */
  notification: NotificationState;

  /** 토글 관련 상태 */
  toggle: ToggleState;

  /** 로딩 상태 */
  loading: LoadingState;

  /** 테마 관련 상태 */
  theme: ThemeState;
}

// ========================================
// 초기 데이터
// ========================================

/**
 * 초기 UI 상태
 * 기존 uiState.ts의 초기 상태와 동일
 */
export const initialUIState: UIState = {
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

// ========================================
// Jotai Atoms
// ========================================

/**
 * UI 상태 atom
 * 기존 uiState와 동일한 구조로 UI 전체 상태를 관리합니다.
 */
export const uiStateAtom = atom<UIState>(initialUIState);
