/**
 * ========================================
 * Product Model Types, Data & Atoms (MVVM - Model)
 * ========================================
 *
 * 상품 도메인의 데이터 타입, 초기 데이터, Jotai atoms를 정의합니다.
 * 기존 src/basic/features/product/store/productState.ts와
 * src/basic/features/product/productUtils.ts를 기반으로 구성합니다.
 */

import { atom } from 'jotai';

/**
 * 상품 모델 인터페이스
 * 기존 Product 인터페이스를 React 환경에 맞게 재정의
 */
export interface ProductModel {
  /** 상품 고유 식별자 */
  id: string;

  /** 상품명 */
  name: string;

  /** 현재 가격 (할인 적용된 가격) */
  val: number;

  /** 원래 가격 (할인 적용 전 가격) */
  originalVal: number;

  /** 재고 수량 */
  q: number;

  /** 번개세일 할인 상태 */
  onSale: boolean;

  /** 추천세일 할인 상태 */
  suggestSale: boolean;
}

/**
 * 상품 상태 모델 인터페이스
 * 기존 ProductState 인터페이스와 동일
 */
export interface ProductState {
  /** 전체 상품 목록 */
  products: ProductModel[];

  /** 마지막 선택된 상품 ID */
  lastSelected: string | null;

  /** 번개세일 타이머 ID */
  lightningSaleTimer: number | null;

  /** 추천세일 타이머 ID */
  suggestSaleTimer: number | null;
}

// ========================================
// 초기 데이터
// ========================================

/**
 * 상품 ID 상수
 * 기존 constants/index.ts의 PRODUCT_IDS와 동일
 */
export const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  LAPTOP_CASE: 'p4',
  SPEAKER: 'p5',
} as const;

/**
 * 상품 생성 함수
 * 기존 productUtils.ts의 createProduct와 동일
 */
export const createProduct = (
  id: string,
  name: string,
  price: number,
  stock: number
): ProductModel => ({
  id,
  name,
  val: price,
  originalVal: price,
  q: stock,
  onSale: false,
  suggestSale: false,
});

/**
 * 초기 상품 목록
 * 기존 productUtils.ts의 initializeProducts와 동일
 */
export const initialProducts: ProductModel[] = [
  createProduct(PRODUCT_IDS.KEYBOARD, '버그 없애는 키보드', 10000, 50),
  createProduct(PRODUCT_IDS.MOUSE, '생산성 폭발 마우스', 20000, 30),
  createProduct(PRODUCT_IDS.MONITOR_ARM, '거북목 탈출 모니터암', 30000, 20),
  createProduct(PRODUCT_IDS.LAPTOP_CASE, '에러 방지 노트북 파우치', 15000, 0),
  createProduct(PRODUCT_IDS.SPEAKER, '코딩할 때 듣는 Lo-Fi 스피커', 25000, 10),
];

/**
 * 초기 상품 상태
 * 기존 productState.ts의 초기 상태와 동일
 */
export const initialProductState: ProductState = {
  products: initialProducts,
  lastSelected: null,
  lightningSaleTimer: null,
  suggestSaleTimer: null,
};

// ========================================
// Jotai Atoms
// ========================================

/**
 * 상품 상태 atom
 * 기존 productState와 동일한 구조로 상품 전체 상태를 관리합니다.
 */
export const productStateAtom = atom<ProductState>(initialProductState);
