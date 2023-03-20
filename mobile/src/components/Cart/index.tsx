import { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { CartItem } from '../../types/CartItem';
import { Product } from '../../types/Product';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../Button';
import { MinusCircle } from '../Icons/MinusCircle';
import { PlusCircle } from '../Icons/PlusCircle';
import { OrderConfirmedModal } from '../OrderConfirmedModal';
import { Text } from '../Text';

import { Actions, Image, Item, ProductContainer, ProductDetails, QuantityContainer, Summary, TotalContainer } from './styles';

interface CartProps {
  cartItems: CartItem[];
  onAdd: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onConfirmOrder: () => void;
  selectedTable: string;
}

export function Cart({ cartItems, onAdd, onDecrement, onConfirmOrder, selectedTable }: CartProps) {
  const [isOrderModalConfirmed, setIsOrderModalConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const total = cartItems.reduce((total, { product, quantity }) => {
    return (product.price * quantity) + total;
  }, 0);

  async function handleConfirmOrder() {
    try {
      setIsLoading(true);

      await api.post('/orders', {
        table: selectedTable,
        products: cartItems.map((cartItem) => ({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
        })),
      });

      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }

    setIsOrderModalConfirmed(true);
  }

  function handleOk() {
    onConfirmOrder();
    setIsOrderModalConfirmed(false);
  }

  return (
    <>
      <OrderConfirmedModal
        visible={isOrderModalConfirmed}
        onOk={handleOk}
      />

      <FlatList
        data={cartItems}
        keyExtractor={cartItem => cartItem.product._id}
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: 20, maxHeight: 150 }}
        renderItem={({ item: cartItem }) => (
          <Item>
            <ProductContainer>
              <Image
                source={{
                  uri: `http://192.168.3.105:3000/uploads/${cartItem.product.imagePath}`,
                }}
              />

              <QuantityContainer>
                <Text size={14} color="#666">x{cartItem.quantity}</Text>
              </QuantityContainer>

              <ProductDetails>
                <Text size={14} weight="600">{cartItem.product.name}</Text>
                <Text size={14} color="#666" style={{ marginTop: 4 }}>
                  {formatCurrency(cartItem.product.price)}
                </Text>
              </ProductDetails>
            </ProductContainer>

            <Actions>
              <TouchableOpacity
                style={{ marginRight: 24 }}
                onPress={() => onAdd(cartItem.product)}
              >
                <PlusCircle />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onDecrement(cartItem.product)}>
                <MinusCircle />
              </TouchableOpacity>

            </Actions>
          </Item>
        )}
      />

      <Summary>
        <TotalContainer>
          {cartItems.length > 0 ? (
            <>
              <Text color="#666">Total</Text>
              <Text size={20} weight="600">{formatCurrency(total)}</Text>
            </>
          ) : (
            <>
              <Text color="#999">Seu carrinho</Text>
              <Text color="#999">está vazio</Text>
            </>
          )}
        </TotalContainer>

        <Button
          onPress={handleConfirmOrder}
          disabled={cartItems.length > 0 ? false : true}
          loading={isLoading}
        >
          Confirmar pedido
        </Button>
      </Summary>
    </>
  );
}