import * as React from 'react';
import {StyleSheet, Image, View, TouchableOpacity,ToastAndroid,PermissionsAndroid,Alert, NativeSyntheticEvent,} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {
  Container,
  Content,
  Text,
} from 'native-base';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Mixpanel} from 'mixpanel-react-native';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();


export default class Otp extends React.Component {
  state = {
    code: '',
    otp: this.generate_otp(),
    timer: 60,
    data:`${this.props.route.params.data}`,
    phoneno: `${this.props.route.params.phoneno}`,
    showResendBtn: false,
    FCMtoken:'',
    retailerData:[],
    
  };

 async storeData(value){
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('test', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      await this.setState({retailerData:JSON.parse(jsonValue)})
      this.sendToken();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  async storeLoggedin(value){
    try {
      
      await AsyncStorage.setItem('loggedIn',JSON.stringify(value) )
      console.log("Logged in is set to: ",JSON.stringify(value))
    } catch (e) {
      // saving error
    }
  }

  async getToken(){
    try {
      const jsonValue = await AsyncStorage.getItem('token')
      console.log("this is FCM token ", JSON.parse(jsonValue))
      jsonValue != null ? this.setState({FCMtoken:JSON.parse(jsonValue)}) :null;
    
 
    } catch(e) {
      // error reading value
    }
  }

  //otp timer
  setTimer() {
    this.interval = setInterval(
      () => this.setState(prevState => ({timer: prevState.timer - 1})),
      1000,
    );
  }

  //function to generate 4 digit otp
  generate_otp() {
    return parseInt(Math.random() * (9999 - 1000) + 1000);
  }

  //send sms params: phoneno, otp
  send_sms() {
    const messagebody=encodeURIComponent(`Your Buniyaad app OTP Code is: ${this.state.otp}\nK0XFHr4Jh4L`)
    console.log(messagebody)
    let phoneno=`92${this.state.phoneno.substring(1)}`
    console.log(phoneno)

    fetch(
      `https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=Waze0987654321asdfghjkl&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=BuniyadTech&phone=${phoneno}&type=English&message=${messagebody}`,
    );
  }





  async _onSmsListenerPressed(){
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        
         SmsRetriever.addSmsListener(event => {
          let otp= event.message.substring(27,31)
          this.setState({code:otp})
          console.log(otp)
          this.check_otp(otp)
          //in case listener stops working place the remove() event here
          
        }); 
        
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      SmsRetriever.removeSmsListener();
    }
  };

  


  //match entered otp with generated otp
  check_otp(code) {
    //console.log(code);
    SmsRetriever.removeSmsListener();

    let retailerData=this.state.retailerData;

    if (parseInt(this.state.otp) === parseInt(code)) {
      ToastAndroid.show("OTP matched", ToastAndroid.SHORT)
      mixpanel.identify(`92${this.state.phoneno.substring(1)}`)
      mixpanel.getPeople().set("Name",retailerData.checkUser.Name)
      mixpanel.getPeople().set("ShopName",retailerData.checkUser.ShopName)
      mixpanel.getPeople().set( "ShopAdress",retailerData.checkUser.ShopAddress)
      mixpanel.getPeople().set("Verified",retailerData.checkUser.Verified)
        
       
      mixpanel.track('OTP Verified',
    {'phone number': `92${this.state.phoneno.substring(1)}`
    ,"source":"App"});  
    
      mixpanel.track('logged in',
      {'phone number': `92${this.state.phoneno.substring(1)}`
      ,"source":"App"});
      this.storeLoggedin("true");
      if(this.state.retailerData.checkUser.UserFirstLogin){
        this.props.navigation.push('Home')
      }
      else{this.props.navigation.push('Onboarding')}
      
      //this.props.navigation.push('Home')
      //this.handle_register();
    }

  }

    // post token 
    sendToken(){
      retailerData=this.state.retailerData;
      console.log("REtailare data: ",retailerData)
      //console.log("Retailer Data is:",this.state.retailerData)
     // console.log("Token is ",this.state.data.token)
      fetch(`https://api.buniyaad.pk/users/update/${retailerData.checkUser._id}`, {
       method: 'PUT',
       headers: {
       Accept: 'application/json',
       'Content-Type': 'application/json',
       token: `bearer ${retailerData.token}`,
       },
       body: JSON.stringify({
         "Name":retailerData.checkUser.Name,
         "Email":retailerData.checkUser.Email,
         "PhoneNumber":retailerData.checkUser.PhoneNumber,
         "ShopAddress":retailerData.checkUser.ShopAddress,
         "ShopName":retailerData.checkUser.ShopName,
         "CNIC":retailerData.checkUser.CNIC,
         "Verified":retailerData.checkUser.Verified,
         "AreaId":retailerData.checkUser.AreaId,
         "IntrustCategory":retailerData.checkUser.IntrustCategory,
         "token":this.state.FCMtoken,
         "UserFirstLogin":true,
       })
      }).then((response)=>response.json())
      .then(data=>console.log("results:", data))
      
  
     
     }
 

  // reset timer and send sms again on resesnd btn
  resend_sms() {
    if (this.state.timer === 0) {
      this.setState({timer: 60});
      this.setTimer();
      this.send_sms();
    }
  }

  /* 
  // register User
  handle_register(){
   
      fetch('https://api.buniyaad.pk/auth/register', {
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      "contactNo":this.state.phoneno,
    
      })
    }).then((response)=>response.json())
     .then(data=> console.log(data.data))
    .then(() => this.props.navigation.navigate('NotVerified'));
        }
    */

  componentDidMount() {
    // send sms and set timer
    this.getToken();
    this.getData();
    this.send_sms();
    console.log(this.state.otp);
    mixpanel.track('Verification Initiated',
    {'phone number': `92${this.state.phoneno.substring(1)}`
    ,"source":"App"});
    Clipboard.setString('');
    this.setTimer();
    this._onSmsListenerPressed()
    
  }
 

  componentDidUpdate() {
    // stop timer interval on count down 0
    if (this.state.timer === 0) {
      clearInterval(this.interval);
    }
  }

  componentWillUnmount() {
    // refresh timer
    clearInterval(this.interval);
    SmsRetriever.removeSmsListener();
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <Content
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={styles.labelStyle}>
            Bhejay huey SMS code kou darj karein
          </Text>
          <Text
            style={
              styles.phonenoStyle
            }>{`${this.props.route.params.phoneno}`}</Text>
          <Text style={styles.timerStyle}>{this.state.timer}</Text>

          <TouchableOpacity onPress={() => this.resend_sms()}>
            <Text style={styles.smallLabelStyle}>Tap here to Resend</Text>
          </TouchableOpacity>

          <OTPInputView
            style={{width: '80%', height: 200}}
            pinCount={4}
            onCodeChanged={code => {
              this.setState({code});
            }}
            codeInputFieldStyle={styles.underlineStyleBase}
            autoFocusOnLoad={false}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={code => {
              this.check_otp(code);
            }}
          />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
  },
  labelStyle: {
    marginTop: 50,
    fontSize: 20,
    marginLeft:10,
    marginRight:10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallLabelStyle: {
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  phonenoStyle: {
    marginTop: 10,
    color: '#FFC000',
    fontWeight: 'bold',
    fontSize: 20,
  },
  timerStyle: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#FFC000',
    fontSize: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: 20,
    borderRadius: 10,
    color: '#FFC000',
  },
  underlineStyleBase: {
    width: 60,
    height: 60,
    borderWidth: 5,
    borderColor: '#FFC000',
    fontSize: 20,
    borderRadius: 10,
    color: 'black',
  },

  underlineStyleHighLighted: {
    borderWidth: 6,
  },
});