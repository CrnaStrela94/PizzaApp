import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './home';
import { useCart } from '../CartContext';

type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  toppings: { name: string; price: number; quantity: number }[];
};

export default function ShoppingCartScreen({ route }: { route: any }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cart, updateCart } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [extraToppings, setExtraToppings] = useState<{ name: string; price: number; quantity: number }[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pickupOption, setPickupOption] = useState<'dineIn' | 'delivery' | null>(null);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    if (selectedFood) {
      const toppingsPrice = extraToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0);
      setTotalPrice(selectedFood.price + toppingsPrice);
    }
  }, [extraToppings, selectedFood]);

  const renderCartItem = ({ item, index }: { item: Food; index: number }) => (
    <View style={styles.cartItem}>
      <Text style={styles.foodIndex}>
        Food {index + 1} of {cart.length}
      </Text>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodDescription}>{item.description}</Text>
      <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setSelectedFood(item);
          setExtraToppings(item.toppings);
          setTotalPrice(item.price + item.toppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0));
          setModalVisible(true);
        }}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          const updatedCart = cart.filter((food) => food.id !== item.id);
          updateCart(updatedCart);
        }}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const handleAddTopping = (topping: { name: string; price: number; quantity: number }) => {
    setExtraToppings(extraToppings.map((t) => (t.name === topping.name ? { ...t, quantity: t.quantity + 1 } : t)));
  };

  const handleRemoveTopping = (topping: { name: string; price: number; quantity: number }) => {
    setExtraToppings(
      extraToppings.map((t) => (t.name === topping.name && t.quantity > 0 ? { ...t, quantity: t.quantity - 1 } : t))
    );
  };

  const updateCartItem = () => {
    if (selectedFood) {
      const updatedFood = {
        ...selectedFood,
        description: `${selectedFood.description} with ${extraToppings
          .filter((t) => t.quantity > 0)
          .map((t) => `${t.quantity}x ${t.name}`)
          .join(', ')}`,
        price: selectedFood.price + extraToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0),
        toppings: extraToppings.filter((t) => t.quantity > 0),
      };
      const updatedCart = cart.map((food) => (food.id === selectedFood.id ? updatedFood : food));
      updateCart(updatedCart);
      setModalVisible(false);
    }
  };

  const handleCheckout = () => {
    if (pickupOption === 'dineIn' && !tableNumber) {
      alert('Please enter your table number.');
      return;
    }
    // Handle checkout logic here
    alert(`Order placed! Pickup option: ${pickupOption}, Table number: ${tableNumber}`);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>
      <FlatList data={cart} renderItem={renderCartItem} keyExtractor={(item) => item.id.toString()} />
      <Text style={styles.totalPrice}>Total Amount: ${getTotalCartPrice()}</Text>
      <View style={styles.pickupOptions}>
        <TouchableOpacity onPress={() => setPickupOption('dineIn')}>
          <Text style={[styles.pickupOption, pickupOption === 'dineIn' && styles.selectedPickupOption]}>Dine In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPickupOption('delivery')}>
          <Text style={[styles.pickupOption, pickupOption === 'delivery' && styles.selectedPickupOption]}>
            Delivery
          </Text>
        </TouchableOpacity>
      </View>
      {pickupOption === 'dineIn' && (
        <TextInput
          style={styles.input}
          placeholder="Enter Table Number"
          value={tableNumber}
          onChangeText={setTableNumber}
        />
      )}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.continueButtonText}>Continue Shopping</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit {selectedFood?.name}</Text>
          {extraToppings.map((topping) => (
            <View key={topping.name} style={styles.toppingContainer}>
              <Text style={styles.toppingItem}>
                {topping.name} (+${topping.price.toFixed(2)})
              </Text>
              <View style={styles.toppingControls}>
                <TouchableOpacity onPress={() => handleRemoveTopping(topping)} style={styles.toppingButton}>
                  <Text style={styles.toppingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.toppingQuantity}>{topping.quantity}</Text>
                <TouchableOpacity onPress={() => handleAddTopping(topping)} style={styles.toppingButton}>
                  <Text style={styles.toppingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.totalPrice}>Total Price: ${totalPrice.toFixed(2)}</Text>
          <TouchableOpacity style={styles.updateButton} onPress={updateCartItem}>
            <Text style={styles.updateButtonText}>Update Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#d32f2f',
  },
  cartItem: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  foodIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  foodImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 5,
    textAlign: 'center',
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#757575',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickupOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  pickupOption: {
    fontSize: 18,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffccbc',
    color: '#d32f2f',
  },
  selectedPickupOption: {
    backgroundColor: '#d32f2f',
    color: '#ffffff',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  checkoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#757575',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
  },
  toppingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 5,
  },
  toppingItem: {
    fontSize: 18,
    color: '#d32f2f',
  },
  toppingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toppingButton: {
    backgroundColor: '#d32f2f',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  toppingButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toppingQuantity: {
    fontSize: 18,
    color: '#d32f2f',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#d32f2f',
  },
  updateButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#757575',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
