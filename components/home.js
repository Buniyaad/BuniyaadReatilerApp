import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Alert,
  BackHandler,
  ToastAndroid,
  Modal
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


export default class Login extends React.Component {
  state = {
    search: '',
    retailerData: '',
    data: [],
    showSpinner:true,
    showModalSpinner:false,
    product:'',
    modalVisible:false,
    productPrices:[],
    price:'',
    total:0,
    minQuantity:'',
    quantity:'',
    cart:[],
    pricesFound:false,
    btnDisabled:false,
    refresh:false,
    cartCount:'',
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
      jsonValue != null ? this.setState({cartCount:JSON.parse(jsonValue).length}) : null;
    
 
    } catch(e) {
      // error reading value
    }
  }


  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getAllProducts()
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

    



  //product card components
  recommendedProductsItemComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={()=>this.getPrices(itemData)}>
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
          Rs. {itemData.item.MinPrice.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

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
          Rs. {itemData.item.MinPrice.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  //get Sab Samaan products
  getAllProducts() {
    this.setState({refresh:true})
    fetch(`https://api.buniyaad.pk/products`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data,showSpinner:false,refresh:false});
        //console.log(JSON.stringify(res.data));
      });
  }

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
    this.setState({cart:[],btnDisabled:true})
    ToastAndroid.show("Added to cart", ToastAndroid.SHORT)

    fetch(`https://api.buniyaad.pk/carts/check/userId/${this.state.retailerData.checkUser._id}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        if(res.data===false){
          //if cart was empty add first product
          let product={productId:this.state.product._id,quantity:this.state.quantity,total:this.state.total}
          this.state.cart.push(product);
          console.log("new cart is: ",this.state.cart)
          this.post_cart();
          this.storeCart(this.state.cart)
          this.setState({modalVisible:false,productPrices:[],pricesFound:false,total:0,quantity:''})
          this.getCart()
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
      
        let product={productId:this.state.product._id,quantity:this.state.quantity,total:this.state.total}
        let resCart=this.checkProductInCart(res.data.products,product)
        this.state.cart.push(product);
        console.log("local cart",this.state.cart)
        Array.prototype.push.apply(this.state.cart,resCart); 
          this.post_cart();
          this.storeCart(this.state.cart)
          this.setState({modalVisible:false,productPrices:[],pricesFound:false,total:0,quantity:'',btnDisabled:false})
          this.getCart()
          
      })
   
        }
      });

      
  }


  //handle back button function
  backAction = () => {

    console.log(this.props.navigation.state)
    Alert.alert(
      "Close?",
      "press OK to leave the App",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => BackHandler.exitApp() }
      ]
    );
    //BackHandler.exitApp()
    return true;
  };

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({search:''});
      this.getCart();
    });

    this.getData();
    this.getCart();    
    
    console.log("this is state data",this.state.retailerData)
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
          <Left>
            
          </Left>

          <Body style={{alignItems:'center',width:'80%'}}>
          <Image style={{marginLeft:100,marginTop:10,height:50,width:'100%'}}source={require('./assets/logoTitle.png')} />
          </Body>
          
          <Right style={{width:'20%',marginTop:10}}>
            <Icon color='black' name="notifications" />
          </Right>
        </Header>

        <View style={styles.searchViewStyle}>
          
        </View>

        <Item rounded style={styles.searchInputStyle}>
            <Label style={{marginLeft:10}}>
              <Icon name="search" />
            </Label>
            <Input
              placeholder="search"
              value={this.state.search}
              onChangeText={text => this.setState({search: text})}
              returnKeyType='search'
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
          onRefresh={()=>this.getAllProducts()}
          ListHeaderComponent={
            <>
               {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
              <Card style={styles.bannerStyle}>
                <Image source={require('./assets/logo.png')} />
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
              <Text style={styles.labelStyle}> SAB SAMAAN</Text>
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
            
            <Button
              transparent
              style={{margin:10}}
              onPress={() => this.setState({modalVisible:false,productPrices:[],pricesFound:false})}>
              <Icon name='close-circle-outline' color='#737070' style={{fontSize:35}}/>
            </Button>

           <Image
            style={this.state.product.Image === '' ? null : styles.imageModalStyle}
            source={
              this.state.product.Image === ''
              ? require('./assets/logo.png')
              : {uri: this.state.product.Image}
            }
           />

          <Body>
            
            <Text style={{fontSize:30}}>{this.state.product.Title}</Text>
            <Text>{this.state.product.Description}</Text>

          <Card style={{flexDirection:'row',justifyContent:'space-around',width:'100%',borderRadius:10}}>

            <Label style={{alignItems:'center',marginHorizontal:10,marginTop:10}}>
              <Text >Quantity</Text>
            </Label>

            <Button
              transparent
              onPress={()=>this.decreaseQty()}>
              <Icon name='remove-circle' color='#FFC000' style={{fontSize:35,marginHorizontal:10}}/>
            </Button>
            
            {this.state.showModalSpinner && (
                <Spinner color={'black'}/>
               )}
           
            {!this.state.showModalSpinner &&( <Input keyboardType='numeric' value={this.state.quantity.toString()} onChangeText={(text)=>this.calculateTotal(text)}
             style={{borderWidth:0.5,borderRadius:5,marginHorizontal:10,borderColor:'#737070'}}/>
            )}

            <Button
              transparent
              onPress={()=>this.increaseQty()}>
              <Icon name='add-circle' color='#FFC000' style={{fontSize:35,marginHorizontal:10}}/>
            </Button>
          </Card>

          <Card style={{flex:1,justifyContent:'space-around',borderRadius:10,width:'95%'}}>
            <View style={{flexDirection:'row',width:'100%',justifyContent:'space-around'}}>
             <Text style={{fontSize:30}}>price :{this.state.price.price}</Text>
             <Text style={{fontSize:30}}>Per :{this.state.price.min}</Text>
            </View>
            
            <Text style={{fontSize:30,alignSelf:'center'}}>TOTAL:{this.state.total}</Text>
          </Card>

          


         </Body>

          <Button full disabled={this.state.btnDisabled} style={styles.fullBtnStyle} onPress={()=> {this.state.quantity>=this.state.minQuantity?this.handle_Cart():
          ToastAndroid.show("invalid quantity", ToastAndroid.SHORT)}}>

            <Text>ADD TO CART</Text>
          </Button>
            </View>
          
          
          </View>
        </Modal>


    {/*Footer starts here*/ }
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
              badge
              vertical
              style={{marginTop:this.state.cartCount===0? 0:-10}}
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
    backgroundColor:'FBFCFF',
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
    marginBottom:30,
    marginTop:10,
    height:50,
  },
  modalView: {
    marginTop:10,
    height:"100%",
    width:'100%',
    backgroundColor: "white",
    borderRadius: 10,
    padding:10,
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  searchInputStyle: {
    alignSelf: 'center',
    marginLeft:20,
    marginRight:20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop:-20,
  },
  searchViewStyle: {
    backgroundColor: '#FFC000',
    height:30,
  },
  bannerStyle: {
    marginTop: 20,
    alignSelf: 'center',
    height: 100,
    width: '95%',
    borderRadius:10,

  },
  labelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight:'bold',
    color: '#737070',
    marginLeft:10,
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
    height:'60%',
    minWidth: 150,
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
  },
  imageModalStyle: {
    marginLeft:10,
    marginRight:10,
    borderRadius:10,
    height: 200,
    width: '100%',
   
    
  },
});
