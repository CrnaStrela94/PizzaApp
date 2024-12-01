import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import foodDatabase from '../../assets/DB/foodDatabase.json';
import { useCart } from '../CartContext';

export type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  order: { pizzaId: number };
  edit: { pizzaId: number };
  ShoppingCart: undefined;
};

type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  toppings: { name: string; price: number; quantity: number }[];
};

const categories = ['Pizzas', 'Hamburgers', 'Salads'];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cart, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [extraToppings, setExtraToppings] = useState<{ name: string; price: number; quantity: number }[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (selectedFood) {
      const toppingsPrice = extraToppings.reduce((sum, topping) => sum + topping.price * topping.quantity, 0);
      setTotalPrice(selectedFood.price + toppingsPrice);
    }
  }, [extraToppings, selectedFood]);

  const renderFood = ({ item }: { item: Food }) => (
    <View style={styles.foodContainer}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodDescription}>{item.description}</Text>
      <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => {
          setSelectedFood(item);
          setExtraToppings(item.toppings.map((topping) => ({ ...topping, quantity: 0 })));
          setModalVisible(true);
        }}
      >
        <Text style={styles.viewButtonText}>View</Text>
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

  const handleAddToCart = () => {
    if (selectedFood) {
      const updatedFood = {
        ...selectedFood,
        description: `${selectedFood.description} with ${extraToppings
          .filter((t) => t.quantity > 0)
          .map((t) => `${t.quantity}x ${t.name}`)
          .join(', ')}`,
        price: totalPrice,
        toppings: extraToppings.filter((t) => t.quantity > 0),
      };
      addToCart(updatedFood);
      setModalVisible(false);
    }
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pizza Shop</Text>
      <ScrollView horizontal style={styles.menu}>
        {categories.map((category) => (
          <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)}>
            <Text style={[styles.menuItem, selectedCategory === category && styles.selectedMenuItem]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.subtitle}>Featured Food</Text>
      <FlatList
        data={foodDatabase.filter((food) => food.category === selectedCategory)}
        renderItem={renderFood}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('ShoppingCart')}>
        <Text style={styles.cartButtonText}>
          Go to Cart ({cart.length} items, ${getTotalCartPrice()})
        </Text>
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
          {selectedFood?.toppings.map((topping) => (
            <View key={topping.name} style={styles.toppingContainer}>
              <Text style={styles.toppingItem}>
                {topping.name} (+${topping.price.toFixed(2)})
              </Text>
              <View style={styles.toppingControls}>
                <TouchableOpacity onPress={() => handleRemoveTopping(topping)} style={styles.toppingButton}>
                  <Text style={styles.toppingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.toppingQuantity}>
                  {extraToppings.find((t) => t.name === topping.name)?.quantity || 0}
                </Text>
                <TouchableOpacity onPress={() => handleAddTopping(topping)} style={styles.toppingButton}>
                  <Text style={styles.toppingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.totalPrice}>Total Price: ${totalPrice.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
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
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
    color: '#d32f2f',
  },
  menu: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  menuItem: {
    fontSize: 18,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffccbc',
    color: '#d32f2f',
  },
  selectedMenuItem: {
    backgroundColor: '#d32f2f',
    color: '#ffffff',
  },
  foodContainer: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
  viewButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  cartButtonText: {
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
  addButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  addButtonText: {
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
