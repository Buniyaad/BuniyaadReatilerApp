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
    totalCredit:0,
    totalDebit:0,
    showSpinner:false
  };

 

  ledgerItemsComponent = itemData => (
   
      <Card style={styles.paymentsHistoryCardStyle}>

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Credit</Text>
             <Text style={{fontSize:25,marginTop:10,fontWeight:'bold'}}>
               Rs. {itemData.item.Credit === null? 0 :itemData.item.Credit.toLocaleString('en-GB')}</Text>
        </View>   

        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
             <Text style={{fontSize:17,marginTop:10,fontWeight:'bold',color:'#737070'}}>Debit</Text>
             <Text style={{fontSize:25,marginTop:10,fontWeight:'bold'}}>
               Rs. {itemData.item.Debit === null? 0 :itemData.item.Debit.toLocaleString('en-GB')}</Text>
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

     this.getLedger();
      
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
      getLedger() {
        this.setState({refresh:true})
        fetch(`${server}/ledgers/getByRetailer/${this.state.retailerData.checkUser._id}`, {
          headers: {
            token: `bearer ${this.state.retailerData.token}`,
          },
        })
          .then(response => response.json())
          .then(res => {

           let totalCredit = this.calculateTotalCredit(res.data)
           let totalDebit = this.calculateTotalDebit(res.data)
            this.setState({data: res.data,paymentCount:res.data.length,totalCredit:totalCredit,totalDebit:totalDebit,refresh:false});
            // console.log(JSON.stringify(res.data));
            // console.log("total credit",totalCredit)
            // console.log("total debit",totalDebit)

          });
      }


      calculateTotalCredit(ledgers) {
          console.log("here")
        total = ledgers.reduce(
          (previousScore, currentScore) =>
            parseInt(previousScore) + parseInt(currentScore.Credit===null?0:currentScore.Credit),
          0,
        );
       
        return total;
      }

      calculateTotalDebit(ledgers) {
        console.log("here")
      total = ledgers.reduce(
        (previousScore, currentScore) =>
          parseInt(previousScore) + parseInt(currentScore.Debit===null?0:currentScore.Debit),
        0,
      );

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

          <Card style={styles.retailerCardStyle}>
                <Text style={styles.smalltxt}> Balance</Text>
                <Text style={styles.largetxt}>Rs. {this.state.totalCredit.toLocaleString('en-GB')}</Text>

                <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10,borderTopWidth:1,borderColor:'#f5f5f5'}}>
                  <View >
                        <Text style={styles.smalltxt}> Credit</Text>
                        <Text style={[styles.largetxt,{color:'green',fontSize:20}]}> Rs. {this.state.totalCredit.toLocaleString('en-GB')}</Text>
                  </View>

                  <View >
                        <Text style={styles.smalltxt}> Debit</Text>
                        <Text style={[styles.largetxt,{color:'red',fontSize:20}]}>Rs. {this.state.totalDebit.toLocaleString('en-GB')}</Text>
                  </View>
            </View>

         </Card>
           
  
        
        <Text style={styles.itemLabelStyle}> Payment History:</Text>      
           </>}
           data={this.state.data}
           refreshing={this.state.refresh}
          onRefresh={()=>this.getLedger()}
           renderItem={item => this.ledgerItemsComponent(item)}
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
    marginTop:5,
  },
  smalltxt: {
    marginTop:10,
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
    padding:10,
    width:'95%',
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
