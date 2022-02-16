import * as React from 'react';
import {StyleSheet, Image, FlatList,TouchableOpacity,Modal,View} from 'react-native';
import {
  Badge,
  Body,
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
  Card,
  CardItem,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class Account extends React.Component {
  state = {
    data: [],
    retailerData:'',
    modalVisible:false,
    orderDetails:[],
    products:[],
    combinedList:[],
    refresh:false,
  };

  orderHistoryItemsComponent = itemData => (
    <TouchableOpacity onPress={()=>this.getProducts(itemData)}>
      <Card>
      
        <Text>order id: {itemData.item._id}</Text>
        <Text>date: {new Date(itemData.item.date).toDateString()}</Text>
        <Text>status: {itemData.item.status}</Text>
      </Card>
    </TouchableOpacity>
  );

  cartItemsComponent = itemData => (
      <Card style={styles.cartCardStyle}>
      
        <Text>{itemData.item.Title}</Text>
        <Text>qty:{itemData.item.quantity}</Text>
        <Text>total:{itemData.item.sellingprice}</Text>
      </Card>
    
  );

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getOrderHistory()
      console.log("hello")
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",jsonValue)
      
    } catch(e) {
      // error reading value
    }
  }

    //get order history
    getOrderHistory() {
      this.setState({refresh:true})
      fetch(`https://api.buniyaad.pk/orders/history/${this.state.retailerData.checkUser._id}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res => {
          this.setState({data: res.data,refresh:false});
          //console.log(JSON.stringify(res.data));
        });
    }


    async getProducts(itemData) {

      await this.setState({modalVisible:true,orderDetails:itemData.item})
      // console.log("tester :",this.state.orderDetails.products[0].productId)
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
         this.setState({combinedList:mergedArray})
        console.log("jdn",mergedArray)
  
  
      }

  componentDidMount(){
    this.getData();
   ;
    
  }

  render() {
    
    return (
      <Container style={styles.containerStyle}>
       
  
          {this.state.retailerData != '' && (
           <FlatList
          ListHeaderComponent={<>
                
            <Card>
            <CardItem header>
              <Text>Retailer: </Text>
            </CardItem>
            <Text>Shop: {this.state.retailerData.checkUser.ShopName}</Text>
            <Text>Retailer Name: {this.state.retailerData.checkUser.Name}</Text>
            <Text>Address: {this.state.retailerData.checkUser.ShopAddress}</Text>
          </Card>
          
         
           </>}
           data={this.state.data}
           refreshing={this.state.refresh}
          onRefresh={()=>this.getOrderHistory()}
           renderItem={item => this.orderHistoryItemsComponent(item)}
        />
        )}
 

          {/*View order details pop up */ }
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible:false,combinedlist:[],products:[]});
          }}
        >
          <View >
            <View style={styles.modalView}>
            
            <FlatList
        ListHeaderComponent={<>
          <Text>Products</Text>
        </>}
          data={this.state.combinedList}
          renderItem={item => this.cartItemsComponent(item)}
        />
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
    backgroundColor:'#faf9f7',
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
    margin:10,
    padding:10,
    width:'90%',
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

 
});
