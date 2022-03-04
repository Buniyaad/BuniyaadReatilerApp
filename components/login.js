import * as React from 'react';
import {StyleSheet, Image, ToastAndroid, Animated,ImageBackground} from 'react-native';
import {
  Container,
  Form,
  Content,
  Text,
  Item,
  Input,
  Label,
  Button,
  Spinner,
} from 'native-base';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default class Login extends React.Component {
  state = {
    phoneno: '',
    data:'',
    authenticated:false,
    showBtn: false,
    isRegistered:false,
    showSpinner:false,
    retailerData:'',
    fadeAnim: new Animated.Value(1),
    switchImage:false,
    FCMtoken:'',
  };
 
  async storeData(value){
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('test', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  async getToken(){
    try {
      const jsonValue = await AsyncStorage.getItem('token')
      console.log("this is token ", JSON.parse(jsonValue))
      jsonValue != null ? this.setState({FCMtoken:JSON.parse(jsonValue)}) :null;
    
 
    } catch(e) {
      // error reading value
    }
  }

  //welcome animation
  fadeIn = () => {
   this.setState({switchImage:true})
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 1000,
      delay:2000,
      useNativeDriver: true
    }).start(()=>{
      this.setState({switchImage:false})
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true
      }).start();
    });


  };

  fadeOut = () => {
    
  };
  
  // check available phone number on device
  getPhoneNumber = async () => {
    let phoneNumber=''
    try {
      phoneNumber = await SmsRetriever.requestPhoneNumber();
      console.log('0'+phoneNumber.substring(3))
     phoneNumber='0'+phoneNumber.substring(3)
     
      
    } catch (error) {
      console.log(JSON.stringify(error));
    }
    
    this.handle_phoneno(phoneNumber)
    //this.setState({phoneno:phoneNumber})
   }; 
   
  // check if complete phone num is entered then show next btn
  handle_phoneno(text) {
    this.setState({phoneno: text.replace(/[^0-9]/g, '')});
    if (text.length === 11) {
      this.setState({showBtn: true});
    } else {
      this.setState({showBtn: false});
    }
  }

  //check whether to route to otp or pin screen
  check_registered() {
    if(this.state.isRegistered===true){
      //alert("User exists")
      //this.props.navigation.navigate('Pin', {phoneno: this.state.phoneno})
      this.handle_registered()
    }
    else{
      this.props.navigation.navigate('Otp', {phoneno: this.state.phoneno});
    }
    
  }

  //check if number is registered, button onpress event
   handle_loginbtn(){
     this.setState({showSpinner:true,showBtn:false})
    fetch('https://api.buniyaad.pk/auth/contact', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "contactNo":this.state.phoneno,
  })
})
 .then((response)=>response.json())
 .then(data=>this.setState({isRegistered:data.data}))
 .then(()=> this.check_registered())
 .catch(error => {this.setState({showSpinner:false,showBtn:true})
   ToastAndroid.show("Network issues :(", ToastAndroid.LONG)
   });
  }

  // if user is registered
  handle_registered() {
    console.log(this.state.phoneno)
    this.setState({showSpinner: true, showBtn: false});
    fetch('https://api.buniyaad.pk/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactNo: this.state.phoneno,
      }),
    })
      .then(response => response.json())
      .then(data =>
        this.setState({data: data.data, retailerData: data.data.checkUser, authenticated: !data.error}),
      ).then(() => console.log("here ",this.state))
      .then(() => this.check_Verified());
  }

    //check whether user is verified
    check_Verified() {
     
      if (this.state.data.checkUser.Verified === true) {
        //console.log('you have permission',this.state.data);
        this.storeData(this.state.data);
        this.sendToken();
        this.props.navigation.navigate('Home',{data: this.state.data});
      } else {
        console.log('you dont have permission');
        this.props.navigation.navigate('NotVerified');
      }
    }

    // post token 
    sendToken(){
     console.log("Retailer Data is:",this.state.retailerData)
     console.log("Token is ",this.state.data.token)
     fetch(`https://api.buniyaad.pk/users/update/${this.state.retailerData._id}`, {
      method: 'PUT',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: `bearer ${this.state.data.token}`,
      },
      body: JSON.stringify({
        "Name":this.state.retailerData.Name,
        "Email":this.state.retailerData.Email,
        "PhoneNumber":this.state.retailerData.PhoneNumber,
        "ShopAddress":this.state.retailerData.ShopAddress,
        "ShopName":this.state.retailerData.ShopName,
        "CNIC":this.state.retailerData.CNIC,
        "Verified":this.state.retailerData.Verified,
        "AreaId":this.state.retailerData.AreaId,
        "IntrustCategory":this.state.retailerData.IntrustCategory,
        "token":this.state.FCMtoken,
      })
     }).then((response)=>response.json())
     .then(data=>console.log("results:", data))
    }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({showSpinner:false,phoneno:''})
      this.getPhoneNumber() 
      this.getToken();
      this.fadeIn()
    });
    
  }


  componentWillUnmount() {
    this._unsubscribe();
    
    
  }

  render() {
    return (
     
      <Container style={styles.containerStyle}>
         <ImageBackground
      style={{width:'100%',height:'100%'}}
      tintColor='#C78E15'
     source={{uri:'https://s3-alpha-sig.figma.com/img/74c8/1b77/a5860b618da8770a72034c819baaae15?Expires=1646611200&Signature=PKlBd85VHolrYVqR4HJLLooQIq2nkIXOAGTsAplGmQmbIMddPhVx1d93VPHL2-hRAHgpnlFdmdHB~NfWnlp3b-5EM7i9xkPox99Kopt7gmSTYN5zkQxw3iJ7yRAoa6~rpg-d4CPs~YWLBWfO64m0BmTZOfL~Dlm2QjczZJIaAURKjcfIeqqZMG5qTA0Dfr3FoJA78VSsqjgahvzHV~iQv17xLu1mcwknHqrciaveU7VPAj9oR3Nhx1zHw2CAiQa2kApNxoucLkQR6Af0AEA9EAmDaFu9sDvrWzGCdK8vFO80HiW0gJC8Kl3w8pQwvQgm2dSzZ2c3KQhVSgNzE13qNg__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA'}}
   >
        <Content>
         
          <Image
            style={styles.logoStyle}
            source={require('./assets/logoTitle.png')}
          />       
            
         <Animated.Image
            tintColor='white'
            style={this.state.switchImage?{opacity: this.state.fadeAnim,height:35,width:250,marginBottom:65,marginTop:150, alignSelf:'center'}
            :{opacity: this.state.fadeAnim,height:200,width:200,marginTop:50, alignSelf:'center'}}
            source={this.state.switchImage? require("./assets/WELCOME!.png"):require("./assets/KhushAmdeed.png")}
          />      
        
          <Text style={styles.txt}>Mobile number darj karein!</Text>

          <Item style={styles.phoneInputStyle} inlineLabel>
            <Input
              placeholder="e.g. 03xxxxxxxxx"
              style={{marginLeft: 10}}
              keyboardType="numeric"
              maxLength={11}
              textAlign='center'
              value={this.state.phoneno}
              onChangeText={text => {
                this.handle_phoneno(text);
              }}
            
            />
          </Item>

        

          {this.state.showBtn && (
            <Button
              style={styles.btnStyle}
              onPress={() => this.handle_loginbtn()}>
              <Text
                style={{color: '#FFC000', fontWeight: 'bold', fontSize: 20}}>
                Next
              </Text>
            </Button>
          )}

          {this.state.showSpinner && (
            <Spinner color={'black'}/>
          )}
          
        </Content>
        </ImageBackground>
      </Container>
  
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: '#FFC000',
    flex:1,
  },
  contentStyle:{
    flex:1,
  },
  logoStyle: {
    alignSelf: 'center',
    marginTop: 100,
    width:250,
    height:75
  },
  txt: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#303030',
  },
  phoneInputStyle: {
    marginTop: 20,
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  inputlabelStyle: {
    borderRightWidth: 1,
    borderRightColor: '#FFC000',
  },
  btnStyle: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding:40,
    borderRadius: 15,
  },
});