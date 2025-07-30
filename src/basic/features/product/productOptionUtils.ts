import { Product } from './productUtils.ts';

/**
 * 상품 옵션 타입 정의
 */
export interface ProductOption {
  value: string;
  text: string;
  disabled: boolean;
  className: string;
}

/**
 * 상품 옵션 텍스트 포맷팅
 * @param product 상품 정보
 * @returns 포맷팅된 옵션 텍스트
 */
export const formatProductOptionText = (product: Product): string => {
  let discountText = '';

  // 할인 상태 표시 텍스트 생성
  if (product.onSale) discountText += ' ⚡SALE';
  if (product.suggestSale) discountText += ' 💝추천';

  // 품절 상태 처리
  if (product.q === 0) {
    return `${product.name} - ${product.val}원 (품절)${discountText}`;
  }

  // 할인 상태에 따른 옵션 텍스트 설정
  if (product.onSale && product.suggestSale) {
    // 번개세일 + 추천할인 중복 적용
    return `⚡💝${product.name} - ${product.originalVal}원 → ${product.val}원 (25% SUPER SALE!)`;
  } else if (product.onSale) {
    // 번개세일만 적용
    return `⚡${product.name} - ${product.originalVal}원 → ${product.val}원 (20% SALE!)`;
  } else if (product.suggestSale) {
    // 추천할인만 적용
    return `💝${product.name} - ${product.originalVal}원 → ${product.val}원 (5% 추천할인!)`;
  } else {
    // 할인 없음
    return `${product.name} - ${product.val}원${discountText}`;
  }
};

/**
 * 상품 옵션 CSS 클래스 결정
 * @param product 상품 정보
 * @returns CSS 클래스명
 */
export const getProductOptionClassName = (product: Product): string => {
  if (product.q === 0) {
    return 'text-gray-400';
  }

  if (product.onSale && product.suggestSale) {
    return 'text-purple-600 font-bold';
  } else if (product.onSale) {
    return 'text-red-500 font-bold';
  } else if (product.suggestSale) {
    return 'text-blue-500 font-bold';
  }

  return '';
};

/**
 * 상품 목록을 옵션 배열로 변환
 * @param products 상품 목록
 * @returns 상품 옵션 배열
 */
export const createProductOptions = (products: Product[]): ProductOption[] => {
  return products.map(product => ({
    value: product.id,
    text: formatProductOptionText(product),
    disabled: product.q === 0,
    className: getProductOptionClassName(product),
  }));
};

/**
 * 상품 옵션을 HTML 문자열로 렌더링
 * @param options 상품 옵션 배열
 * @returns HTML 문자열
 */
export const renderProductOptions = (options: ProductOption[]): string => {
  return options
    .map(
      option =>
        `<option value="${option.value}" ${option.disabled ? 'disabled' : ''} class="${option.className}">
      ${option.text}
    </option>`
    )
    .join('');
};

/**
 * 전체 재고 수량에 따른 드롭다운 스타일 결정
 * @param totalStock 전체 재고 수량
 * @returns 테두리 색상
 */
export const getDropdownBorderColor = (totalStock: number): string => {
  return totalStock < 50 ? 'orange' : '';
};
