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
import {Mixpanel} from 'mixpanel-react-native';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();



export default class Otp extends React.Component {
  state = {
    code: '',
    otp: this.generate_otp(),
    timer: 60,
    phoneno: `${this.props.route.params.phoneno}`,
    showResendBtn: false,
  };

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
    const messagebody=encodeURIComponent(`Your Buniyaad OTP app Code is: ${this.state.otp}\nK0XFHr4Jh4L`)
    console.log(messagebody)
    let phoneno=`92${this.state.phoneno.substring(1)}`
    console.log(phoneno)

    fetch(
      `https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=04d39cc574f427bc26dc8357de276&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=BuniyadTech&phone=${phoneno}&type=English&message=${messagebody}`,
    );
  }





  async _onSmsListenerPressed(){
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        
         SmsRetriever.addSmsListener(event => {
          let otp= event.message.substring(31,36)
          this.setState({code:otp})
          console.log(otp)
          this.check_otp(otp)
          //SmsRetriever.removeSmsListener();
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
    if (parseInt(this.state.otp) === parseInt(code)) {
      ToastAndroid.show("OTP matched", ToastAndroid.SHORT)
      this.handle_register();
    }
  }

  // reset timer and send sms again on resesnd btn
  resend_sms() {
    if (this.state.timer === 0) {
      this.setState({timer: 60});
      this.setTimer();
      this.send_sms();
    }
  }

  check
  // register User
  handle_register(){
   
      fetch('https://api.buniyaad.pk/auth/register', {
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      "contactNo":`92${this.state.phoneno.substring(1)}`,
    
      })
    }).then((response)=>response.json())
     .then(data=> console.log(data.data))
    .then(() => {

      mixpanel.track('OTP Verified',
    {'phone number': `92${this.state.phoneno.substring(1)}`
    ,"source":"App"});

      mixpanel.track('Register',
      {'phone number': this.state.phoneno
      ,"source":"App"});

      this.notify_admin();
      
      this.props.navigation.navigate('NotVerified')});
    }

      notify_admin(){
          fetch(
            `https://api.buniyaad.pk/webretailernotification/sentnotifications/retailer`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
             
              }),
            },
          )
            .then(response => response.json())
            .then(data => console.log("notified admin",data));
        }

  componentDidMount() {
    // send sms and set timer
    this.send_sms();
    console.log(this.state.otp);
    console.log("User phone num:",`92${this.state.phoneno.substring(1)}`)
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