/**
 * 상품 선택 컴포넌트
 * @returns 상품 선택 DOM Element
 */
export function ProductSelector(): HTMLElement {
  const productSelector = document.createElement('select');
  productSelector.id = 'product-select';
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  return productSelector;
}
