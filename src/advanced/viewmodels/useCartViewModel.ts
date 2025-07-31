/**
 * ========================================
 * Cart ViewModel (MVVM - ViewModel)
 * ========================================
 *
 * 장바구니 도메인의 비즈니스 로직과 상태 관리를 담당하는 ViewModel입니다.
 * 기존 src/basic/features/cart/의 로직들을 Jotai 기반 훅으로 변환합니다.
 */

import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  cartStateAtom,
  CartItemModel,
  type CartState,
} from '../features/cart/model/CartModel';
import { ProductModel } from '../features/product/model/ProductModel';
import { useUIViewModel } from './useUIViewModel';

/**
 * 장바구니 ViewModel 훅
 *
 * 기존 cartState.ts의 useCartState 함수를 대체하여
 * React + Jotai 기반으로 장바구니 상태와 비즈니스 로직을 제공합니다.
 */
export const useCartViewModel = () => {
  const [cartState, setCartState] = useAtom(cartStateAtom);
  const { setHeaderItemCount } = useUIViewModel();

  // 헤더 아이템 카운트 자동 업데이트
  useEffect(() => {
    setHeaderItemCount(cartState.itemCount);
  }, [cartState.itemCount, setHeaderItemCount]);

  /**
   * 장바구니에 상품 추가
   * 기존 cartState.ts의 'ADD_ITEM' 액션과 동일한 로직
   */
  const addItem = useCallback(
    (product: ProductModel, quantity: number) => {
      // 재고 확인
      if (product.q === 0) {
        return false; // 품절 상품
      }

      setCartState(prevState => {
        const existingItem = prevState.items.find(
          item => item.product.id === product.id
        );

        let newItems;
        let newQuantity = quantity;

        if (existingItem) {
          // 기존 아이템이 있으면 수량 증가
          const totalQuantity = existingItem.quantity + quantity;
          // 재고 한도 확인
          if (totalQuantity > product.q) {
            newQuantity = product.q - existingItem.quantity; // 재고 한도만큼만 추가
            if (newQuantity <= 0) {
              return prevState; // 추가할 수 없음
            }
          }
          newItems = prevState.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + newQuantity }
              : item
          );
        } else {
          // 새 아이템 추가
          // 재고 한도 확인
          if (quantity > product.q) {
            newQuantity = product.q; // 재고 한도만큼만 추가
          }
          newItems = [...prevState.items, { product, quantity: newQuantity }];
        }

        // 총계 계산
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newSubtotal = newItems.reduce(
          (total, item) => total + item.product.val * item.quantity,
          0
        );

        return {
          ...prevState,
          items: newItems,
          itemCount: newItemCount,
          subtotal: newSubtotal,
          totalAmount: newSubtotal,
        };
      });

      // 재고 감소 (Product 상태 업데이트)
      if (quantity > 0) {
        // Product ViewModel을 통해 재고 감소
        // 이 부분은 Product ViewModel과의 연동이 필요합니다
      }

      return true;
    },
    [setCartState]
  );

  /**
   * 장바구니 아이템 수량 업데이트
   * 기존 cartState.ts의 'UPDATE_ITEM_QUANTITY' 액션과 동일한 로직
   */
  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCartState(prevState => {
        const newItems = prevState.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );

        // 총계 계산
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newSubtotal = newItems.reduce(
          (total, item) => total + item.product.val * item.quantity,
          0
        );

        return {
          ...prevState,
          items: newItems,
          itemCount: newItemCount,
          subtotal: newSubtotal,
          totalAmount: newSubtotal,
        };
      });
    },
    [setCartState]
  );

  /**
   * 장바구니에서 아이템 제거
   * 기존 cartState.ts의 'REMOVE_ITEM' 액션과 동일한 로직
   */
  const removeItem = useCallback(
    (productId: string) => {
      setCartState(prevState => {
        const newItems = prevState.items.filter(
          item => item.product.id !== productId
        );

        // 총계 계산
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newSubtotal = newItems.reduce(
          (total, item) => total + item.product.val * item.quantity,
          0
        );

        return {
          ...prevState,
          items: newItems,
          itemCount: newItemCount,
          subtotal: newSubtotal,
          totalAmount: newSubtotal,
        };
      });
    },
    [setCartState]
  );

  /**
   * 장바구니 전체 비우기
   * 기존 cartState.ts의 'CLEAR_CART' 액션과 동일한 로직
   */
  const clearCart = useCallback(() => {
    setCartState({
      items: [],
      totalAmount: 0,
      itemCount: 0,
      subtotal: 0,
      finalTotal: 0,
      itemDiscounts: [],
    });
  }, [setCartState]);

  /**
   * 장바구니 총계 계산
   * 기존 cartState.ts의 'CALCULATE_CART_TOTALS' 액션과 동일한 로직
   */
  const calculateTotals = useCallback(() => {
    setCartState(prevState => {
      const newItemCount = prevState.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const newSubtotal = prevState.items.reduce(
        (total, item) => total + item.product.val * item.quantity,
        0
      );
      const newTotalAmount = newSubtotal; // 기본값, 할인 로직은 별도로 계산

      return {
        ...prevState,
        itemCount: newItemCount,
        subtotal: newSubtotal,
        totalAmount: newTotalAmount,
      };
    });
  }, [setCartState]);

  /**
   * 할인 정보 설정
   * 기존 cartState.ts의 'SET_ITEM_DISCOUNTS' 액션과 동일한 로직
   */
  const setItemDiscounts = useCallback(
    (discounts: CartState['itemDiscounts']) => {
      setCartState(prevState => ({
        ...prevState,
        itemDiscounts: discounts,
      }));
    },
    [setCartState]
  );

  /**
   * 최종 총액 설정
   * 기존 cartState.ts의 'SET_FINAL_TOTAL' 액션과 동일한 로직
   */
  const setFinalTotal = useCallback(
    (finalTotal: number) => {
      setCartState(prevState => ({
        ...prevState,
        finalTotal,
      }));
    },
    [setCartState]
  );

  // ViewModel에서 제공하는 상태와 함수들 반환
  return {
    // 상태 (읽기 전용)
    cartState,
    items: cartState.items,
    totalAmount: cartState.totalAmount,
    itemCount: cartState.itemCount,
    subtotal: cartState.subtotal,
    finalTotal: cartState.finalTotal,
    itemDiscounts: cartState.itemDiscounts,

    // 액션 함수들
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    calculateTotals,
    setItemDiscounts,
    setFinalTotal,
  };
};

/**
 * 개별 장바구니 아이템을 위한 ViewModel 훅
 *
 * 특정 장바구니 아이템의 상태와 조작 함수를 제공합니다.
 */
export const useCartItemViewModel = (productId: string) => {
  const { items, updateItemQuantity, removeItem } = useCartViewModel();

  const cartItem = items.find(item => item.product.id === productId);

  const updateQuantity = useCallback(
    (quantity: number) => {
      updateItemQuantity(productId, quantity);
    },
    [productId, updateItemQuantity]
  );

  const remove = useCallback(() => {
    removeItem(productId);
  }, [productId, removeItem]);

  const increaseQuantity = useCallback(() => {
    if (cartItem) {
      updateQuantity(cartItem.quantity + 1);
    }
  }, [cartItem, updateQuantity]);

  const decreaseQuantity = useCallback(() => {
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(cartItem.quantity - 1);
    }
  }, [cartItem, updateQuantity]);

  return {
    cartItem,
    updateQuantity,
    remove,
    increaseQuantity,
    decreaseQuantity,
    isInCart: !!cartItem,
    quantity: cartItem?.quantity || 0,
  };
};
