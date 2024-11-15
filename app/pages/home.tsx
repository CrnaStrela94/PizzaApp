import  { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  home: undefined;
  settings: undefined;
  order: { pizzaId: number };
  edit: { pizzaId: number };
};

type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

const foods: Food[] = [
  { id: 1, name: 'Margherita', description: 'Classic pizza with tomatoes and mozzarella', price: 8.99, image: 'https://example.com/margherita.jpg', category: 'Pizzas' },
  { id: 2, name: 'Pepperoni', description: 'Pepperoni, mozzarella, and tomato sauce', price: 9.99, image: 'https://example.com/pepperoni.jpg', category: 'Pizzas' },
  { id: 3, name: 'Hawaiian', description: 'Ham, pineapple, and mozzarella', price: 10.99, image: 'https://example.com/hawaiian.jpg', category: 'Pizzas' },
  { id: 4, name: 'Veggie', description: 'Bell peppers, onions, mushrooms, and mozzarella', price: 9.49, image: 'https://example.com/veggie.jpg', category: 'Pizzas' },
  { id: 5, name: 'Cheeseburger', description: 'Beef patty, cheddar cheese, lettuce, and tomato', price: 7.99, image: 'https://example.com/cheeseburger.jpg', category: 'Hamburgers' },
  { id: 6, name: 'Chicken Burger', description: 'Grilled chicken, lettuce, tomato, and mayo', price: 8.49, image: 'https://example.com/chickenburger.jpg', category: 'Hamburgers' },
  { id: 7, name: 'Caesar Salad', description: 'Romaine lettuce, croutons, and Caesar dressing', price: 6.99, image: 'https://example.com/caesarsalad.jpg', category: 'Salads' },
  { id: 8, name: 'Greek Salad', description: 'Tomatoes, cucumbers, olives, and feta cheese', price: 7.49, image: 'https://example.com/greeksalad.jpg', category: 'Salads' },
];

const categories = ['Pizzas', 'Hamburgers', 'Salads'];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [extraToppings, setExtraToppings] = useState('');

  const renderFood = ({ item }: { item: Food }) => (
    <View style={styles.foodContainer}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <Text style={styles.foodName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>${item.price.toFixed(2)}</Text>
      <Button title="Order" onPress={() => navigation.navigate('order', { pizzaId: item.id })} />
      <Button title="Edit" onPress={() => {
        setSelectedFood(item);
        setModalVisible(true);
      }} />
    </View>
  );

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
        data={foods.filter(food => food.category === selectedCategory)}
        renderItem={renderFood}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
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
          <TextInput
            style={styles.input}
            placeholder="Extra Toppings"
            value={extraToppings}
            onChangeText={setExtraToppings}
          />
          <Button title="Save" onPress={() => {
            // Handle save logic here
            console.log('Extra Toppings:', extraToppings);
            setModalVisible(false);
          }} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff3e0',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 10,
  },
  menu: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  menuItem: {
    fontSize: 18,
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#ffe0b2',
  },
  selectedMenuItem: {
    backgroundColor: '#ffb74d',
  },
  foodContainer: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 10,
    backgroundColor: '#ffe0b2',
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
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
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});