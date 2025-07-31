import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

// React 컴포넌트가 구현되면 import 할 예정
import App from '../App';
import { PRODUCTS } from '../models/ProductModel';

describe('React 장바구니 테스트', () => {
  // 공통 헬퍼 함수 - React Testing Library 버전
  const addItemsToCart = async (
    user: any,
    selector: HTMLElement,
    button: HTMLElement,
    productId: string,
    count: number
  ) => {
    await user.selectOptions(selector, productId);
    for (let i = 0; i < count; i++) {
      await user.click(button);
    }
  };

  function expectProductInfo(option: HTMLOptionElement, product: any) {
    expect(option.value).toBe(product.id);
    expect(option.textContent).toContain(product.name);
    // price가 number 타입이므로 toLocaleString()으로 포맷팅
    const expectedPrice = product.price.toLocaleString() + '원';
    expect(option.textContent).toContain(expectedPrice);
    if (product.stock === 0) {
      expect(option.disabled).toBe(true);
    } else {
      expect(option.disabled).toBe(false);
    }
  }

  const getCartItemQuantity = (
    cartContainer: HTMLElement,
    productId: string
  ): number => {
    const item = within(cartContainer).queryByTestId(`cart-item-${productId}`);
    if (!item) return 0;
    const qtyElement = within(item).queryByTestId('quantity-number');
    return qtyElement ? parseInt(qtyElement.textContent || '0') : 0;
  };

  let user: any;

  beforeEach(async () => {
    vi.useRealTimers();
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // 화요일 할인을 비활성화하기 위해 월요일로 날짜 설정
    const monday = new Date('2024-10-14'); // 월요일
    vi.setSystemTime(monday);

    // userEvent 설정
    user = userEvent.setup();

    // React App 컴포넌트 렌더링 (아직 구현되지 않음)
    render(<App />);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 2. 상품 정보 테스트
  describe('2. 상품 정보', () => {
    describe('2.1 상품 목록', () => {
      it('5개 상품이 올바른 정보로 표시되어야 함', () => {
        // 실제 ProductModel의 PRODUCTS 데이터를 사용
        const expectedProducts = PRODUCTS;

        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const options = within(selector).getAllByRole('option');

        expect(options).toHaveLength(5);

        expectedProducts.forEach((product, index) => {
          expectProductInfo(options[index] as HTMLOptionElement, product);
        });
      });
    });

    describe('2.2 재고 관리', () => {
      it('재고가 5개 미만인 상품은 "재고 부족" 표시', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        // 상품5를 6개 구매하여 재고를 4개로 만듦
        await addItemsToCart(user, selector, addButton, 'p5', 6);

        const stockInfo = screen.getByTestId('stock-status');
        expect(stockInfo).toHaveTextContent('코딩할 때 듣는 Lo-Fi 스피커');
        expect(stockInfo).toHaveTextContent('재고 부족');
        expect(stockInfo).toHaveTextContent('4개 남음');
      });

      it('재고가 0개인 상품은 "품절" 표시 및 선택 불가', () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const p4Option = within(selector).getByRole('option', {
          name: /에러 방지 노트북 파우치/i,
        });

        expect(p4Option).toBeDisabled();
        expect(p4Option).toHaveTextContent('품절');
      });
    });
  });

  // 3. 할인 정책 테스트
  describe('3. 할인 정책', () => {
    describe('3.1 개별 상품 할인', () => {
      it('상품1: 10개 이상 구매 시 10% 할인', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 10);

        // 100,000원 -> 90,000원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩90,000');
      });

      it('상품2: 10개 이상 구매 시 15% 할인', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p2', 10);

        // 200,000원 -> 170,000원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩170,000');
      });

      it('상품3: 10개 이상 구매 시 20% 할인', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p3', 10);

        // 300,000원 -> 240,000원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩240,000');
      });

      it('상품5: 10개 이상 구매 시 25% 할인', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p5', 10);

        // 디버깅: 실제 값들 확인
        const cartItems = screen.getByTestId('cart-items');
        const subtotal = screen.getByText(/소계:/);
        const discount = screen.queryByText(/할인:/);
        const total = screen.getByTestId('cart-total');

        console.log('Cart items HTML:', cartItems.innerHTML);
        console.log('Subtotal:', subtotal.parentElement?.textContent);
        console.log('Discount:', discount?.parentElement?.textContent);
        console.log('Total:', total.textContent);

        // 250,000원 -> 187,500원
        expect(total).toHaveTextContent('₩187,500');
      });
    });

    describe('3.2 전체 수량 할인', () => {
      it.skip('30개 이상 구매 시 25% 할인 (개별 할인 무시)', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        // 상품1 15개 (원래 10% 할인 대상)
        await addItemsToCart(user, selector, addButton, 'p1', 15);
        // 상품2 15개 (원래 15% 할인 대상)
        await addItemsToCart(user, selector, addButton, 'p2', 15);

        // 총 30개, 원가: 150,000 + 300,000 = 450,000원
        // 25% 할인: 337,500원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩337,500');
      });
    });

    describe('3.3 특별 할인', () => {
      it.skip('화요일 10% 추가 할인', async () => {
        // 화요일로 날짜 변경
        const tuesday = new Date('2024-10-15'); // 화요일
        vi.setSystemTime(tuesday);

        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 10);

        // 100,000원 -> 10% 할인 -> 90,000원 -> 화요일 10% 추가 할인 -> 81,000원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩81,000');
      });

      it.skip('번개세일 20% 할인', async () => {
        // 번개세일 활성화 (타이머 기반)
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 5);

        // 번개세일이 활성화되면 50,000원 -> 40,000원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩40,000');
      });

      it.skip('추천할인 5% 할인', async () => {
        // 추천할인 활성화 (타이머 기반)
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 5);

        // 추천할인이 활성화되면 50,000원 -> 47,500원
        const total = screen.getByTestId('cart-total');
        expect(total).toHaveTextContent('₩47,500');
      });
    });
  });

  // 4. 포인트 시스템 테스트
  describe('4. 포인트 시스템', () => {
    describe('4.1 기본 적립', () => {
      it.skip('최종 결제 금액의 0.1% 포인트 적립', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 10);

        // 90,000원의 0.1% = 90p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('90');
      });
    });

    describe('4.2 추가 적립', () => {
      it.skip('화요일 구매 시 기본 포인트 2배', async () => {
        // 화요일로 날짜 변경
        const tuesday = new Date('2024-10-15'); // 화요일
        vi.setSystemTime(tuesday);

        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 5);

        // 화요일 할인 적용: 50,000원 -> 45,000원
        // 기본 포인트: 45p, 화요일 2배: 90p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('90');
      });

      it.skip('키보드+마우스 세트 구매 시 +50p', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1); // 키보드
        await addItemsToCart(user, selector, addButton, 'p2', 1); // 마우스

        // 기본 포인트 + 세트 보너스 50p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('80'); // 30 + 50 = 80
      });

      it.skip('풀세트 구매 시 +100p', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1); // 키보드
        await addItemsToCart(user, selector, addButton, 'p2', 1); // 마우스
        await addItemsToCart(user, selector, addButton, 'p3', 1); // 모니터암

        // 기본 포인트 + 풀세트 보너스 100p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('160'); // 60 + 100 = 160
      });

      it.skip('대량구매 보너스: 10개 이상 +20p', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 10);

        // 기본 포인트 90p + 대량구매 보너스 20p = 110p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('110');
      });

      it.skip('대량구매 보너스: 20개 이상 +50p', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 20);

        // 할인 적용: 200,000원 -> 180,000원 (10% 할인)
        // 기본 포인트 180p + 대량구매 보너스 50p = 230p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('230');
      });

      it.skip('대량구매 보너스: 30개 이상 +100p', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 30);

        // 전체 할인 적용: 300,000원 -> 225,000원 (25% 할인)
        // 기본 포인트 225p + 대량구매 보너스 100p = 325p
        const loyaltyPoints = screen.getByTestId('loyalty-points');
        expect(loyaltyPoints).toHaveTextContent('325');
      });
    });
  });

  // 5. UI/UX 테스트
  describe('5. UI/UX', () => {
    describe('5.1 레이아웃', () => {
      it('헤더가 올바르게 표시되어야 함', () => {
        expect(screen.getByText('🛒 Hanghae Online Store')).toBeInTheDocument();
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      });

      it('좌측 영역에 상품 선택과 장바구니가 있어야 함', () => {
        expect(
          screen.getByRole('combobox', { name: /product-select/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /add-to-cart/i })
        ).toBeInTheDocument();
        expect(screen.getByTestId('cart-items')).toBeInTheDocument();
      });

      it('우측 영역에 주문 요약과 포인트가 있어야 함', () => {
        expect(screen.getByTestId('cart-total')).toBeInTheDocument();
        expect(screen.getByTestId('loyalty-points')).toBeInTheDocument();
      });

      it.skip('도움말 버튼이 고정 위치에 있어야 함', () => {
        const helpButton = screen.getByRole('button', { name: /도움말/i });
        expect(helpButton).toBeInTheDocument();
        expect(helpButton).toHaveClass('fixed', 'top-4', 'right-4');
      });
    });

    describe('5.2 장바구니 아이템 표시', () => {
      it.skip('첫 번째 아이템은 first:pt-0 클래스를 가져야 함', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1);

        const firstItem = screen.getByTestId('cart-item-p1');
        expect(firstItem).toHaveClass('first:pt-0');
      });

      it.skip('마지막 아이템은 last:border-b-0 클래스를 가져야 함', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1);
        await addItemsToCart(user, selector, addButton, 'p2', 1);

        const lastItem = screen.getByTestId('cart-item-p2');
        expect(lastItem).toHaveClass('last:border-b-0');
      });

      it.skip('상품 이미지 영역은 bg-gradient-black 클래스를 가져야 함', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1);

        const imageArea = screen.getByTestId('product-image-p1');
        expect(imageArea).toHaveClass('bg-gradient-black');
      });

      it.skip('수량 조절 버튼은 data-change 속성을 가져야 함', async () => {
        const selector = screen.getByRole('combobox', {
          name: /product-select/i,
        });
        const addButton = screen.getByRole('button', { name: /add-to-cart/i });

        await addItemsToCart(user, selector, addButton, 'p1', 1);

        const increaseButton = screen.getByTestId('quantity-increase-p1');
        const decreaseButton = screen.getByTestId('quantity-decrease-p1');

        expect(increaseButton).toHaveAttribute('data-change', '1');
        expect(decreaseButton).toHaveAttribute('data-change', '-1');
      });
    });

    describe('5.3 도움말 모달', () => {
      it.skip('도움말 버튼 클릭 시 모달이 열려야 함', async () => {
        const helpButton = screen.getByRole('button', { name: /도움말/i });
        await user.click(helpButton);

        const modal = screen.getByTestId('help-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveClass('fixed', 'inset-0');
      });

      it.skip('모달 배경 클릭 시 모달이 닫혀야 함', async () => {
        const helpButton = screen.getByRole('button', { name: /도움말/i });
        await user.click(helpButton);

        const modalBackground = screen.getByTestId('modal-background');
        await user.click(modalBackground);

        expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
      });

      it.skip('모달 패널은 fixed right-0 top-0 클래스를 가져야 함', async () => {
        const helpButton = screen.getByRole('button', { name: /도움말/i });
        await user.click(helpButton);

        const modalPanel = screen.getByTestId('modal-panel');
        expect(modalPanel).toHaveClass('fixed', 'right-0', 'top-0');
      });
    });
  });

  // 6. 기능 요구사항 테스트
  describe('6. 기능 요구사항', () => {
    it.skip('장바구니에서 상품 제거', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await addItemsToCart(user, selector, addButton, 'p1', 1);

      const removeButton = screen.getByTestId('remove-item-p1');
      await user.click(removeButton);

      const cartContainer = screen.getByTestId('cart-items');
      expect(getCartItemQuantity(cartContainer, 'p1')).toBe(0);
    });

    it.skip('수량 증감 기능', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await addItemsToCart(user, selector, addButton, 'p1', 1);

      const cartContainer = screen.getByTestId('cart-items');
      expect(getCartItemQuantity(cartContainer, 'p1')).toBe(1);

      const increaseButton = screen.getByTestId('quantity-increase-p1');
      await user.click(increaseButton);
      expect(getCartItemQuantity(cartContainer, 'p1')).toBe(2);

      const decreaseButton = screen.getByTestId('quantity-decrease-p1');
      await user.click(decreaseButton);
      expect(getCartItemQuantity(cartContainer, 'p1')).toBe(1);
    });

    it.skip('재고 한도 내 수량 제한', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      // 상품5 (재고 10개)를 11개 추가하려고 시도
      await addItemsToCart(user, selector, addButton, 'p5', 11);

      const cartContainer = screen.getByTestId('cart-items');
      expect(getCartItemQuantity(cartContainer, 'p5')).toBe(10); // 재고 한도인 10개만 추가됨
    });

    it.skip('실시간 총액 계산', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await addItemsToCart(user, selector, addButton, 'p1', 1);
      let total = screen.getByTestId('cart-total');
      expect(total).toHaveTextContent('₩10,000');

      await addItemsToCart(user, selector, addButton, 'p2', 1);
      total = screen.getByTestId('cart-total');
      expect(total).toHaveTextContent('₩30,000');
    });

    it.skip('실시간 재고 업데이트', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      // 상품5를 5개 구매하여 재고를 5개로 만듦
      await addItemsToCart(user, selector, addButton, 'p5', 5);

      const stockInfo = screen.getByTestId('stock-status');
      expect(stockInfo).toHaveTextContent('5개 남음');
    });
  });

  // 8. 예외 처리 테스트
  describe('8. 예외 처리', () => {
    it.skip('품절 상품 추가 시도 시 경고', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await user.selectOptions(selector, 'p4'); // 품절 상품
      await user.click(addButton);

      expect(window.alert).toHaveBeenCalledWith('재고가 부족합니다.');
    });

    it.skip('재고 초과 수량 추가 시 경고', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      // 상품5를 10개 추가한 후 추가로 더 추가하려고 시도
      await addItemsToCart(user, selector, addButton, 'p5', 10);

      await user.selectOptions(selector, 'p5');
      await user.click(addButton);

      expect(window.alert).toHaveBeenCalledWith('재고가 부족합니다.');
    });

    it.skip('잘못된 수량 입력 처리', async () => {
      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await addItemsToCart(user, selector, addButton, 'p1', 1);

      const quantityInput = screen.getByTestId('quantity-input-p1');
      await user.clear(quantityInput);
      await user.type(quantityInput, '0');

      const cartContainer = screen.getByTestId('cart-items');
      expect(getCartItemQuantity(cartContainer, 'p1')).toBe(1); // 수량이 변경되지 않아야 함
    });
  });

  // 복잡한 통합 시나리오 테스트
  describe('복잡한 통합 시나리오', () => {
    it.skip('화요일 + 풀세트 + 대량구매 시나리오', async () => {
      // 화요일로 날짜 변경
      const tuesday = new Date('2024-10-15');
      vi.setSystemTime(tuesday);

      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      // 풀세트 + 대량구매
      await addItemsToCart(user, selector, addButton, 'p1', 15); // 키보드 15개
      await addItemsToCart(user, selector, addButton, 'p2', 10); // 마우스 10개
      await addItemsToCart(user, selector, addButton, 'p3', 10); // 모니터암 10개

      // 총 35개, 전체 할인 25% + 화요일 10% 추가
      const total = screen.getByTestId('cart-total');
      expect(total).toHaveTextContent('₩405,000');

      // 포인트: 기본 + 화요일 2배 + 풀세트 보너스 + 대량구매 보너스
      const loyaltyPoints = screen.getByTestId('loyalty-points');
      expect(loyaltyPoints).toHaveTextContent('1010');
    });

    it.skip('모든 할인이 동시에 적용되는 복잡한 시나리오', async () => {
      // 화요일 + 번개세일 + 추천할인이 모두 활성화된 상황
      const tuesday = new Date('2024-10-15');
      vi.setSystemTime(tuesday);

      const selector = screen.getByRole('combobox', {
        name: /product-select/i,
      });
      const addButton = screen.getByRole('button', { name: /add-to-cart/i });

      await addItemsToCart(user, selector, addButton, 'p1', 5);

      // 기본: 50,000원
      // 번개세일 20%: 40,000원
      // 추천할인 5%: 38,000원
      // 화요일 10%: 34,200원
      const total = screen.getByTestId('cart-total');
      expect(total).toHaveTextContent('₩34,200');
    });
  });
});
