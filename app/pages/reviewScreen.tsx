import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import foodDatabase from '../../assets/DB/foodDatabase.json';
import { RootStackParamList } from './homeScreen';

type ReviewPageRouteProp = RouteProp<RootStackParamList, 'Review'>;

const ReviewPage = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReviewPageRouteProp>();
  const { foodId } = route.params || {};
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<
    { text: string; image: string | null; rating: number; foodName: string; foodId: number }[]
  >([]);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      const storedReviews = await AsyncStorage.getItem('foodReviews');
      const reviews = storedReviews ? JSON.parse(storedReviews) : {};
      const allReviews = Object.entries(reviews).flatMap(([id, foodReviews]: [string, any]) => {
        const food = foodDatabase.find((food) => food.id === parseInt(id));
        return foodReviews.map((review: any) => ({ ...review, foodName: food?.name || '', foodId: parseInt(id) }));
      });
      setReviews(allReviews);
    };

    loadReviews();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitReview = async () => {
    try {
      const storedReviews = await AsyncStorage.getItem('foodReviews');
      const reviews = storedReviews ? JSON.parse(storedReviews) : {};

      if (!reviews[foodId]) {
        reviews[foodId] = [];
      }

      reviews[foodId].push({ text: reviewText, image, rating });

      await AsyncStorage.setItem('foodReviews', JSON.stringify(reviews));

      setReviews((prevReviews) => [
        ...prevReviews,
        {
          text: reviewText,
          image,
          rating,
          foodName: foodDatabase.find((food) => food.id === foodId)?.name || '',
          foodId,
        },
      ]);

      alert('Review submitted!');
      navigation.navigate('Home', { refresh: true });
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const filteredReviews = selectedFoodId ? reviews.filter((review) => review.foodId === selectedFoodId) : reviews;

  if (!foodId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>All Reviews</Text>
        <ScrollView horizontal style={styles.foodList}>
          {foodDatabase.map((food) => (
            <TouchableOpacity key={food.id} onPress={() => setSelectedFoodId(food.id)}>
              <Text style={[styles.foodItem, selectedFoodId === food.id && styles.selectedFoodItem]}>{food.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filteredReviews.length > 0 ? (
          <FlatList
            data={filteredReviews}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.reviewContainer}>
                <Text style={styles.foodName}>{item.foodName}</Text>
                <Text style={styles.reviewText}>{item.text}</Text>
                {item.image && <Image source={{ uri: item.image }} style={styles.reviewImage} />}
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome key={star} name={star <= item.rating ? 'star' : 'star-o'} size={20} color="#ffd700" />
                  ))}
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noReviewsText}>No reviews available.</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave a Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your review here..."
        value={reviewText}
        onChangeText={setReviewText}
        multiline
      />
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <FontAwesome name={star <= rating ? 'star' : 'star-o'} size={32} color="#ffd700" />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an image from camera roll</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take a photo</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TouchableOpacity style={styles.button} onPress={submitReview}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Review', { foodId: 0 })}>
        <Text style={styles.buttonText}>Show All Reviews</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  reviewContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 10,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  noReviewsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodList: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  foodItem: {
    fontSize: 18,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#ffccbc',
    color: '#d32f2f',
  },
  selectedFoodItem: {
    backgroundColor: '#d32f2f',
    color: '#ffffff',
  },
});

export default ReviewPage;
