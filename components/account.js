import * as React from 'react';
import {Alert,StyleSheet, Image, FlatList,TouchableOpacity,ToastAndroid,Modal,View,BackHandler} from 'react-native';
import {
  Badge,
  Body,
  utton,
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
  Spinner,
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
    amount:'',
    orderId:'',
    status:'',
    showSpinner:false
  };

 

  orderHistoryItemsComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={()=>this.getProducts(itemData)}>
      <Card style={styles.orderHistoryCardStyle}>
      
        <Text  style={{fontSize:20,color:'#737070',fontWeight:'bold'}} numberOfLines={1}>id: {itemData.item.orderId}</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%'}}>
        <Text style={{width:'40%',fontSize:15,textAlignVertical:'bottom'}}>date: {new Date(itemData.item.date).toDateString()}</Text>
        <Text style={{width:'40%',fontWeight:'bold',fontSize:20,textAlignVertical:'bottom'}}>status: {itemData.item.status}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  cartItemsComponent = itemData => (
      <Card style={styles.cartCardStyle}>
         
        <Text  style={{fontSize:20,color:'#737070',fontWeight:'bold'}} numberOfLines={1}>{itemData.item.Title}</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%'}}>
        <Text style={{width:'40%',fontSize:15,textAlignVertical:'bottom'}}>quantity: { itemData.item.quantity}</Text>
        <Text style={{width:'40%',fontWeight:'bold',fontSize:20,textAlignVertical:'bottom'}}>Rs.{itemData.item.sellingprice}</Text>
        </View>
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

  async storeData(){
    try {
      
     await AsyncStorage.clear();
    } catch (e) {
      // saving error
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

   // get products of particular order
    async getProducts(itemData) {

      await this.setState({modalVisible:true,orderDetails:itemData.item,amount:itemData.item.amount,status:itemData.item.status,
      orderId:itemData.item.orderId,showSpinner:true})
       console.log("tester :",this.state.orderDetails)
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
         this.setState({combinedList:mergedArray,showSpinner:false})
        console.log("merged array",mergedArray)
  
  
      }


      cancelOrder(){
        console.log("order Id: ",this.state.orderDetails._id," Products: ",this.state.orderDetails.products)
        fetch(`https://api.buniyaad.pk/orders/update/${this.state.orderDetails._id}`, {
      method: 'PUT',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZjNlOTM5ZTEyMmRlMmU1YmE0MjFlNCIsImVtYWlsIjoiaGFpZGVyQGdtYWlsLmNvbSIsImlzQWRtaW4iOiJBZG1pbiIsImlhdCI6MTY0NjU2MzY2MywiZXhwIjoxNjQ3MTY4NDYzfQ.zraXWi8OPe6wn-LcFtbhpEurG-afTTB8cOMx_REExzA`,
      },
      body: JSON.stringify({
          "status":"Cancelled",
          "products":this.state.orderDetails.products,
      })
     }).then((response)=>response.json())
     .then(data=>{console.log(data)
      ToastAndroid.show('order has been cancelled', ToastAndroid.SHORT);
      this.setState({modalVisible:false})
      
     })
    }

      // Logout 
       logOut(){
        Alert.alert(
          "Log Out?",
          "press OK to Log Out",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            { text: "OK", onPress: () => {
              this.storeData()
              this.props.navigation.replace("Login")
             }}
          ]
        );
       }

        //handle back button function
      backAction = () => {
          let currentScreen=this.props.route.name
          console.log(currentScreen)
          if(currentScreen==="Home"){
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
          }
          else{
            this.props.navigation.navigate("Home");
          }
           
           
           //BackHandler.exitApp()
           return true;
         };

  componentDidMount(){
    this.getData();
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
    
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }


  render() {
    
    return (
      <Container style={styles.containerStyle}>
      
       <Text style={styles.labelStyle}>Account</Text>  

          {this.state.retailerData != '' && (
           <FlatList
          ListHeaderComponent={<>

          <Text style={styles.itemLabelStyle}>Retailer:</Text>   

          <Card style={styles.retailerCardStyle}>
              <Text style={{fontWeight:'bold',fontSize:20,color: '#737070'}} numberOfLines={1}>
                Shop: {this.state.retailerData.checkUser.ShopName}
              </Text>
              <Text style={{fontWeight:'bold',fontSize:20,color: '#737070'}} numberOfLines={1}>
                Retailer Name: {this.state.retailerData.checkUser.Name}
              </Text>
              <Text style={{fontWeight:'bold',fontSize:20,color: '#737070'}} numberOfLines={2}>
                Address: {this.state.retailerData.checkUser.ShopAddress}
              </Text>
          </Card>
          
          <Text style={styles.itemLabelStyle}>Order History:</Text>          
           </>}
           data={this.state.data}
           refreshing={this.state.refresh}
          onRefresh={()=>this.getOrderHistory()}
           renderItem={item => this.orderHistoryItemsComponent(item)}
        />
        )}

         
       <Button full style={styles.fullBtnStyle} onPress={()=> this.logOut()}>

<Text>LOG OUT</Text>
</Button>
 

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
            style={{marginBottom:20}}
        ListHeaderComponent={<>
           <Button
              transparent
              style={{marginLeft:10}}
              onPress={() => this.setState({modalVisible:false,combinedlist:[],products:[]})}>
              <Icon name='close-circle-outline' color='#737070'  style={{fontSize:35}}/>
            </Button>
          <Text style={styles.labelStyle}>Order Details</Text>
          <Text style={{alignSelf:'center',color:'#FFC000',fontWeight:'bold'}}>Order ID: {this.state.orderId}</Text>

          {this.state.combinedList.length>0 &&(
            <View style={{marginLeft:10,marginRight:10}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',borderTopWidth:1,marginTop:50,alignItems:'center'}}>
             <Text style={{fontSize:20,marginTop:10,fontWeight:'bold',color:'#737070'}}>Total</Text>
            <Text style={{fontSize:20,marginTop:10,fontWeight:'bold'}}>Rs. {this.state.amount.toLocaleString('en-GB')}</Text>
            </View>

            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             <Text style={{fontSize:20,marginTop:10,fontWeight:'bold',color:'#737070'}}>Status</Text>
            <Text style={{fontSize:20,marginTop:10,fontWeight:'bold'}}>{this.state.status}</Text>
            </View>
            </View>
             
            
          )}
         
         <Text style={styles.itemLabelStyle}>Items</Text>
         {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
        </>}
          data={this.state.combinedList}
          renderItem={item => this.cartItemsComponent(item)}
        />

       {this.state.status==='Processing' &&(
          <Button full style={styles.fullCancelBtnStyle} onPress={()=> {this.cancelOrder()}}>

          <Text>Cancel</Text>
          </Button> 
       )}
       
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
              <Icon name="person" style={{color: '#FFC000'}} />
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
    margin:10,
    
  },
  fullCancelBtnStyle:{
    backgroundColor: '#ffab03',
    borderRadius:10,
    marginBottom:40,
    marginTop:10,
    marginLeft:10,
    marginRight:10,
    height:50,
  },
  orderHistoryCardStyle: {
  
    borderRadius:10,
    justifyContent:'space-around',
    marginLeft:10,
    marginRight:10,
    height:100,
    padding:10,
  },
  cartCardStyle: {
    borderRadius: 10,
    justifyContent: 'space-around',
    marginLeft: 10,
    marginRight: 10,
    height: 100,
    padding: 10,
  },
  labelStyle: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
  },
  itemLabelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight:'bold',
    color: '#737070',
    marginLeft:10,
  },
  retailerCardStyle: {
    padding:20,
    width:'90%',
    borderRadius:10,
    alignSelf:'center',
  },
  modalView: {
    marginTop:10,
    height:"100%",
    width:'100%',
    backgroundColor: "white",
    borderRadius: 10,
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
