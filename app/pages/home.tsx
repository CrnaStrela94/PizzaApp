import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import foodDatabase from '../../assets/DB/foodDatabase.json';
import { Food, useCart } from '../CartContext';

export type RootStackParamList = {
  settings: undefined;
  order: { pizzaId: number };
  edit: { pizzaId: number };
  Home: { refresh?: boolean };
  Review: { foodId: number };
  ShoppingCart: undefined;
  Settings: undefined;
  Order: { pizzaId: number };
};

const categories = ['Pizzas', 'Hamburgers', 'Salads'];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cart, addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodData, setFoodData] = useState<Food[]>(foodDatabase);

  useFocusEffect(
    React.useCallback(() => {
      const loadFoodData = async () => {
        const fileUri = FileSystem.documentDirectory + 'foodDatabase.json';
        const newFoodDatabase = await FileSystem.readAsStringAsync(fileUri);
        const parsedFoodDatabase = JSON.parse(newFoodDatabase);

        const storedReviews = await AsyncStorage.getItem('foodReviews');
        const reviews = storedReviews ? JSON.parse(storedReviews) : {};

        const updatedFoodData = parsedFoodDatabase.map((food: Food) => {
          if (reviews[food.id]) {
            return {
              ...food,
              reviews: reviews[food.id],
            };
          }
          return food;
        });

        setFoodData(updatedFoodData);
      };

      loadFoodData();
    }, [])
  );

  const renderFood = ({ item }: { item: Food }) => {
    const averageRating =
      item.reviews && item.reviews.length > 0
        ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
        : 0;

    return (
      <View style={styles.foodContainer}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDescription}>{item.description}</Text>
        <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesome key={star} name={star <= averageRating ? 'star' : 'star-o'} size={20} color="#ffd700" />
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            setSelectedFood(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('Review', { foodId: item.id })}
        >
          <Text style={styles.reviewButtonText}>Leave a Review</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleAddToCart = () => {
    if (selectedFood) {
      addToCart(selectedFood);
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
        data={foodData.filter((food) => food.category === selectedCategory)}
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
          <Text style={styles.modalTitle}>{selectedFood?.name}</Text>
          <Image source={{ uri: selectedFood?.image }} style={styles.modalImage} />
          <Text style={styles.modalDescription}>{selectedFood?.description}</Text>
          <Text style={styles.modalPrice}>Price: ${selectedFood?.price.toFixed(2)}</Text>
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
  reviewButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  reviewButtonText: {
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
  modalImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 20,
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
});
