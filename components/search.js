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
    quantity:'',
    pricesFound:false,
  };

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getProductsBySearch();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  allProductsItemComponent = itemData => (
    <TouchableOpacity onPress={()=>this.getPrices(itemData)}>
      <Card style={styles.allStyle}>
        <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text>{itemData.item.Title}</Text>
        <Text style={{color: '#FAB624', fontWeight: 'bold'}}>
          {itemData.item.MinPrice.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

   //get all prices
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
      this.setState({productPrices:priceArr,pricesFound:true,showModalSpinner:false})
      //console.log(JSON.stringify(this.state.productPrices))
     }
      
    }
  
    //calculate total for a product
    calculateTotal(qty){
    this.setState({quantity:qty})
  
     if(qty>0 && this.state.pricesFound){
        let compasrisonPrice=this.state.productPrices;
      let selectedPrice=0;
      console.log(compasrisonPrice);
      //this.getPrices()
  
      for(let i=0; i<compasrisonPrice.length; i++){
        if(parseInt(qty) >= parseInt(compasrisonPrice[i].min) && parseInt(qty) <= parseInt(compasrisonPrice[i].max)){
          selectedPrice=compasrisonPrice[i]
          //this.setState({price:compasrisonPrice[i]})
        }
      }
      let total= qty > 0? parseInt(qty)*parseInt(selectedPrice.price):0
      console.log("selected price:",this.state.price)
       this.setState({total:total,price:selectedPrice})
     }
     else{this.setState({total:0})}
      
    }
  
    increaseQty(){
      let qty=this.state.quantity;
      
      if(qty>0){
       qty=parseInt(qty)+100
       this.calculateTotal(qty)
       console.log(qty)
       this.setState({quantity:qty.toString()})
      
      }
      else{
        qty=100
        this.calculateTotal(qty)
        this.setState({quantity:qty.toString()})
      }
    }
  
    decreaseQty(){
      let qty=this.state.quantity;
      
      if(qty>100){
      qty=parseInt(qty)-100
      this.calculateTotal(qty)
      console.log(qty)
      this.setState({quantity:qty.toString()})
      
      }
      
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
            
            <Button
              transparent
              onPress={() => this.setState({modalVisible:false,productPrices:[]})}>
              <Icon name='close-circle-outline' color='#737070' style={{fontSize:30}}/>
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

          <Card style={{flexDirection:'row'}}>

            <Label style={{alignItems:'center',marginHorizontal:10,marginTop:10}}>
              <Text >Quantity</Text>
            </Label>

            <Button
              transparent
              onPress={()=>this.decreaseQty()}>
              <Icon name='remove-circle' color='#FAB624' style={{fontSize:30,marginHorizontal:10}}/>
            </Button>
            
            {this.state.showModalSpinner && (
                <Spinner color={'black'}/>
               )}
           
            {!this.state.showModalSpinner &&( <Input keyboardType='numeric' value={this.state.quantity} onChangeText={(text)=>this.calculateTotal(text)}
             style={{borderWidth:0.5,borderRadius:5,marginHorizontal:10,borderColor:'#737070'}}/>
            )}

            <Button
              transparent
              onPress={()=>this.increaseQty()}>
              <Icon name='add-circle' color='#FAB624' style={{fontSize:30,marginHorizontal:10}}/>
            </Button>
          </Card>

          <Card style={{flex:1,justifyContent:'space-around'}}>
            <View style={{flexDirection:'row',width:'100%',justifyContent:'space-around'}}>
             <Text style={{fontSize:30}}>price :{this.state.price.price}</Text>
             <Text style={{fontSize:30}}>Per :{this.state.price.min}</Text>
            </View>
            
            <Text style={{fontSize:30,alignSelf:'center'}}>TOTAL:{this.state.total}</Text>
          </Card>


         </Body>

          <Button full style={styles.fullBtnStyle} onPress={()=>this.getPrices()}>
            <Text>ADD TO CART</Text>
          </Button>
            </View>
          
          
          </View>
        </Modal>

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
  fullBtnStyle:{
    backgroundColor: '#ffab03',
    borderRadius:10,
    marginBottom:20,
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
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  searchViewStyle: {
    backgroundColor: '#FAB624',
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
    borderRadius: 5,
    height: 250,
    width: 150,
    justifyContent: 'space-between',
  },
  imageStyle: {
    height: 150,
    minWidth: 150,
  },
  imageModalStyle: {
    marginLeft:10,
    marginRight:10,
    height: 200,
    width: '100%',
    borderRadius:10,
    
  },
});
