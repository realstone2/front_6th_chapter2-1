import { PRODUCT_IDS } from '../../constants/index.ts';

/**
 * 상품 타입 정의
 */
export interface Product {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

/**
 * 상품 생성 함수
 * @param id 상품 ID
 * @param name 상품명
 * @param price 가격
 * @param stock 재고
 * @returns Product 객체
 */
export const createProduct = (
  id: string,
  name: string,
  price: number,
  stock: number
): Product => ({
  id,
  name,
  val: price,
  originalVal: price,
  q: stock,
  onSale: false,
  suggestSale: false,
});

/**
 * 상품 목록 초기화 함수
 * @returns 초기화된 상품 목록
 */
export const initializeProducts = (): Product[] => [
  createProduct(PRODUCT_IDS.KEYBOARD, '버그 없애는 키보드', 10000, 50),
  createProduct(PRODUCT_IDS.MOUSE, '생산성 폭발 마우스', 20000, 30),
  createProduct(PRODUCT_IDS.MONITOR_ARM, '거북목 탈출 모니터암', 30000, 20),
  createProduct(PRODUCT_IDS.LAPTOP_CASE, '에러 방지 노트북 파우치', 15000, 0),
  createProduct(PRODUCT_IDS.SPEAKER, '코딩할 때 듣는 Lo-Fi 스피커', 25000, 10),
];

/**
 * 상품 업데이트 함수 (불변성 유지)
 * @param products 기존 상품 목록
 * @param productId 업데이트할 상품 ID
 * @param updates 업데이트할 속성들
 * @returns 업데이트된 상품 목록
 */
export const updateProduct = (
  products: Product[],
  productId: string,
  updates: Partial<Product>
): Product[] => {
  return products.map(product =>
    product.id === productId ? { ...product, ...updates } : product
  );
};

/**
 * 상품 찾기 함수
 * @param products 상품 목록
 * @param productId 찾을 상품 ID
 * @returns 찾은 상품 또는 undefined
 */
export const findProduct = (
  products: Product[],
  productId: string
): Product | undefined => {
  return products.find(product => product.id === productId);
};

/**
 * 재고가 있는 상품만 필터링
 * @param products 상품 목록
 * @returns 재고가 있는 상품 목록
 */
export const getAvailableProducts = (products: Product[]): Product[] => {
  return products.filter(product => product.q > 0);
};

/**
 * 할인 중인 상품만 필터링
 * @param products 상품 목록
 * @returns 할인 중인 상품 목록
 */
export const getDiscountedProducts = (products: Product[]): Product[] => {
  return products.filter(product => product.onSale || product.suggestSale);
};
