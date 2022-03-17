import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  View,
  Alert,
  BackHandler,
  ToastAndroid,
  Modal,
} from 'react-native';
import {
  Badge,
  Body,
  Container,
  Content,
  CardItem,
  Card,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Text,
  Input,
  Label,
  Left,
  Right,
  Spinner,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import {Mixpanel} from 'mixpanel-react-native';
import {Adjust, AdjustEvent, AdjustConfig} from 'react-native-adjust';
import {ImageSlider} from 'react-native-image-slider-banner';

const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init(); 

const data = [
  {img: 'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/7357880.jpg'},
  {img: 'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/2931542.jpg'},
  {img: 'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/817587.jpg'},
];
export default class Login extends React.Component {
  state = {
    search: '',
    retailerData: '',
    data: [],
    showSpinner: true,
    showModalSpinner: false,
    product: '',
    modalVisible: false,
    productPrices: [],
    price: '',
    total: 0,
    minQuantity: '',
    quantity: '',
    cart: [],
    pricesFound: false,
    btnDisabled: false,
    refresh: false,
    cartCount: '',
    interestedData: [],
  };

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
      jsonValue != null
        ? this.setState({cartCount: JSON.parse(jsonValue).length})
        : this.setState({cartCount: 0});
    } catch (e) {
      // error reading value
    }
  }

  async getData() {
    try {
      const jsonValue = await AsyncStorage.getItem('test');
      this.setState({retailerData: JSON.parse(jsonValue)});
      this.getAllProducts();
      this.getInterestProducts();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log('this is async data: ', JSON.parse(jsonValue));
    } catch (e) {
      // error reading value
    }
  }

  //product card components
  recommendedProductsItemComponent = itemData => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => this.getPrices(itemData)}>
      <Card style={styles.recommendedStyle}>
        <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text
          numberOfLines={2}
          style={{height: '20%', marginLeft: 10, marginTop: 5}}>
          {itemData.item.Title}
        </Text>
        <Text
          style={{
            color: '#FFC000',
            height: '20%',
            marginLeft: 10,
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 15,
          }}>
          Rs. {itemData.item.MinPrice.price.toLocaleString('en-GB')}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  interestProductsItemComponent = itemData => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => this.getPrices(itemData)}>
      <Card style={styles.recommendedStyle}>
        <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text
          numberOfLines={2}
          style={{height: '20%', marginLeft: 10, marginTop: 5}}>
          {itemData.item.Title}
        </Text>
        <Text
          style={{
            color: '#FFC000',
            height: '20%',
            marginLeft: 10,
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 15,
          }}>
          Rs. {itemData.item.MinPrice.price.toLocaleString('en-GB')}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  allProductsItemComponent = itemData => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => this.getPrices(itemData)}>
      <Card style={styles.allStyle}>
        <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text
          numberOfLines={2}
          style={{height: '20%', marginLeft: 10, marginTop: 5}}>
          {itemData.item.Title}
        </Text>
        <Text
          style={{
            color: '#FFC000',
            height: '20%',
            marginLeft: 10,
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 15,
          }}>
          Rs. {itemData.item.MinPrice.price.toLocaleString('en-GB')}
        </Text>
      </Card>
    </TouchableOpacity>
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

  //get Sab Samaan products
  getAllProducts() {
    
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000);
    this.setState({refresh: true});
    fetch(`https://api.buniyaad.pk/products`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
      signal:controller.signal
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data, showSpinner: false, refresh: false});
        //console.log(JSON.stringify(res.data));
      })
      .catch(error => {this.setState({showSpinner:false,refresh: false})
      ToastAndroid.show("Network issues :(", ToastAndroid.LONG)
      });;;
      
  }

  //get Khaas Aap Keh Liye products
  getInterestProducts() {
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000);
    this.setState({refresh: true});
    fetch(
      `https://api.buniyaad.pk/categories/GetProducts/${this.state.retailerData.checkUser.IntrustCategory}`,
      {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
        signal:controller.signal
      },
    )
      .then(response => response.json())
      .then(res => {
        this.setState({interestedData: res.data, showSpinner: false});
      })
      .catch(error => {this.setState({showSpinner:false,refresh: false})});
  }

  //get all prices
  async getPrices(itemData) {
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000);
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
          })
          .catch(error => {this.setState({showSpinner:false})
      ToastAndroid.show("Network issues :(", ToastAndroid.LONG)

      });
      }

      let minQTY = this.getMinQty(priceArr);
      console.log(priceArr);
      this.setState({
        productPrices: priceArr,
        pricesFound: true,
        showModalSpinner: false,
        quantity: this.state.price.min,
        minQuantity: minQTY,
      });
      this.calculateTotal(this.state.price.min);
      mixpanel.track('View Product',
      {'product': this.state.product
    });
      //console.log(JSON.stringify(this.state.productPrices))
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
    let minQTY = 0;
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
      console.log(qty);
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
      console.log(qty);
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

        signal:controller.signal
      },
    )
      .then(response => response.json())
      .then(res => {
        if (res.data === false) {
          //if cart was empty add first product
          let product = {
            productId: this.state.product._id,
            quantity: this.state.quantity,
            total: this.state.total,
            Image: this.state.product.Image,
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
          });
          this.getCart();
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
                productId: this.state.product._id,
                quantity: this.state.quantity,
                total: this.state.total,
                Image: this.state.product.Image,
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
                btnDisabled: false,
              });
              this.getCart();
              this.props.navigation.push('Cart');
            });
        }
      }).catch(error => {this.setState({btnDisabled:false})
      ToastAndroid.show("Network issues :(", ToastAndroid.LONG)

      });;
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
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({search: ''});
      this.getCart();
      
    });

    this.getData();
    //this.getCart();
    console.log('this is state data', this.state.retailerData);
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    this._unsubscribe();
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <Header style={styles.headerStyle}>
          <Left></Left>

          <Body style={{alignItems: 'center', width: '80%'}}>
            <Image
              style={{
                marginLeft: 100,
                marginTop: 10,
                height: 50,
                width: '100%',
              }}
              source={require('./assets/logoTitle.png')}
            />
          </Body>

          <Right style={{width: '20%', marginTop: 10}}>
            <Icon color="black" name="notifications" />
          </Right>
        </Header>

        <View style={styles.searchViewStyle}></View>

        <Item rounded style={styles.searchInputStyle}>
          <Label style={{marginLeft: 10}}>
            <Icon name="search" />
          </Label>
          <Input
            placeholder=" Search"
            value={this.state.search}
            onChangeText={text => this.setState({search: text})}
            returnKeyType="search"
            onSubmitEditing={() =>
              this.state.search == ''
                ? null
                : this.props.navigation.navigate('Search', {
                    data: this.state.retailerData,
                    search: this.state.search,
                  })
            }
          />
        </Item>

        {/*set aap keh liye as header to sab samaan */}

        <FlatList
          columnWrapperStyle={{justifyContent: 'space-evenly'}}
          refreshing={this.state.refresh}
          onRefresh={() => this.getAllProducts()}
          ListHeaderComponent={
            <>
              {this.state.showSpinner && <Spinner color={'black'} />}

              {/*<Card style={styles.bannerStyle}>
                <Image style={{width:'100%',height:100, resizeMode:'contain'}} source={{uri:'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/1373030.jpg'} require('./assets/Banner.jpg')}/>
              </Card>*/}

              <Card style={styles.bannerStyle}>
                <ImageSlider
                  data={data}
                  autoPlay={true}
                  //onItemChanged={(item) => console.log("item", item)}
                  closeIconColor="#fff"
                  onClick={(item, index) => {
                    alert('coming soon!');
                  }}
                  timer={5000}
                  caroselImageStyle={{height:150,borderRadius:10,resizeMode:'contain'}}
                  indicatorContainerStyle={{top: 50}}
                />
              </Card>

              <View>
                <Text style={styles.labelStyle}> AAP KEH LIYE</Text>
                <FlatList
                  horizontal={true}
                  data={this.state.data}
                  renderItem={item =>
                    this.recommendedProductsItemComponent(item)
                  }
                />
              </View>

              {this.state.interestedData.length > 0 && (
                <View>
                  <Text style={styles.labelStyle}> KHAAS AAP KEH LIYE</Text>
                  <FlatList
                    horizontal={true}
                    data={this.state.interestedData}
                    renderItem={item =>
                      this.interestProductsItemComponent(item)
                    }
                  />
                </View>
              )}

              <Text style={styles.labelStyle}> SAB SAMAAN</Text>
            </>
          }
          data={this.state.data}
          numColumns={2}
          renderItem={item => this.allProductsItemComponent(item)}
        />

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

        {/*Footer starts here*/}
        <Footer style={{height: 70}}>
          <FooterTab style={styles.footerStyle}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Home');
              }}>
              <Icon name="home" style={{color: '#FFC000'}} />
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
              badge
              vertical
              style={{marginTop: this.state.cartCount === 0 ? 0 : -17}}
              onPress={() => {
                this.props.navigation.navigate('Cart');
              }}>
              {this.state.cartCount != '' && (
                <Badge warning>
                  <Text>{this.state.cartCount}</Text>
                </Badge>
              )}
              <Icon name="cart" style={{color: '#737070'}} />
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
    backgroundColor: '#FBFCFF',
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
  fullBtnStyle: {
    backgroundColor: '#ffab03',
    borderRadius: 10,
    marginBottom: 40,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    height: 50,
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
  searchInputStyle: {
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: -20,
  },
  searchViewStyle: {
    backgroundColor: '#FFC000',
    height: 30,
  },
  bannerStyle: {
    marginTop: 20,
    alignSelf: 'center',
    width: '95%',
    borderRadius: 10,
   
   
  },
  labelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
    marginLeft: 10,
  },
  recommendedStyle: {
    marginLeft: 10,
    borderRadius: 10,
    height: 250,
    width: 150,
  },
  allStyle: {
    borderRadius: 10,
    height: 250,
    width: 175,
  },
  imageStyle: {
    height: '60%',
    minWidth: 150,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  imageModalStyle: {
    flex: 0.4,
    height: '100%',
    width: '100%',
  },
});
