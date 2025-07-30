import { BUSINESS_RULES } from '../../constants/index.ts';
import { Product } from '../product/productUtils.ts';

/**
 * 재고 상태 타입 정의
 */
export interface StockStatus {
  totalStock: number;
  lowStockItems: string[];
  outOfStockItems: string[];
  stockMessage: string;
}

/**
 * 전체 재고 수량 계산
 * @param products 상품 목록
 * @returns 전체 재고 수량
 */
export const calculateTotalStock = (products: Product[]): number => {
  return products.reduce((total, product) => total + product.q, 0);
};

/**
 * 재고 부족 상품 목록 조회
 * @param products 상품 목록
 * @returns 재고 부족 상품명 목록
 */
export const getLowStockItems = (products: Product[]): string[] => {
  return products
    .filter(
      product => product.q < BUSINESS_RULES.LOW_STOCK_THRESHOLD && product.q > 0
    )
    .map(product => product.name);
};

/**
 * 품절 상품 목록 조회
 * @param products 상품 목록
 * @returns 품절 상품명 목록
 */
export const getOutOfStockItems = (products: Product[]): string[] => {
  return products
    .filter(product => product.q === 0)
    .map(product => product.name);
};

/**
 * 재고 상태 메시지 생성
 * @param products 상품 목록
 * @returns 재고 상태 메시지
 */
export const generateStockMessage = (products: Product[]): string => {
  const lowStockItems = getLowStockItems(products);
  const outOfStockItems = getOutOfStockItems(products);

  let message = '';

  lowStockItems.forEach(itemName => {
    const product = products.find(p => p.name === itemName);
    if (product) {
      message += `${itemName}: 재고 부족 (${product.q}개 남음)\n`;
    }
  });

  outOfStockItems.forEach(itemName => {
    message += `${itemName}: 품절\n`;
  });

  return message;
};

/**
 * 전체 재고 상태 계산
 * @param products 상품 목록
 * @returns 재고 상태 정보
 */
export const calculateStockStatus = (products: Product[]): StockStatus => {
  const totalStock = calculateTotalStock(products);
  const lowStockItems = getLowStockItems(products);
  const outOfStockItems = getOutOfStockItems(products);
  const stockMessage = generateStockMessage(products);

  return {
    totalStock,
    lowStockItems,
    outOfStockItems,
    stockMessage,
  };
};

/**
 * 재고 부족 여부 확인
 * @param products 상품 목록
 * @returns 재고 부족 여부
 */
export const hasLowStock = (products: Product[]): boolean => {
  return getLowStockItems(products).length > 0;
};

/**
 * 품절 여부 확인
 * @param products 상품 목록
 * @returns 품절 여부
 */
export const hasOutOfStock = (products: Product[]): boolean => {
  return getOutOfStockItems(products).length > 0;
};

/**
 * 상품 재고 감소
 * @param products 상품 목록
 * @param productId 상품 ID
 * @param quantity 감소할 수량
 * @returns 업데이트된 상품 목록
 */
export const decreaseStock = (
  products: Product[],
  productId: string,
  quantity: number
): Product[] => {
  return products.map(product =>
    product.id === productId && product.q >= quantity
      ? { ...product, q: product.q - quantity }
      : product
  );
};

/**
 * 상품 재고 증가
 * @param products 상품 목록
 * @param productId 상품 ID
 * @param quantity 증가할 수량
 * @returns 업데이트된 상품 목록
 */
export const increaseStock = (
  products: Product[],
  productId: string,
  quantity: number
): Product[] => {
  return products.map(product =>
    product.id === productId ? { ...product, q: product.q + quantity } : product
  );
};

/**
 * 재고 충분 여부 확인
 * @param products 상품 목록
 * @param productId 상품 ID
 * @param quantity 필요한 수량
 * @returns 재고 충분 여부
 */
export const hasEnoughStock = (
  products: Product[],
  productId: string,
  quantity: number
): boolean => {
  const product = products.find(p => p.id === productId);
  return product ? product.q >= quantity : false;
};
