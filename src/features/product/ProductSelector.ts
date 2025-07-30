import { addEvent } from '../events/eventManager.ts';
import { useProductState } from './store/productState.ts';
import { calculateTotalStock } from '../stock/stockUtils.ts';
import {
  createProductOptions,
  getDropdownBorderColor,
  renderProductOptions,
} from './productOptionUtils.ts';

/**
 * 상품 선택 드롭다운 컴포넌트
 * @returns 상품 선택 드롭다운 DOM Element
 */
export function ProductSelector(): HTMLElement {
  const productSelector = document.createElement('select');
  productSelector.id = 'product-select';
  productSelector.className =
    'w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent';

  // 상품 옵션 업데이트 함수
  const updateSelectOptions = () => {
    // 드롭다운 초기화
    productSelector.innerHTML = '';

    // 상품 도메인 상태에서 상품 목록 가져오기
    const state = useProductState().getState();
    const products = state.products;

    // 전체 재고 계산
    const totalStock = calculateTotalStock(products);

    // 상품 옵션 생성 및 렌더링
    const productOptions = createProductOptions(products);
    const optionsHTML = renderProductOptions(productOptions);
    productSelector.innerHTML = optionsHTML;

    // 재고 부족 시 드롭다운 테두리 색상 변경
    const borderColor = getDropdownBorderColor(totalStock);
    productSelector.style.borderColor = borderColor;

    // 마지막 선택된 상품이 있으면 선택
    const lastSelected = state.lastSelected;
    if (lastSelected) {
      productSelector.value = lastSelected;
    }
  };

  // 초기 옵션 설정
  updateSelectOptions();

  // 상품 선택 변경 이벤트
  addEvent(productSelector, 'change', () => {
    const selectedValue = productSelector.value;
    if (selectedValue) {
      const { dispatch: productDispatch } = useProductState();
      productDispatch({ type: 'SET_LAST_SELECTED', payload: selectedValue });
    }
  });

  return productSelector;
}
