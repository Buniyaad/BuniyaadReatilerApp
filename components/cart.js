import * as React from 'react';
import {StyleSheet, Image,FlatList, TouchableOpacity} from 'react-native';
import {
  Badge,
  Body,
  Card,
  Container,
  Content,
  Text,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Tabs,
  Tab,
  Input,
  Label,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class Cart extends React.Component {
  state = {
    data: [],
    retailerData:'',
    products:[],
    cart:[],
    combinedList:[],
    total:'',
  };


  cartItemsComponent = itemData => (
    <TouchableOpacity /*onPress={()=>this.getPrices(itemData)}*/>
      <Card style={styles.cartCardStyle}>
      
        <Text>{itemData.item.Title}</Text>
        <Text>qty:{itemData.item.quantity}</Text>
        <Text>total:{itemData.item.total}</Text>
        <Button transparent style={{alignSelf:'center'}} onPress={()=>this.removeProduct(itemData.item)}>
            <Icon name='close-circle-outline' color='red' style={{fontSize:30}}/>
          </Button>
      </Card>
    </TouchableOpacity>
  );

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
      this.setState({cart:JSON.parse(jsonValue)})
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      this.getProducts()
      this.calculateTotal()
      console.log("this is async cart data: ",JSON.parse(jsonValue))
 
    } catch(e) {
      // error reading value
    }
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

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
     
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  async getProducts() {

  for(let i=0;i<this.state.cart.length;i++){
    await fetch(`https://api.buniyaad.pk/products/getByPId/${this.state.cart[i].productId}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => { res.data===null?null:this.state.products.push(res.data)})
  }

       const mergedArray = this.state.products.map(t1 => ({...t1, ...this.state.cart.find(t2 => t2.productId === t1._id)}))
      this.setState({combinedList:mergedArray})
    }


    calculateTotal(){
      total = this.state.cart.reduce(
        (previousScore, currentScore)=>parseInt(previousScore)+parseInt(currentScore.total), 
        0);
      this.setState({total:total})
    }


    async removeProduct(product){
      
       let newCart=this.state.cart.filter(cartProduct=> cartProduct.productId != product.productId)
      await this.setState({cart:newCart,products:[]})
      this.post_cart()
      this.storeCart(this.state.cart)
      this.getProducts()
      this.calculateTotal()
      
    }

    
 
  componentDidMount(){
    this.getData()
    this.getCart()
    
  }
  
  render() {
    return (
      <Container style={styles.containerStyle}>
  
        <FlatList
          data={this.state.combinedList}
          renderItem={item => this.cartItemsComponent(item)}
        />
        
        <Text>{this.state.total}</Text>

        <Footer>
         
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
              onPress={() => {
                this.props.navigation.navigate('Cart');
              }}>
              <Badge warning>
                <Text>1</Text>
              </Badge>
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
    backgroundColor: '#FAB624',
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
    flexDirection:'row',
    justifyContent:'space-between',
    height:50,
    alignItems:'center',
  },
});
