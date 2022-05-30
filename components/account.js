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
import {Mixpanel} from 'mixpanel-react-native';
import server from './fetch/baseURL';
const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

//const server= __DEV__?'http:dev-api.buniyaad.pk':'https:api.buniyaad.pk';

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
      
        <View style={{borderBottomWidth:1, flexDirection:'row',justifyContent:'space-between'}}>
          <Text style={{fontSize:15,margin:5,fontWeight:'bold',color:'#737070'}}>Order #{itemData.item.orderId}</Text>
          <Text style={{fontSize:15,margin:5,fontWeight:'bold',color:'#737070'}}>{new Date(itemData.item.date).toDateString()}</Text>
        </View>   

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Status</Text>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#FFC000'}}>{itemData.item.status}</Text>
        </View>   
        
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Total</Text>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold'}}>Rs. {itemData.item.amount.toLocaleString('en-GB')}</Text>
        </View>   
    
      </Card>
    </TouchableOpacity>
  );

  cartItemsComponent = itemData => (

    <Card style={styles.cartCardStyle}>

    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
   <Image
           style={styles.cartImageStyle}
           source={{uri: itemData.item.Image}}
         />

    <View style={{flexDirection:'column',justifyContent:'space-around',width:'80%'}}>
      <Text  style={{fontSize:17,color:'#737070',fontWeight:'bold'}} numberOfLines={1}>{itemData.item.Title}</Text>
   
      <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:5,marginTop:-5}}>
            <Text style={{fontWeight:'bold',fontSize:15}}>Miqdaar: { itemData.item.quantity}</Text>
            <Text style={{fontWeight:'bold',fontSize:15}}>Rs. {itemData.item.sellingprice.toLocaleString('en-GB')} /{itemData.item.Unit}</Text>
           </View>

      
      <Text style={{fontWeight:'bold',fontSize:17}}>
        Rs. {(parseInt(itemData.item.quantity)*parseInt(itemData.item.sellingprice)).toLocaleString('en-GB')} 
      </Text>

        
    </View>
    </View>
 </Card>

 );

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      mixpanel.identify(JSON.parse(jsonValue).checkUser.PhoneNumber)
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
      fetch(`${server}/orders/history/${this.state.retailerData.checkUser._id}`, {
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
      await fetch(`${server}/products/getByPId/${this.state.orderDetails.products[i].productId}`, {
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
        fetch(`${server}/orders/update/${this.state.orderDetails._id}`, {
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
      this.send_cancel_email(this.state.combinedList)
      this.send_sms_on_cancel(this.state.orderId,this.state.amount.toLocaleString('en-GB'))
      this.notify_on_cancel(this.state.orderId,this.state.amount.toLocaleString('en-GB'))
      this.notify_admin_on_cancel()
      this.getOrderHistory();
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
              this.props.navigation.popToTop()
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

         notify_admin_on_cancel(){
          fetch(
            `${server}/webnotification/sentnotifications/cancel`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                Name:this.state.retailerData.checkUser.Name,
              }),
            },
          )
            .then(response => response.json())
            .then(data => console.log("notified admin for cancel",data));
        }

        notify_on_cancel(orderId,amount){
          fetch(
            `${server}/notification/notifications`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                UserId:this.state.retailerData.checkUser._id,
                title:`Order #${orderId}`,
                body:`cancel ho gaya hai! Kul keemat Rs. ${amount}`,
                token:[this.state.retailerData.checkUser.token],
                data:{type:'Account'},
                Type:'Retailer'
              }),
            },
          )
            .then(response => response.json())
            .then(data => console.log("notified admin",data));
        }

        send_cancel_email(mergedArray){

          let productNames=[]
           mergedArray.map((prod)=>{
           productNames.push(prod.Title)
          })
      
          let products=[]
          this.state.orderDetails.products.map((prod)=>{
           products.push({"productId":prod.productId,"quantity":prod.quantity,"sellingprice":prod.sellingprice})
          })
          console.log("Prod Names",productNames,"  prods ",products)
      
          fetch(
            `${server}/email/sendEmail/order`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                token: `bearer ${this.state.retailerData.token}`,
              },
              body: JSON.stringify({
                userId:this.state.retailerData.checkUser._id,
                products:products,
                productsName:productNames,
                amount:this.state.amount,
                status:'Cancelled',
                orderId:this.state.orderId,
                date: new Date(),
                retailername:this.state.retailerData.checkUser.Name,
                retailerContact:this.state.retailerData.checkUser.PhoneNumber,
                retialerShop:this.state.retailerData.checkUser.ShopAddress,
                retailerCnic:this.state.retailerData.checkUser.CNIC,
                retailerShopName: this.state.retailerData.checkUser.ShopName
      
              }),
            },
          )
            .then(response => response.json())
            .then(data => console.log("email resp: ",data));
        }

        send_sms_on_cancel(orderId,amount) {
          const messagebody = encodeURIComponent(`Apka Order #${orderId} jiss ki kul qeemat Rs. ${amount} hai, cancel ho gaya hai. Kisi bhi masla ya madad ki soorat may hamari team say rabta karain.\n\nBuniyaad say order karna ka SHUKRIYA`);
          console.log(messagebody);
          let phoneno = this.state.retailerData.checkUser.PhoneNumber;
          console.log(phoneno);
      
          fetch(
            `https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=04d39cc574f427bc26dc8357de276&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=BuniyadTech&phone=${phoneno}&type=English&message=${messagebody}`,
          );
        }
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
          
          <Card style={styles.retailerCardStyle}>
              <Image
                style={styles.profileImg}
                source={ 
                  this.state.retailerData.checkUser.Picture === ''?
               require('./assets/default.png')
               :{uri: this.state.retailerData.checkUser.Picture}
            }
              />
              <Text style={{fontWeight:'bold',fontSize:30,color: 'black',textAlign:'center'}} numberOfLines={1}>
                 {this.state.retailerData.checkUser.Name}
              </Text>
              <Text style={{fontWeight:'bold',fontSize:25,color: '#737070',textAlign:'center',marginTop:5}} numberOfLines={1}>
                {this.state.retailerData.checkUser.ShopName}
              </Text>
              <Text style={{fontSize:20,color: '#737070',textAlign:'center',fontStyle:'italic',marginTop:5}} numberOfLines={2}>
                 {this.state.retailerData.checkUser.ShopAddress}
              </Text>
          </Card>

         <TouchableOpacity activeOpacity={0.9} onPress={()=>this.props.navigation.push('Payments')}>
          <Card style={styles.retailerCardStyle}>
              <Text style={styles.largetxt}> View Payments </Text>
          </Card>
         </TouchableOpacity>
          
          
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
          

          {this.state.combinedList.length>0 &&(
            <Card style={{marginLeft:10,marginRight:10,padding:10,borderRadius:10}}>
           <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Order #{this.state.orderId}</Text>
           
          <Image
           style={styles.imageStyle}
            source={{uri: this.state.status==='Processing'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/7779254.jpg'
            :this.state.status==='Shipped'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/3905138.jpg'
            :this.state.status==='Cancelled'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/2771678.jpg'
            :this.state.status==='Completed'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/1167358.jpg'
            :this.state.status==='Confirmed'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/701380.jpg'
            :this.state.status==='Delivered'?'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/747491.jpg'
            :null}}
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
    padding:10,
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
  labelStyle: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
  },
  largetxt: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFC000',
    textAlign:'center',
    marginTop:10,
  },
  itemLabelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight:'bold',
    color: '#737070',
    marginLeft:10,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 150/2,
    overflow: "hidden",
    alignSelf:'center',
    marginBottom:20,
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
  imageStyle:{
    height:200,
    width:'100%',
    alignSelf:'center',
    resizeMode:'contain'
  }

 
});
