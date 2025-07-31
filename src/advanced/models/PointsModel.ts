/**
 * ========================================
 * Points Model Types, Data & Atoms (MVVM - Model)
 * ========================================
 *
 * 포인트 도메인의 데이터 타입, 초기 데이터, Jotai atoms를 정의합니다.
 * 기존 src/basic/features/points/store/pointsState.ts를 기반으로 구성합니다.
 */

import { atom } from 'jotai';

/**
 * 포인트 계산 결과 모델 인터페이스
 * 기존 PointsCalculation 인터페이스와 동일
 */
export interface PointsCalculation {
  /** 기본 포인트 (최종 결제 금액의 0.1%) */
  basePoints: number;

  /** 화요일 보너스 포인트 (기본 포인트 2배) */
  tuesdayBonus: number;

  /** 세트 구매 보너스 포인트 (키보드+마우스) */
  setBonus: number;

  /** 풀세트 구매 보너스 포인트 (키보드+마우스+모니터암) */
  fullSetBonus: number;

  /** 수량별 보너스 포인트 */
  quantityBonus: number;

  /** 총 적립 포인트 */
  totalPoints: number;

  /** 계산 상세 내역 (UI 표시용) */
  details: string[];
}

/**
 * 현재 포인트 정보 모델 인터페이스
 */
export interface CurrentPointsInfo {
  /** 총 보유 포인트 */
  total: number;

  /** 포인트 계산 결과 */
  calculation: PointsCalculation | null;

  /** 마지막 계산 시점 */
  lastCalculated: Date | null;
}

/**
 * 포인트 내역 모델 인터페이스
 */
export interface PointsHistory {
  /** 내역 ID */
  id: string;

  /** 포인트 금액 */
  amount: number;

  /** 포인트 타입 */
  type: 'purchase' | 'bonus' | 'expired' | 'used';

  /** 설명 */
  description: string;

  /** 발생 날짜 */
  date: Date;
}

/**
 * 수량별 보너스 규칙 모델 인터페이스
 */
export interface QuantityBonusRule {
  /** 최소 수량 */
  threshold: number;

  /** 보너스 포인트 */
  bonus: number;

  /** 설명 */
  description: string;
}

/**
 * 포인트 설정 모델 인터페이스
 */
export interface PointsSettings {
  /** 기본 적립률 (1000원당 1포인트 = 0.001) */
  baseRate: number;

  /** 화요일 배수 */
  tuesdayMultiplier: number;

  /** 세트 보너스 포인트 (키보드+마우스) */
  setBonusAmount: number;

  /** 풀세트 보너스 포인트 (키보드+마우스+모니터암) */
  fullSetBonusAmount: number;

  /** 수량별 보너스 규칙 목록 */
  quantityBonuses: QuantityBonusRule[];
}

/**
 * 포인트 표시 설정 모델 인터페이스
 */
export interface PointsDisplay {
  /** 포인트 섹션 표시 여부 */
  isVisible: boolean;

  /** 상세 내역 표시 여부 */
  showDetails: boolean;

  /** 자동 계산 여부 */
  autoCalculate: boolean;
}

/**
 * 포인트 상태 모델 인터페이스
 * 기존 PointsState 인터페이스와 동일
 */
export interface PointsState {
  /** 현재 포인트 정보 */
  currentPoints: CurrentPointsInfo;

  /** 포인트 적립 내역 */
  history: PointsHistory[];

  /** 포인트 설정 */
  settings: PointsSettings;

  /** 포인트 표시 설정 */
  display: PointsDisplay;
}

// ========================================
// 초기 데이터
// ========================================

/**
 * 초기 포인트 상태
 * 기존 pointsState.ts의 초기 상태와 동일
 */
export const initialPointsState: PointsState = {
  currentPoints: {
    total: 0,
    calculation: null,
    lastCalculated: null,
  },
  history: [],
  settings: {
    baseRate: 0.001, // 1000원당 1포인트
    tuesdayMultiplier: 2,
    setBonusAmount: 50,
    fullSetBonusAmount: 100,
    quantityBonuses: [
      { threshold: 10, bonus: 20, description: '대량구매(10개+)' },
      { threshold: 20, bonus: 50, description: '대량구매(20개+)' },
      { threshold: 30, bonus: 100, description: '대량구매(30개+)' },
    ],
  },
  display: {
    isVisible: false,
    showDetails: false,
    autoCalculate: true,
  },
};

// ========================================
// Jotai Atoms
// ========================================

/**
 * 포인트 상태 atom
 * 기존 pointsState와 동일한 구조로 포인트 전체 상태를 관리합니다.
 */
export const pointsStateAtom = atom<PointsState>(initialPointsState);
