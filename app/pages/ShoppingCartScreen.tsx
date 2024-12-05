import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './home';
import { useCart, Food, Topping } from '../CartContext';
import React from 'react';
import foodDatabase from '../../assets/DB/foodDatabase.json';

type UserInfo = {
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
};

export default function ShoppingCartScreen({ route }: { route: any }) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cart, updateCart } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [extraToppings, setExtraToppings] = useState<Topping[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pickupOption, setPickupOption] = useState<'dineIn' | 'delivery' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (selectedFood) {
      const toppingsPrice = extraToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0);
      setTotalPrice((selectedFood.basePrice ?? 0) + toppingsPrice);
    }
  }, [extraToppings, selectedFood]);

  useEffect(() => {
    // Fetch user info if registered
    const fetchUserInfo = async () => {
      // Replace with actual user info fetching logic
      const user: UserInfo = {
        streetAddress: '123 Main St',
        postalCode: '12345',
        city: 'Anytown',
        country: 'USA',
      };
      setUserInfo(user);
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo && pickupOption === 'delivery') {
      setStreetAddress(userInfo.streetAddress);
      setPostalCode(userInfo.postalCode);
      setCity(userInfo.city);
      setCountry(userInfo.country);
    }
  }, [userInfo, pickupOption]);

  const renderCartItem = ({ item, index }: { item: Food; index: number }) => {
    // Ensure basePrice is set
    const itemCopy = { ...item };

    if (itemCopy.basePrice === undefined) {
      const toppingTotal = itemCopy.toppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0);
      itemCopy.basePrice = itemCopy.price - toppingTotal;
    }

    return (
      <View style={styles.cartItem}>
        <Text style={styles.foodIndex}>
          Food {index + 1} of {cart.length}
        </Text>
        <Image source={{ uri: itemCopy.image }} style={styles.foodImage} />
        <Text style={styles.foodName}>{itemCopy.name}</Text>
        <Text style={styles.foodDescription}>{itemCopy.description}</Text>
        <Text style={styles.foodPrice}>${itemCopy.price.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            // Get the full list of available toppings from the foodDatabase
            const foodFromDatabase = foodDatabase.find((food) => food.id === itemCopy.id);

            // If found, use its toppings as available toppings
            const availableToppings = foodFromDatabase
              ? foodFromDatabase.toppings.map((topping) => ({ ...topping }))
              : [];

            // Merge existing toppings with available toppings
            const mergedToppings = availableToppings.map((availableTopping) => {
              const existingTopping = itemCopy.toppings.find((t) => t.name === availableTopping.name);
              return {
                ...availableTopping,
                quantity: existingTopping ? existingTopping.quantity : 0,
              };
            });

            setSelectedFood(itemCopy);
            setExtraToppings(mergedToppings);
            setTotalPrice(
              (itemCopy.basePrice ?? 0) +
                mergedToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0)
            );
            setModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            const updatedCart = cart.filter((food) => food.id !== itemCopy.id);
            updateCart(updatedCart);
          }}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleAddTopping = (topping: Topping) => {
    setExtraToppings(extraToppings.map((t) => (t.name === topping.name ? { ...t, quantity: t.quantity + 1 } : t)));
  };

  const handleRemoveTopping = (topping: Topping) => {
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
        price:
          (selectedFood.basePrice ?? 0) +
          extraToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0),
        toppings: extraToppings,
      };
      const updatedCart = cart.map((food) => (food.id === selectedFood.id ? updatedFood : food));
      updateCart(updatedCart);
      setModalVisible(false);
    }
  };

  const handleCheckout = () => {
    if (!pickupOption) {
      alert('Please select a pickup option.');
      return;
    }
    if (pickupOption === 'dineIn' && !tableNumber) {
      alert('Please enter your table number.');
      return;
    }
    if (pickupOption === 'delivery' && (!streetAddress || !postalCode || !city || !country)) {
      alert('Please enter your delivery address.');
      return;
    }
    // Handle checkout logic here
    if (pickupOption === 'dineIn') {
      alert(`Order placed! Pickup option: Dine In, Table number: ${tableNumber}`);
    } else if (pickupOption === 'delivery') {
      alert(`Order placed! Pickup option: Delivery, Address: ${streetAddress}, ${postalCode}, ${city}, ${country}`);
    }
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleTableNumberChange = (text: string) => {
    if (/^\d*$/.test(text)) {
      setTableNumber(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>
      <FlatList
        data={cart.map((item) => ({
          ...item,
          basePrice:
            item.basePrice !== undefined
              ? item.basePrice
              : item.price - item.toppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0),
        }))}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
      />
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
          onChangeText={handleTableNumberChange}
          keyboardType="numeric"
        />
      )}
      {pickupOption === 'delivery' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Street Address"
            value={streetAddress}
            onChangeText={setStreetAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Postal Code"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
          />
          <TextInput style={styles.input} placeholder="Enter City" value={city} onChangeText={setCity} />
          <TextInput style={styles.input} placeholder="Enter Country" value={country} onChangeText={setCountry} />
        </>
      )}
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Home', { refresh: true })}>
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
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
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
  modalOverlay: {
    flex: 1,
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
