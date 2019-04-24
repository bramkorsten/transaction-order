# Transaction Order

Transaction-order is a helper class designed to make creating proposed orders easier when using Google's Transaction API. This helper will help you create the javascript object, and will automatically calculate prices, tax and more when you add or remove items to your order.

The class is very barebones at the moment, but will expand in the future to include more features.

## Installation

This package is published on the NPM repository. You can install the package by running:

```shell
npm install transaction-order
```

Note that this package should only be used in combination with the actions-on-google api provided by Google, since this class uses the object structure designed by google. You can read the transaction API documentation here: https://developers.google.com/actions/transactions/

## Usage

The class can be included in your node app by adding the following code:

```javascript
const Order = require("transaction-order");

const settings = {
  currencyCode: "USD",
  taxPercent: 21
};
```

You can then use transaction-order in your app as following.

1. When first creating your order, create an instance of the Order class by calling:
```javascript
const order = new Order(settings);
order.setMerchant("merchant_id", "Merchant Name");
```

This will create a new order instance and set the merchant name and ID. You can at any point get the Javascript object of the order by calling `order.get()` This will return the object.

2. When returning the conversation (to start creating the order), make sure to add the order object to the conversation data like this:
```javascript
conv.data.order = order.get();
conv.ask(...);
```

this will make sure that you have an instance of the order available in the next intent handler, as data will not be saved between requests to your webhook.

3. When getting a new webhook request, you can get the order instance from the conversation data, and create a new Order instance with the previous order. This will preserve all data and settings:
```javascript
const orderData = conv.data.order;
const order = new Order(settings, orderData);
```

4. You can then begin adding items based on your webhook requests. An example would be adding a pizza to the order. Note that you should get most of the data about your product from your own database.
```javascript
const itemId = '1234'; // Should be consistent between items. So a pizza salami always gets id 1234
const itemName = 'Pizza Salami';
const itemPrice = 6.95;
order.addItem(itemId, itemName, itemPrice, "notes");
conv.data.order = order.get();
conv.ask(...);
```
This method can be continued for as long as your conversation requires it. See the methods section for more information about which methods you can call. Follow the standard transaction api flow your adding these items and proposing the order to the user.

## methods
Below you will find all the current methods and their parameters. You can use these methods to create your order.

***
### new Order(settings, order)
- `settings`: The settings object to include when creating an instance of the order object.
- `order`: A previous instance of the order. This will overwrite any settings. _Not required_

***
### get()
Returns a javascript representation of the order object. You can use this object when proposing the order to the user.

***
### setMerchant(id, name)
- `id`: The id of the merchant. This value should be a string without spaces.
- `name`: The name of the merchant.

***
### addItem(id, name, price, notes)
- `id`: The id of the item. This **HAS** to be consistent between items. When an item is added that already exists, it will be added as quantity, not as a new item.
- `name`: The name of the item. _only used when the item does not exist in the order_
- `price`: The price of the item. This price will be added to the subtotal. Tax will then be added, and the total will be calculated. _only used when the item does not exist in the order_
- `notes`: The notes to add to the item.

***
### removeItem(id)
- `id`: The id of the item to remove. If there is more than one of the item, the quantity will be decreased, otherwise the item will be removed.

***
### getOrderId()
Returns the randomly generated orderID. This is generated by the required package uniqid.

***
More methods will be added in the future.

## Contributing
Feel free to pull this project if you feel something can be improved! I will try to respond to as many questions as possible. Feel free to mail me at code@bramkorsten.nl.