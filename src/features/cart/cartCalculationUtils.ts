import { Product } from '../product/productUtils.ts';
import { CartItem } from '../points/pointsUtils.ts';
import { calculateIndividualDiscount } from './discountUtils.ts';

/**
 * 장바구니 아이템 계산 결과 타입 정의
 */
export interface CartItemCalculation {
  product: Product;
  quantity: number;
  subtotal: number;
  discount: number;
  discountedTotal: number;
}

/**
 * 장바구니 총계 계산 결과 타입 정의
 */
export interface CartTotals {
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  itemDiscounts: Array<{ name: string; discount: number }>;
}

/**
 * 장바구니 아이템별 계산
 * @param cartItems 장바구니 아이템 목록
 * @param products 상품 목록
 * @returns 계산된 장바구니 아이템 목록
 */
export const calculateCartItems = (
  cartItems: CartItem[],
  products: Product[]
): CartItemCalculation[] => {
  return cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) {
      throw new Error(`Product not found: ${cartItem.id}`);
    }

    const subtotal = product.val * cartItem.quantity;
    const discount = calculateIndividualDiscount(product, cartItem.quantity);
    const discountedTotal = subtotal * (1 - discount);

    return {
      product,
      quantity: cartItem.quantity,
      subtotal,
      discount,
      discountedTotal,
    };
  });
};

/**
 * 장바구니 총계 계산
 * @param cartItemCalculations 계산된 장바구니 아이템 목록
 * @returns 장바구니 총계
 */
export const calculateCartTotals = (
  cartItemCalculations: CartItemCalculation[]
): CartTotals => {
  const result = cartItemCalculations.reduce(
    (acc, item) => ({
      totalQuantity: acc.totalQuantity + item.quantity,
      subtotal: acc.subtotal + item.subtotal,
      totalDiscount: acc.totalDiscount + item.subtotal * item.discount,
      finalTotal: acc.finalTotal + item.discountedTotal,
      itemDiscounts:
        item.discount > 0
          ? [
              ...acc.itemDiscounts,
              { name: item.product.name, discount: item.discount * 100 },
            ]
          : acc.itemDiscounts,
    }),
    {
      totalQuantity: 0,
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      itemDiscounts: [] as Array<{ name: string; discount: number }>,
    }
  );

  return result;
};

/**
 * 장바구니 아이템에서 수량 정보 추출
 * @param cartItems DOM 요소로 된 장바구니 아이템들
 * @returns 수량 정보 객체
 */
export const extractQuantitiesFromDOM = (
  cartItems: HTMLCollection
): Record<string, number> => {
  const quantities: Record<string, number> = {};

  Array.from(cartItems).forEach(cartItem => {
    const itemId = cartItem.id;
    const qtyElem = cartItem.querySelector('.quantity-number');
    if (qtyElem) {
      quantities[itemId] = parseInt(qtyElem.textContent || '0');
    }
  });

  return quantities;
};

/**
 * 장바구니 아이템을 CartItem 배열로 변환
 * @param cartItems DOM 요소로 된 장바구니 아이템들
 * @returns CartItem 배열
 */
export const convertDOMToCartItems = (
  cartItems: HTMLCollection
): CartItem[] => {
  return Array.from(cartItems).map(cartItem => {
    const qtyElem = cartItem.querySelector('.quantity-number');
    const quantity = parseInt(qtyElem?.textContent || '0');

    return {
      id: cartItem.id,
      quantity,
    };
  });
};

/**
 * 장바구니 계산 통합 함수
 * @param cartItems DOM 요소로 된 장바구니 아이템들
 * @param products 상품 목록
 * @returns 장바구니 계산 결과
 */
export const calculateCart = (
  cartItems: HTMLCollection,
  products: Product[]
): { cartItemCalculations: CartItemCalculation[]; cartTotals: CartTotals } => {
  const cartItemArray = convertDOMToCartItems(cartItems);
  const cartItemCalculations = calculateCartItems(cartItemArray, products);
  const cartTotals = calculateCartTotals(cartItemCalculations);

  return {
    cartItemCalculations,
    cartTotals,
  };
};
