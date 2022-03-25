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



export default class Notifications extends React.Component {
  state = {
    data: [],
    retailerData:'',
    showSpinner:false
  };

 

  notificationsItemsComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} >
    <View style={{ flexDirection:'row'}}>
     {/* <Image
                style={styles.profileImg}
                source={{uri:'https://buniyaadimages.s3.ap-southeast-1.amazonaws.com/8479127.jpg'}}
      /> */}

     <Card style={styles.notificationsCardStyle}>
      
       <View style={{ flexDirection:'row',justifyContent:'space-between'}}>
        <Text style={{fontSize:17,margin:5,fontWeight:'bold',color:'#737070'}}>{itemData.item.title}</Text>
       </View>   

        <Text numberOfLines={2} style={{fontSize:15,margin:5,fontWeight:'bold'}}>{itemData.item.message}</Text>
        <Text style={{fontSize:15,margin:5,fontWeight:'bold',color:'#737070',textAlign:'right'}}>{new Date(itemData.item.createdAt).toDateString()}</Text>    

  
        </Card>
    </View>
     
    </TouchableOpacity>
  );


  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getNotifications()
      console.log("hello")
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",jsonValue)
      
    } catch(e) {
      // error reading value
    }
  }

  

    //get notifiactions
    getNotifications() {
      this.setState({refresh:true})
      fetch(`https://api.buniyaad.pk/notification/getById/${this.state.retailerData.checkUser._id}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res => {
        let data =res.data.reverse()
          this.setState({data: data,refresh:false});
         // console.log(JSON.stringify(res.data));
        });
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
      

      {this.state.data != '' && (
           <FlatList
          ListHeaderComponent={<>
          <Text style={styles.labelStyle}>Notifications</Text>
           </>}
           data={this.state.data}
           refreshing={this.state.refresh}
          onRefresh={()=>this.getNotifications()}
           renderItem={item => this.notificationsItemsComponent(item)}
        />
        )}
 
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
  notificationsCardStyle: {
    flex:1,
    borderRadius:10,
    justifyContent:'space-around',
    marginLeft:10,
    marginRight:10,
    padding:10,
  },
  labelStyle: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 150/2,
    overflow: "hidden",
    alignSelf:'center',
    marginBottom:20,
  },


 
});
