# PizzaApp 🍕

Welcome to PizzaApp, a mobile application for ordering delicious pizzas, hamburgers, and salads. This app is created by me Luka Arsenijevic and is intended for use by my company. The app is not open source and is not licensed under MIT or any other open-source license.

## Features

- Browse a variety of food categories including Pizzas, Hamburgers, and Salads.
- View detailed information about each food item, including ingredients and price.
- Customize your order with additional toppings.
- Leave reviews and ratings for food items.
- Manage your shopping cart and proceed to checkout.
- User settings for managing personal information and payment settings.

## Getting Started

To get started with PizzaApp, follow these steps:

### Prerequisites

- Node.js and npm installed on your machine.
- Expo CLI installed globally. You can install it using the following command:

  ```bash
  npm install -g expo-cli
  ```

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/CrnaStrela94/PizzaApp.git
   ```

2. Navigate to the project directory:

   ```bash
   cd PizzaApp
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Running the App

To run the app, use the following command:

```bash
npx expo start
```

If you encounter any connection issues, you can specify a different port using the `--port` option:

```bash
npx expo start --port 8088
```

### Opening the App

After starting the app, you will see options to open the app in various environments:

- **Development build**: Use this option for a full-featured development environment.
- **Android emulator**: Open the app in an Android emulator.
- **iOS simulator**: Open the app in an iOS simulator.
- **Expo Go**: Use the Expo Go app on your physical device to preview the app.

## Project Structure

The project structure is organized as follows:

- **assets/DB/foodDatabase.json**: Contains the food items and their details.
- **app/pages**: Contains the main pages of the app, including Home, Review, Settings, and ShoppingCart.
- **app/CartContext.tsx**: Contains the context for managing the shopping cart.
- **app/README.md**: This README file.

## Author

Luka Arsenijevic

## License

This project is not open source and is intended for use by my company. All rights reserved.
