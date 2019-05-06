class Order {
  constructor(settings, order = undefined) {
    // Setup a default order using the parameters passed to the constructor and return.
    this.settings = {
      currencyCode: "USD",
      taxPercent: 21,
      names: {
        subtotal: "Subtotal",
        tax: "Tax"
      }
    };

    if (settings) {
      this.settings = Object.assign(this.settings, settings);
    }

    if (order) {
      console.log("Restoring order");
      this.order = order;
      return this;
    }
    console.log("Constructing fresh order");

    const UNIQUE_ORDER_ID = Math.random()
      .toString(32)
      .substr(2);
    this.order = {
      id: UNIQUE_ORDER_ID,
      cart: {
        merchant: {
          id: "merchant_id",
          name: "Merchant Name"
        },
        lineItems: [],
        notes: "",
        otherItems: []
      },
      otherItems: [
        {
          name: this.settings.names.subtotal,
          id: "subtotal",
          price: {
            amount: {
              currencyCode: this.settings.currencyCode,
              nanos: 0,
              units: 0
            },
            type: "ESTIMATE"
          },
          type: "SUBTOTAL"
        },
        {
          name: this.settings.names.tax,
          id: "tax",
          price: {
            amount: {
              currencyCode: this.settings.currencyCode,
              nanos: 0,
              units: 0
            },
            type: "ESTIMATE"
          },
          type: "TAX"
        }
      ],
      totalPrice: {
        amount: {
          currencyCode: this.settings.currencyCode,
          nanos: 0,
          units: 0
        },
        type: "ACTUAL"
      }
    };

    return this;
  }

  /**
   * Get the current order as a javascript object
   * @return {Object} the object representation of the order
   */
  get() {
    return this.order;
  }

  /**
   * Set the name and ID of the merchant
   * @param {String} id   Unique id of the merchant
   * @param {String} name The name of the merchant
   */
  setMerchant(id, name) {
    this.order.cart.merchant = {
      id: id,
      name: name
    };
    return this;
  }

  /**
   * Add a item to the itemList of the order, and update the price
   * @param {String} id         The id of the item to add. Should be consistent in an item.
   * @param {String} name       Name of the item
   * @param {Any}    price      Price of the item
   * @param {String} notes      Notes to add to the item
   */
  addItem(id, name, price, notes = "") {
    const items = this.order.cart.lineItems;
    // check if
    let obj = items.find((o, i) => {
      if (o.id === id) {
        let quantity = items[i].quantity;
        quantity++;
        items[i].quantity = quantity;
        this.order.cart.lineItems = items;
        // TODO: Add the new price to the total

        return this;
      }
    });

    if (obj != undefined) {
      this._addToPrice(price);
      return this;
    }

    price = parseFloat(price).toFixed(9);
    const units = parseInt(price.split(".")[0]);
    const nanos = price.split(".")[1];
    const item = {
      name: name,
      id: id,
      price: {
        amount: {
          currencyCode: this.settings.currencyCode,
          nanos: nanos,
          units: units
        },
        type: "ACTUAL"
      },
      quantity: 1,
      subLines: [
        {
          note: notes
        }
      ],
      type: "REGULAR"
    };

    this.order.cart.lineItems.push(item);
    this._addToPrice(price);
    return this;
  }

  /**
   * Remove an item from the itemList
   * @param  {String} id The id of the item to remove
   * @return {Order}       Returns the instance of the Order
   */
  removeItem(id) {
    const items = this.order.cart.lineItems;

    let obj = items.find((o, i) => {
      if (o.id === id) {
        let quantity = o.quantity;
        const price = -this._getPriceFromAmount(o.price.amount);
        if (quantity == 1) {
          items.splice(i, 1);
          this.order.cart.lineItems = items;
        } else {
          quantity--;
          items[i].quantity = quantity;
          this.order.cart.lineItems = items;
        }
        this._addToPrice(price);
        // TODO: Add the new price to the total

        return this;
      }
    });

    if (obj == undefined) {
      console.log("Could not find the item to remove");
      return this;
    }
  }

  getOrderId() {
    return this.order.id;
  }

  _addToPrice(amount) {
    amount = parseFloat(amount).toFixed(9);

    const otherItems = this.order.otherItems;
    let subtotal = otherItems.find((o, i) => {
      if (o.id === "subtotal") {
        let price = o.price;
        const oldAmount = parseFloat(
          price.amount.units + "." + price.amount.nanos
        );
        const newAmount = parseFloat(
          parseFloat(oldAmount) + parseFloat(amount)
        ).toFixed(9);
        price.amount.units = parseInt(newAmount.split(".")[0]);
        price.amount.nanos = newAmount.split(".")[1];
        this.order.otherItems[i].price = price;
        this._calculateTotal();
        // console.log(newAmount);
        return this;
      }
    });
  }

  _calculateTotal() {
    const otherItems = this.order.otherItems;
    const subTotalObject = otherItems.find(o => o.id === "subtotal");
    const subTotalPrice = this._getPriceFromAmount(subTotalObject.price.amount);
    let tax = {
      object: otherItems.find(o => o.id === "btw"),
      index: otherItems.findIndex(o => o.id === "btw"),
      percentage: this.settings.taxPercent
    };

    const taxPrice = parseFloat(percentage(subTotalPrice, tax.percentage));
    tax.object.price.amount = this._createAmountFromPrice(taxPrice);

    this.order.otherItems[tax.index] = tax.object;
    // console.log(tax.object);

    let totalObject = this.order.totalPrice;
    const totalPrice = subTotalPrice + taxPrice;
    totalObject.amount = this._createAmountFromPrice(totalPrice);
    this.order.totalPrice = totalObject;

    // console.log();
    // console.log(subTotal);
  }

  _getPriceFromAmount(amountObject) {
    const units = amountObject.units;
    const nanos = amountObject.nanos;
    return parseFloat(units + "." + nanos);
  }

  _createAmountFromPrice(price) {
    price = String(price.toFixed(9));
    const amount = {
      currencyCode: this.settings.currencyCode,
      nanos: parseInt(price.split(".")[1]),
      units: parseInt(price.split(".")[0])
    };
    return amount;
  }
}

function percentage(num, per) {
  return (num / 100) * per;
}

module.exports = Order;
