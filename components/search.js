import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Alert,
  BackHandler,
  Modal,
  ToastAndroid,
  ImageBackground
} from 'react-native';
import {
  Badge,
  Body,
  Container,
  Card,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Text,
  Input,
  Label,
  Spinner,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Mixpanel} from 'mixpanel-react-native';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

export default class Login extends React.Component {
  state = {
    search: this.props.route.params.search,
    retailerData: '',
    data: [],
    showSpinner:true,
    showModalSpinner:false,
    product:[],
    modalVisible:false,
    productPrices:[],
    price:'',
    total:0,
    minQuantity:'',
    quantity:'',
    cart:[],
    pricesFound:false,
    btnDisabled:false,
  };

  async storeCart(value){
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('cart', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  async getCart(){
    try {
      const jsonValue = await AsyncStorage.getItem('cart')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
 
    } catch(e) {
      // error reading value
    }
  }

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      mixpanel.identify(JSON.parse(jsonValue).checkUser.PhoneNumber)
      this.getProductsBySearch();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  allProductsItemComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={()=>this.getPrices(itemData)}>
      <Card style={styles.allStyle}>
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

  
  //get all prices
  async  getPrices(itemData) {

    await this.setState({modalVisible:true,product:itemData.item,price:itemData.item.MinPrice})
  
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
      this.setState({productPrices:priceArr,pricesFound:true,showModalSpinner:false,quantity:this.state.price.min,minQuantity:minQTY})
      this.calculateTotal(this.state.price.min)

      mixpanel.track('View Product',
      {'product': this.state.product.Title,
      'source':'App'
    });
      //console.log(JSON.stringify(this.state.productPrices))
     }
      
    }
  
    //calculate total for a product
    calculateTotal(qty){
    this.setState({quantity:qty})
  
     if(qty>=parseInt(this.state.minQuantity) && this.state.pricesFound){
        let compasrisonPrice=this.state.productPrices;
      let selectedPrice=0;
      console.log(compasrisonPrice);
      //this.getPrices()
  
      for(let i=0; i<compasrisonPrice.length; i++){
        if(parseInt(qty) >= parseInt(compasrisonPrice[i].min) && parseInt(qty) <= parseInt(compasrisonPrice[i].max)){
          selectedPrice=compasrisonPrice[i]
          //this.setState({price:compasrisonPrice[i]})
        }
        else if(parseInt(qty) >= parseInt(compasrisonPrice[i].min) && compasrisonPrice[i].max==='')
        {
          selectedPrice=compasrisonPrice[i]
        }
        
      }
      let total= qty > 0? parseInt(qty)*parseInt(selectedPrice.price):0
      console.log("selected price:",this.state.price)
       this.setState({total:total,price:selectedPrice})
     }
     else{this.setState({total:0})}
      
    }
  
    getMinQty(prices){
      let minQTY=0
      prices.sort(function (a, b) {
        return a.min - b.min
    })
    return prices[0].min
    }
  
    increaseQty(){
      let qty=this.state.quantity;
      
      if(qty>=parseInt(this.state.minQuantity)){
       qty=parseInt(qty)+100
       this.calculateTotal(qty)
       console.log(qty)
       this.setState({quantity:qty})
      
      }
      else{
        qty=this.state.minQuantity
        this.calculateTotal(qty)
        this.setState({quantity:qty})
      }
    }
  
    decreaseQty(){
      let qty=this.state.quantity;
      
      if(qty>parseInt(this.state.minQuantity)){
      qty=parseInt(qty)-100
      this.calculateTotal(qty)
      console.log(qty)
      this.setState({quantity:qty})
      
      }
      
    }
  
   
  
    checkProductInCart(cart,product){
      console.log("old array",cart)
       cart=cart.filter(cartProduct=> cartProduct.productId != product.productId)
       console.log("updated array",cart)
       
       return cart
    }
  
  
  
    post_cart(){
      fetch(`https://api.buniyaad.pk/carts/addToCart/${this.state.retailerData.checkUser._id}`, {
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: `bearer ${this.state.retailerData.token}`,
        },
        body: JSON.stringify({
            "userId":this.state.retailerData.checkUser._id,
            "products":this.state.cart,
        })
       }).then((response)=>response.json())
       .then(data=>console.log(data))
       
    }
  
    handle_Cart(){
      //check if cart is created first
      let controller = new AbortController()
      setTimeout(() => controller.abort(), 10000);

      this.setState({cart:[],btnDisabled:true})
      mixpanel.track('Add to Cart',
    {'product': this.state.product.Title,
    'quantity': this.state.quantity,
    'total': this.state.total,
     'source':'App'});

     
      fetch(`https://api.buniyaad.pk/carts/check/userId/${this.state.retailerData.checkUser._id}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
        signal:controller.signal,
      })
        .then(response => response.json())
        .then(res => {
          if(res.data===false){
            //if cart was empty add first product
            let product={productId:this.state.product._id,quantity:this.state.quantity,total:this.state.total,Image:this.state.product.Image}
            this.state.cart.push(product);
            console.log("new cart is: ",this.state.cart)
            this.post_cart();
            this.storeCart(this.state.cart)
            this.setState({modalVisible:false,productPrices:[],pricesFound:false,total:0,quantity:'',btnDisabled: false})
            this.props.navigation.push('Cart')
          }
          else{
            //add product to existing cart
           fetch(`https://api.buniyaad.pk/carts/userId/${this.state.retailerData.checkUser._id}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res=>{
         // console.log("postman cart:",res.data.products)
          let product={productId:this.state.product._id,quantity:this.state.quantity,total:this.state.total,Image:this.state.product.Image}
          let resCart=this.checkProductInCart(res.data.products,product)
          this.state.cart.push(product);
          console.log("local cart",this.state.cart)
          Array.prototype.push.apply(this.state.cart,resCart); 
          //this.state.cart.concat(res.data.products) 
          //console.log("concatenated",this.state.cart) 
          //console.log(this.state.cart)
          //this.state.cart.push(product);
            
            this.post_cart();
            this.storeCart(this.state.cart)
            this.setState({modalVisible:false,productPrices:[],pricesFound:false,total:0,quantity:'',btnDisabled:false})
            this.props.navigation.push('Cart')
        })
     
          }
        })
        .catch(error => {this.setState({btnDisabled:false})
      ToastAndroid.show("Network issues :(", ToastAndroid.LONG)
      });
  
        
    }
  
  
    // get search results
  getProductsBySearch() {
    fetch(`https://api.buniyaad.pk/products/withDetail/${this.state.search}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data, showSpinner:false});
      });
  }

  backAction = () => {
    this.setState({search:''})
    this.props.navigation.pop();
    return true;
  };

  componentDidMount() {
    this.getData()
    
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <FlatList
          columnWrapperStyle={{justifyContent: 'space-evenly'}}
          ListHeaderComponent={
            <>
              {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
             {!this.state.showSpinner &&(
             <Text style={styles.labelStyle}>
                found {this.state.data.length} results for " {this.state.search} "
             </Text>)} 
            </>
          }
          data={this.state.data}
          numColumns={2}
          renderItem={item => this.allProductsItemComponent(item)}
        />

           {/*View product pop up */ }
           <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible:false,productPrices:[],pricesFound:false});
          }}
        >
          <View >
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


        <Footer style={{height:70}}>
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
  searchInputStyle: {
    alignSelf: 'center',
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  searchViewStyle: {
    backgroundColor: '#FFC000',
  },
  bannerStyle: {
    marginTop: 10,
    alignSelf: 'center',
    height: 100,
    width: 300,
  },
  labelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
  },
  recommendedStyle: {
    marginLeft: 10,
    borderRadius: 5,
    height: 250,
    width: 150,
    justifyContent: 'space-between',
  },
  allStyle: {
    borderRadius: 10,
    height: 250,
    width: 175,
  },
  imageStyle: {
    height:'60%',
    minWidth: 150,
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
  },
  imageModalStyle: {
    flex: 0.4,
    height: '100%',
    width: '100%',
  },
});
