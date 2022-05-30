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


//const server= __DEV__?'http:dev-api.buniyaad.pk':'https:api.buniyaad.pk';

export default class Payments extends React.Component {
  state = {
    data: [],
    retailerData:'',
    modalVisible:false,
    refresh:false,
    totalAmount:0,
    paymentCount:0,
    showSpinner:false
  };

 

  paymentsHistoryItemsComponent = itemData => (
   
      <Card style={styles.paymentsHistoryCardStyle}>

        <View style={{borderBottomWidth:1, flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Serial #{itemData.item.SerialNo}</Text>
        </View>

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Amount</Text>
             <Text style={{fontSize:25,marginTop:10,fontWeight:'bold'}}>Rs. {itemData.item.Amount.toLocaleString('en-GB')}</Text>
        </View>   
        
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Type</Text>
             <Text style={{fontSize:25,marginTop:10,fontWeight:'bold'}}>{itemData.item.Type}</Text>
        </View>   
    
      </Card>
 
  );



  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})

     this.getPaymentHistory();
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

      //get payment history
      getPaymentHistory() {
        this.setState({refresh:true})
        fetch(`${server}/payments/getByRetailer/${this.state.retailerData.checkUser._id}`, {
          headers: {
            token: `bearer ${this.state.retailerData.token}`,
          },
        })
          .then(response => response.json())
          .then(res => {

            let totalAmount = this.calculateTotalPayments(res.data) 
            this.setState({data: res.data,paymentCount:res.data.length,totalAmount:totalAmount,refresh:false});
            console.log(JSON.stringify(res.data));
            console.log("total Amount",totalAmount)

          });
      }


      calculateTotalPayments(payments) {
          console.log("here")
        total = payments.reduce(
          (previousScore, currentScore) =>
            parseInt(previousScore) + parseInt(currentScore.Amount),
          0,
        );
        console.log("total ",total)
        return total;
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
      
       <Text style={styles.labelStyle}>payments</Text>  


       {this.state.retailerData != '' && (
           <FlatList
          ListHeaderComponent={<>  
        <View style={{flexDirection:'row',justifyContent:'space-around'}}>
           <Card style={styles.retailerCardStyle}>
                <Text style={styles.smalltxt}> Total Payments</Text>
                <Text style={styles.largetxt}>{this.state.paymentCount}</Text>
           </Card>

           <Card style={styles.retailerCardStyle}>
                <Text style={styles.smalltxt}> Total Amount</Text>
                <Text style={styles.largetxt}>{this.state.totalAmount}</Text>
           </Card>
        </View>
        
        <Text style={styles.itemLabelStyle}> Payment History:</Text>      
           </>}
           data={this.state.data}
           refreshing={this.state.refresh}
          onRefresh={()=>this.getPaymentHistory()}
           renderItem={item => this.paymentsHistoryItemsComponent(item)}
        />
        )}

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
  paymentsHistoryCardStyle: {
  
    borderRadius:10,
    justifyContent:'space-around',
    marginLeft:10,
    marginRight:10,
    padding:10,
  },
  listCardStyle: {
    padding:20,
    width:'90%',
    borderRadius:10,
    alignSelf:'center',
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
  smalltxt: {
    
    fontWeight: 'bold',
    textAlign:'center'
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
    width:'45%',
    borderRadius:10,
    marginLeft:5,
    marginRight:5,
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
