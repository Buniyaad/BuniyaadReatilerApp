import * as React from 'react';
import {Alert,StyleSheet,Image,FlatList,TouchableOpacity,Modal,ToastAndroid,View,BackHandler,ImageBackground} from 'react-native';
import { Badge,Body,Card,Container,Content,Text,Item,Button,Header,Footer,FooterTab,Spinner,Tabs,Tab,Input,Label} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Mixpanel} from 'mixpanel-react-native';
const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

export default class Cart extends React.Component {
  state = {
    data: [],
    retailerData: '',
    products: [],
    cart: [],
    combinedList: [],
    showSpinner: false,
    cartTotal: '',
    showModalSpinner: false,
    product: '',
    modalVisible: false,
    productPrices: [],
    price: '',
    total: 0,
    minQuantity: '',
    quantity: '',
    pricesFound: false,
    btnDisabled: false,
    amount:'',
    orderId:'',
    status:'',
    orderDetails:[],
    orderModalVisible:false,
    orderCombinedList:[],
    suggestedProductsData:[],
    isSuggested:false,
  };



  cartItemsComponent = itemData => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => this.getPrices(itemData)}>
    <Card style={styles.cartCardStyle}>

    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
   <Image
           style={styles.cartImageStyle}
           source={{uri: itemData.item.Image}}
         />

    <View style={{flexDirection:'column',justifyContent:'space-around',width:'80%'}}>
      <Text  style={{fontSize:17,color:'#737070',fontWeight:'bold'}} numberOfLines={1}>{itemData.item.Title}</Text>
   

    <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:5}}>
       <Text  style={{fontSize:15,fontWeight:'bold'}} numberOfLines={1}>Miqdaar: {itemData.item.quantity}</Text>
       <Button
       transparent
       style={{ alignSelf:'flex-end'}}
       onPress={() => this.removeProduct(itemData.item)}>
       <Icon
         name="close-circle-outline"
         color="red"
         style={{fontSize: 30,marginTop:-20}}
       />
     </Button>
    </View>

    <Text style={{fontWeight:'bold',fontSize:17,marginTop:-15}}>Rs.{itemData.item.total.toLocaleString('en-GB')}</Text>

        
    </View>
    </View>
 </Card>
 </TouchableOpacity>
 );
 

  recommendedProductsItemComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={()=>this.getSuggestedPrices(itemData)}>
      <Card style={styles.recommendedStyle}>
      <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text numberOfLines={2} style={{height:'20%',marginLeft:10,marginTop:5}}>{itemData.item.Title}</Text>
        <Text style={{color: '#FFC000',height:'20%',marginLeft:10,fontWeight:'bold',fontSize:20,marginBottom:15}}>
          Rs. {itemData.item.MinPrice.price.toLocaleString("en-GB")}
        </Text>
      </Card>
    </TouchableOpacity>
  );


  orderItemsComponent = itemData => (

    <Card style={styles.cartCardStyle}>

    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
   <Image
           style={styles.cartImageStyle}
           source={{uri: itemData.item.Image}}
         />

    <View style={{flexDirection:'column',justifyContent:'space-around',width:'80%'}}>
      <Text  style={{fontSize:17,color:'#737070',fontWeight:'bold'}} numberOfLines={1}>{itemData.item.Title}</Text>
   
      <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:5, marginTop:-5}}>
            <Text style={{fontWeight:'bold',fontSize:15,textAlignVertical:'bottom'}}>Miqdaar: { itemData.item.quantity}</Text>
            <Text style={{fontWeight:'bold',fontSize:15}}>
              Rs. {itemData.item.sellingprice.toLocaleString('en-GB')} /{itemData.item.Unit}
            </Text>
           </View>

      
      <Text style={{fontWeight:'bold',fontSize:17}}>
        Rs. {(parseInt(itemData.item.quantity)*parseInt(itemData.item.sellingprice)).toLocaleString('en-GB')}
      </Text>

        
    </View>
    </View>
 </Card>

 );

productPricesItemComponent = itemData => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#f7f7f7',
    }}>
    <Text numberOfLines={1} style={{marginLeft: 10,fontSize:17,fontWeight:'bold',marginTop:5}}>
    {itemData.item.min}
    </Text>
    <Text numberOfLines={1} style={{marginRight: 10,fontSize:17,fontWeight:'bold',marginTop:5}}>
    Rs. {itemData.item.price} /{this.state.product.Unit}
    </Text>
  </View>
);

  async storeCart(value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('cart', jsonValue);
    } catch (e) {
      // saving error
    }
  }

  async getCart() {
    try {
      const jsonValue = await AsyncStorage.getItem('cart');
      jsonValue != null ? this.setState({cart: JSON.parse(jsonValue)}) : null;
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      this.getProducts();
      this.calculateCartTotal();
      console.log('this is async cart data: ', JSON.parse(jsonValue));
    } catch (e) {
      // error reading value
    }
  }

  async getData() {
    try {
      const jsonValue = await AsyncStorage.getItem('test');
      this.setState({retailerData: JSON.parse(jsonValue)});

      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('this is async data: ', JSON.parse(jsonValue));
    } catch (e) {
      // error reading value
    }
  }

  async getProducts() {
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000);
    this.setState({showSpinner: true});
    this.getSuggestedProducts()
    for (let i = 0; i < this.state.cart.length; i++) {
      await fetch(
        `https://api.buniyaad.pk/products/getByPId/${this.state.cart[i].productId}`,
        {
          headers: {
            token: `bearer ${this.state.retailerData.token}`,
          },
          signal:controller.signal
        },
      )
        .then(response => response.json())
        .then(res => {
          res.data === null ? null : this.state.products.push(res.data);
        })
        .catch(error => {ToastAndroid.show("Network issues :(", ToastAndroid.LONG)
   });;
    }

    const mergedArray = this.state.products.map(t1 => ({
      ...t1,
      ...this.state.cart.find(t2 => t2.productId === t1._id),
    }));
    this.setState({combinedList: mergedArray, showSpinner: false});

    
  }

  calculateCartTotal() {
    total = this.state.cart.reduce(
      (previousScore, currentScore) =>
        parseInt(previousScore) + parseInt(currentScore.total),
      0,
    );
    this.setState({cartTotal: total});
  }

  async removeProduct(product) {
    let newCart = this.state.cart.filter(
      cartProduct => cartProduct.productId != product.productId,
    );
    await this.setState({cart: newCart, products: []});
    this.post_cart();
    this.storeCart(this.state.cart);
    this.getProducts();
    this.calculateCartTotal();
  }

  getSuggestedProducts(){
  
    fetch(`https://api.buniyaad.pk/carts/suggestedProducts/UserId/${this.state.retailerData.checkUser._id}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({suggestedProductsData: res.data});
        console.log("suggested: ",res.data)
      });
  }

  //get all prices
  async  getSuggestedPrices(itemData) {

    await this.setState({modalVisible:true,product:itemData.item,price:itemData.item.MinPrice,isSuggested:true})
  
     if(this.state.productPrices.length===0){
      this.setState({showModalSpinner:true})
      let prices=this.state.product.Price
      let priceArr=[]
      //console.log("prices are:", prices)
      for(let i=0; i<prices.length; i++){
        await fetch(`https://api.buniyaad.pk/price/get/${prices[i]}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res => { res.data===null?null:priceArr.push(res.data)})
        
      }
      
      let minQTY =this.getMinQty(priceArr);
     // console.log(priceArr)
      this.setState({productPrices:priceArr,pricesFound:true,showModalSpinner:false,quantity:this.state.price.min,minQuantity:minQTY})
      this.calculateTotal(this.state.price.min)
      console.log("Suggested prod item:",itemData.item);
      //console.log(JSON.stringify(this.state.productPrices))
     }
      
    }
  

  // view product start here
  
  //get all prices
  async getPrices(itemData) {
    await this.setState({
      modalVisible: true,
      product: itemData.item,
      price: itemData.item.MinPrice,
    });
   
    if (this.state.productPrices.length === 0) {
      this.setState({showModalSpinner: true});
      let prices = this.state.product.Price;
      let priceArr = [];
      //console.log("prices are:", prices)
      for (let i = 0; i < prices.length; i++) {
        await fetch(`https://api.buniyaad.pk/price/get/${prices[i]}`, {
          headers: {
            token: `bearer ${this.state.retailerData.token}`,
          },
        })
          .then(response => response.json())
          .then(res => {
            res.data === null ? null : priceArr.push(res.data);
          });
      }

      let minQTY = this.getMinQty(priceArr);
      let qty = itemData.item.quantity;
     // console.log(itemData.item);
      await this.setState({
        productPrices: priceArr,
        pricesFound: true,
        showModalSpinner: false,
        minQuantity: minQTY,
      });
      this.calculateTotal(qty);
      //console.log(JSON.stringify(this.state.productPrices))
      mixpanel.track('View product',
      {'product': this.state.product});
    }
  }

  //calculate total for a product
  calculateTotal(qty) {
    this.setState({quantity: qty});

    if (qty >= parseInt(this.state.minQuantity) && this.state.pricesFound) {
      let compasrisonPrice = this.state.productPrices;
      let selectedPrice = 0;
      console.log(compasrisonPrice);
      //this.getPrices()

      for (let i = 0; i < compasrisonPrice.length; i++) {
        if (
          parseInt(qty) >= parseInt(compasrisonPrice[i].min) &&
          parseInt(qty) <= parseInt(compasrisonPrice[i].max)
        ) {
          selectedPrice = compasrisonPrice[i];
          //this.setState({price:compasrisonPrice[i]})
        } else if (
          parseInt(qty) >= parseInt(compasrisonPrice[i].min) &&
          compasrisonPrice[i].max === ''
        ) {
          selectedPrice = compasrisonPrice[i];
        }
      }
      let total = qty > 0 ? parseInt(qty) * parseInt(selectedPrice.price) : 0;
      console.log('selected price:', this.state.price);
      this.setState({total: total, price: selectedPrice});
    } else {
      this.setState({total: 0});
    }
  }

  getMinQty(prices) {
    prices.sort(function (a, b) {
      return a.min - b.min;
    });
    return prices[0].min;
  }

  increaseQty() {
    let qty = this.state.quantity;

    if (qty >= parseInt(this.state.minQuantity)) {
      qty = parseInt(qty) + 100;
      this.calculateTotal(qty);
      this.setState({quantity: qty});
    } else {
      qty = this.state.minQuantity;
      this.calculateTotal(qty);
      this.setState({quantity: qty});
    }
  }

  decreaseQty() {
    let qty = this.state.quantity;

    if (qty > parseInt(this.state.minQuantity)) {
      qty = parseInt(qty) - 100;
      this.calculateTotal(qty);

      this.setState({quantity: qty});
    }
  }

  checkProductInCart(cart, product) {
    console.log('old array', cart);
    cart = cart.filter(
      cartProduct => cartProduct.productId != product.productId,
    );
    console.log('updated array', cart);

    return cart;
  }


  post_cart() {
    fetch(
      `https://api.buniyaad.pk/carts/addToCart/${this.state.retailerData.checkUser._id}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: `bearer ${this.state.retailerData.token}`,
        },
        body: JSON.stringify({
          userId: this.state.retailerData.checkUser._id,
          products: this.state.cart,
        }),
      },
    )
      .then(response => response.json())
      .then(data => console.log(data));
  }

  handle_Cart() {
    //check if cart is created first
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000);

    mixpanel.track('added to cart',
    {'product': this.state.product});
    this.setState({cart: [], btnDisabled: true});

    fetch(
      `https://api.buniyaad.pk/carts/check/userId/${this.state.retailerData.checkUser._id}`,
      {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
        signal:controller.signal,
      },
    )
      .then(response => response.json())
      .then(res => {
        if (res.data === false) {
          //if cart was empty add first product
          let product = {
            productId: this.state.isSuggested?this.state.product._id:this.state.product.productId,
            quantity: this.state.quantity,
            total: this.state.total,
            Image:this.state.product.Image
          };
          this.state.cart.push(product);
          console.log('new cart is: ', this.state.cart);
          this.post_cart();
          this.storeCart(this.state.cart);
          this.setState({
            modalVisible: false,
            productPrices: [],
            pricesFound: false,
            total: 0,
            quantity: '',
            combinedList: [],
            products: [],
            cart: [],
            cartTotal: 0,
          });
        } else {
          //add product to existing cart
          fetch(
            `https://api.buniyaad.pk/carts/userId/${this.state.retailerData.checkUser._id}`,
            {
              headers: {
                token: `bearer ${this.state.retailerData.token}`,
              },
            },
          )
            .then(response => response.json())
            .then(res => {
              let product = {
                productId: this.state.isSuggested?this.state.product._id:this.state.product.productId,
                quantity: this.state.quantity,
                total: this.state.total,
                Image:this.state.product.Image
              };
              let resCart = this.checkProductInCart(res.data.products, product);
              this.state.cart.push(product);
              console.log('local cart', this.state.cart);
              Array.prototype.push.apply(this.state.cart, resCart);
              this.post_cart();
              this.storeCart(this.state.cart);
              this.setState({
                modalVisible: false,
                productPrices: [],
                pricesFound: false,
                total: 0,
                quantity: '',
                combinedList: [],
                products: [],
                cart: [],
                cartTotal: 0,
                btnDisabled: false,
                isSuggested:false,
              });
              this.getCart();
              this.getProducts();
            });
        }
      })
      .catch(error => {this.setState({btnDisabled:false})
      ToastAndroid.show("Network issues :(", ToastAndroid.LONG)
      });;
  }

  // Order Starts here
  post_order() {
    var orderId='';

    if (this.state.cart.length > 0) {
      // filler for selling price
      let cart = this.state.cart;
      cart.forEach(function (element) {
        element.sellingprice =
          parseInt(element.total) / parseInt(element.quantity);
      });

      console.log(cart);

      fetch(
        `https://api.buniyaad.pk/orders/add/${this.state.retailerData.checkUser._id}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            token: `bearer ${this.state.retailerData.token}`,
          },
          body: JSON.stringify({
            userId: this.state.retailerData.checkUser._id,
            products: this.state.cart,
            amount: this.state.cartTotal,
            date: new Date(),
            orderId: '2000',
          }),
        },
      )
        .then(response => response.json())
        .then(data => orderId=data.data._id)
        .then(() => {
          this.setState({
            productPrices: [],
            pricesFound: false,
            total: 0,
            quantity: '',
            combinedList: [],
            products: [],
            cart: [],
            cartTotal: 0,
          });
          this.post_cart();
          this.storeCart(this.state.cart);
          this.getCart();
          this.getProducts();
          this.send_sms();

          this.getOrderById(orderId)
          //this.props.navigation.push('Account',{showLatestOrder: true})
        });
    } else {
      alert("can't place orders, cart is empty");
    }
  }

 getOrderById(orderId){
    console.log("Order id is:",orderId)
    
    fetch(`https://api.buniyaad.pk/orders/getById/${orderId}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
         this.getOrderProducts(res.data)
      // console.log(JSON.stringify("Order details:",res.data));
      });
  }

    // get products of  order
    async getOrderProducts(itemData) {

      await this.setState({orderModalVisible:true,orderDetails:itemData,amount:itemData.amount,status:itemData.status,
      orderId:itemData.orderId})
       console.log("tester :",this.state.orderDetails)

       // Sending email here
       this.send_email();

       for(let i=0;i<this.state.orderDetails.products.length;i++){
        await fetch(`https://api.buniyaad.pk/products/getByPId/${this.state.orderDetails.products[i].productId}`, {
          headers: {
            token: `bearer ${this.state.retailerData.token}`,
          },
        })
          .then(response => response.json())
          .then(res => { res.data===null?null:this.state.products.push(res.data)})
      }
    
           const mergedArray = this.state.products.map(t1 => ({...t1, ...this.state.orderDetails.products.find(t2 => t2.productId === t1._id)}))
           this.setState({orderCombinedList:mergedArray,showSpinner:false})
          console.log("merged array",mergedArray)
  
  
      }

      cancelOrder(){
        console.log("order Id: ",this.state.orderDetails._id," Products: ",this.state.orderDetails.products)
        fetch(`https://api.buniyaad.pk/orders/update/${this.state.orderDetails._id}`, {
      method: 'PUT',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: `bearer ${this.state.retailerData.token}`,
      },
      body: JSON.stringify({
          "status":"Cancelled",
          "products":this.state.orderDetails.products,
      })
     }).then((response)=>response.json())
     .then(data=>{console.log(data)
      ToastAndroid.show('order has been cancelled', ToastAndroid.SHORT);
      this.setState({orderModalVisible:false})
      
     })
         
      }


  //send sms params: phoneno, otp
  send_sms() {
    const messagebody = encodeURIComponent(`Your order has been placed`);
    console.log(messagebody);
    let phoneno = `92${this.state.retailerData.checkUser.PhoneNumber.substring(
      1,
    )}`;
    console.log(phoneno);

    fetch(
      `https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=Waze0987654321asdfghjkl&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=BuniyadTech&phone=${phoneno}&type=English&message=${messagebody}`,
    );
  }

  //send email 
  send_email(){

    fetch(
      `https://api.buniyaad.pk/email/sendEmail/order`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: `bearer ${this.state.retailerData.token}`,
        },
        body: JSON.stringify({
          amount:this.state.amount,
          status:this.state.status,
          orderId:this.state.orderId,
          date: new Date(),
          retailername:this.state.retailerData.checkUser.Name,
          count:this.state.orderDetails.products.length,

        }),
      },
    )
      .then(response => response.json())
      .then(data => console.log("email resp: ",data));
  }

  //handle back button function
  backAction = () => {
    let currentScreen = this.props.route.name;
    console.log(currentScreen);
    if (currentScreen === 'Home') {
      Alert.alert('Close?', 'press OK to leave the App', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => BackHandler.exitApp()},
      ]);
    } else {
      this.props.navigation.navigate('Home');
    }

    //BackHandler.exitApp()
    return true;
  };

  componentDidMount() {
    this.getData();
    this.getCart();
   // this.getOrderById('622080c1e8979958fa23ba63')
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <Text style={styles.labelStyle}>Cart</Text>

        <Text style={styles.itemLabelStyle}>ITEMS</Text>
        <FlatList
          ListHeaderComponent={
            <>{this.state.showSpinner && <Spinner color={'black'} />}</>
          }
          data={this.state.combinedList}
          renderItem={item => this.cartItemsComponent(item)}
          ListFooterComponent={
            <>
              {this.state.suggestedProductsData.length>0 && this.state.cart.length>0 && (
              <View>
                <Text style={styles.itemLabelStyle}> MILTA JULTA SAMAAN</Text>
                <FlatList
                  horizontal={true}
                  data={this.state.suggestedProductsData}
                  renderItem={item =>
                    this.recommendedProductsItemComponent(item)
                  }
                />
              </View>)}
            </>
          }
        />

        <Card
          style={{
            borderRadius: 10,
            margin: 20,
            width: '100%',
            alignSelf: 'center',
          }}>

          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',margin:10}}>
          <Text style={styles.totalLabelStyle}>
            Kul Keemat:  
          </Text>
          <Text style={{fontSize: 20,marginLeft:5,fontWeight:'bold'}}>
           Rs. {this.state.cartTotal.toLocaleString('en-GB')}
          </Text>
          </View>
          
          <Button
            full
            style={[styles.fullBtnStyle, {margin: 10}]}
            onPress={() => this.post_order()}>
            <Text>Place Order</Text>
          </Button>
        </Card>

        {/*View product pop up */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({
              modalVisible: false,
              productPrices: [],
              pricesFound: false,
            });
          }}>
          <View>
            <View style={styles.modalView}>

            <ImageBackground
                imageStyle={{resizeMode: 'contain'}}
                style={
                  this.state.product.Image === ''
                    ? null
                    : styles.imageModalStyle
                }
                source={
                  this.state.product.Image === ''
                    ? require('./assets/logo.png')
                    : {uri: this.state.product.Image}
                }>
                <Button
                  transparent
                  style={{marginLeft: 10}}
                  onPress={() =>
                    this.setState({
                      modalVisible: false,
                      productPrices: [],
                      pricesFound: false,
                    })
                  }>
                  <Icon
                    name="close-circle-outline"
                    color="#737070"
                    style={{fontSize: 35}}
                  />
                </Button>
              </ImageBackground>

              <View style={{flex: 1, marginLeft: 10, marginRight: 10}}>
                <FlatList
                  ListHeaderComponent={
                    <>
                      <Text style={{fontSize: 30, marginTop: 20}}>
                        {this.state.product.Title}
                      </Text>

                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            marginTop: 10,
                            color: '#FFC000',
                          }}>
                          Rs.{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 30,
                            fontWeight: 'bold',
                            color: '#FFC000',
                          }}>
                          {this.state.price.price}
                        </Text>
                      </View>


                      <Card
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                          width: '100%',
                          borderRadius: 10,
                          alignItems: 'center',
                          padding: 10,
                          marginTop: 20,
                        }}>
                        <Label
                          style={{
                            alignItems: 'center',
                            marginRight: 10,
                            marginTop: 10,
                          }}>
                          <Text
                            style={{
                              fontSize: 20,
                              marginTop: 10,
                              fontWeight: 'bold',
                              color: '#737070',
                            }}>
                            Miqdaar
                          </Text>
                        </Label>

                        <Button
                          style={{alignSelf: 'center'}}
                          transparent
                          onPress={() => this.decreaseQty()}>
                          <Icon
                            name="remove-circle"
                            color="#FFC000"
                            style={{fontSize: 35, marginHorizontal: 10}}
                          />
                        </Button>

                        {this.state.showModalSpinner && (
                          <Spinner color={'black'} />
                        )}

                        {!this.state.showModalSpinner && (
                          <Input
                            keyboardType="numeric"
                            value={this.state.quantity.toString()}
                            onChangeText={text => this.calculateTotal(text)}
                            style={{
                              borderWidth: 0.5,
                              borderRadius: 5,
                              marginHorizontal: 10,
                              borderColor: '#737070',
                              textAlign: 'center',
                              fontSize: 20,
                              fontWeight: 'bold',
                            }}
                          />
                        )}

                        <Button
                          style={{alignSelf: 'center'}}
                          transparent
                          onPress={() => this.increaseQty()}>
                          <Icon
                            name="add-circle"
                            color="#FFC000"
                            style={{fontSize: 35, marginHorizontal: 10}}
                          />
                        </Button>
                      </Card>

                      <Text style={{marginTop:30,fontWeight:'bold',backgroundColor:'#FFC000',fontSize:15,color:'white', 
                      alignSelf: 'flex-start',padding:10,borderTopRightRadius:20,borderTopLeftRadius:10}}>Zyaada Miqdaar - Zyaada Bachat</Text>  

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          backgroundColor: '#f7f7f7',
                        }}>
                        
                        <Text numberOfLines={1} style={{marginLeft: 10, marginTop: 5,marginBottom:5,fontSize:17,fontWeight:'bold',color: '#737070'}}>
                           Miqdaar
                        </Text>
                        <Text numberOfLines={1} style={{marginRight: 10, marginTop: 5,marginBottom:5,fontSize:17,fontWeight:'bold',color: '#737070'}}>
                        Rate
                        </Text>
                      </View>
                    </>
                  }
                  data={this.state.productPrices}
                  renderItem={item => this.productPricesItemComponent(item)}
             
                />

                {!this.state.showModalSpinner && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                      alignItems: 'center',
                      borderTopWidth:1,
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        marginTop: 10,
                        fontWeight: 'bold',
                        color: '#737070',
                      }}>
                      Total
                    </Text>
                    <Text
                      style={{fontSize: 20, marginTop: 10, fontWeight: 'bold'}}>
                      Rs. {this.state.total.toLocaleString('en-GB')}
                    </Text>
                  </View>
                )}

                <Button
                  full
                  disabled={this.state.btnDisabled}
                  style={styles.fullBtnStyle}
                  onPress={() => {
                    this.state.quantity >= this.state.minQuantity
                      ? this.handle_Cart()
                      : ToastAndroid.show(
                          'invalid quantity',
                          ToastAndroid.SHORT,
                        );
                  }}>
                  <Text>ITEM ADD KAREIN</Text>
                </Button>
              </View>
        
            </View>
          </View>
        </Modal>

                 {/*View order details pop up */ }
                 <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.orderModalVisible}
          onRequestClose={() => {
            this.setState({orderModalVisible:false,orderCombinedlist:[],products:[]});
          }}
        >
          <View >
            <View style={styles.modalView}>
             
            
            <FlatList
            style={{marginBottom:20}}
        ListHeaderComponent={<>
           <Button
              transparent
              style={{marginLeft:10}}
              onPress={() => this.setState({orderModalVisible:false,orderCombinedlist:[],products:[]})}>
              <Icon name='close-circle-outline' color='#737070'  style={{fontSize:35}}/>
            </Button>
          <Text style={styles.labelStyle}>Order Details</Text>
          

          {this.state.orderCombinedList.length>0 &&(
           <Card style={{marginLeft:10,marginRight:10,padding:10,borderRadius:10}}>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Order #{this.state.orderId}</Text>

            <Image
           style={styles.processingImageStyle}
            source={{uri:'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/7779254.jpg'}}
          />

          <Text style={{fontSize:30,marginTop:-30,marginBottom:10,fontWeight:'bold',alignSelf:'center',color:'#FFC000'}}>{this.state.status}</Text>

           <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{fontSize:20,marginTop:10,fontWeight:'bold',color:'#737070'}}>Total</Text>
            <Text style={{fontSize:20,marginTop:10,fontWeight:'bold'}}>Rs. {this.state.amount.toLocaleString('en-GB')}</Text>
           </View>

           </Card>
             
            
          )}
         
         <Text style={styles.itemLabelStyle}>Items</Text>
         {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
        </>}
          data={this.state.orderCombinedList}
          renderItem={item => this.orderItemsComponent(item)}
         />

          <Button full style={styles.fullBtnStyle} onPress={()=> {this.cancelOrder()}}>

          <Text>Cancel</Text>
          </Button> 

            
            </View>
          
          
          </View>
        </Modal>

        {/*footer starts here*/}
        <Footer style={{height: 70}}>
          <FooterTab style={styles.footerStyle}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Home');
              }}>
              <Icon name="home" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Home</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Categories');
              }}>
              <Icon name="grid" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Categories</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Cart');
              }}>
              <Icon name="cart" style={{color: '#FFC000'}} />
              <Label style={{color: '#737070'}}>Cart</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Account');
              }}>
              <Icon name="person" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Account</Label>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#faf9f7',
  },
  headerStyle: {
    backgroundColor: '#FFC000',
  },
  footerStyle: {
    backgroundColor: 'white',
  },
  btnStyle: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#ffab03',
  },
  cartCardStyle: {
    borderRadius: 10,
    justifyContent: 'space-around',
    marginLeft: 10,
    marginRight: 10,
   
    padding: 10,
  },
  cartImageStyle:{
    height:75,
    width:'20%',
    overflow: "hidden",
    resizeMode:'contain',
    marginRight:5,
  },
  recommendedStyle: {
    marginLeft: 10,
    borderRadius: 10,
    height: 250,
    width: 150,
    
  },
  headingStyle: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    margin: 10,
    padding: 10,
  },
  itemLabelStyle: {
    marginTop: 30,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
    marginLeft: 10,
  },
  labelStyle: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
  },
  totalLabelStyle:{

    fontWeight: 'bold',
    color: '#737070',
    textAlignVertical:'bottom',
    fontSize: 20,
  },
  cartLabelStyle: {
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 20,
  },
  fullBtnStyle:{
    backgroundColor: '#ffab03',
    borderRadius:10,
    marginBottom:40,
    marginTop:10,
    marginLeft:10,
    marginRight:10,
    height:50,
  },
  modalView: {
    marginTop: 10,
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageStyle: {
    height:'60%',
    minWidth: 150,
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
  },
  processingImageStyle:{
    height:200,
    width:'100%',
    alignSelf:'center',
    resizeMode:'contain'
  },
  imageModalStyle: {
    flex: 0.4,
    height: '100%',
    width: '100%',
  },
});
