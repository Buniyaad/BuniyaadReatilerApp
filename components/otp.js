import * as React from 'react';
import {StyleSheet, Image, View, TouchableOpacity,PermissionsAndroid,Alert, NativeSyntheticEvent,} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {
  Container,
  Content,
  Text,
} from 'native-base';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import SmsRetriever from 'react-native-sms-retriever';
import SmsListener from 'react-native-android-sms-listener'



export default class Otp extends React.Component {
  state = {
    code: '',
    otp: this.generate_otp(),
    timer: 30,
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
    const messagebody=encodeURIComponent(`<#> Your passcode is: ${this.state.otp}\nonDlwvOi9qy`)
    console.log(messagebody)
    let phoneno=`92${this.state.phoneno.substring(1)}`
    console.log(phoneno)

    fetch(
      `https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=Waze0987654321asdfghjkl&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=HELI-KZK&phone=${phoneno}&type=English&message=${messagebody}`,
    );
  }





  _onSmsListenerPressed = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
         await SmsRetriever.addSmsListener(event => {
          console.log(event.message);
          
        }); 
        SmsRetriever.removeSmsListener();
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };

  


  //match entered otp with generated otp
  check_otp(code) {
    //console.log(code);
    if (parseInt(this.state.otp) === parseInt(code)) {
      this.props.navigation.navigate('Setpin', {
        phoneno: this.props.route.params.phoneno,
      });
    }
  }

  // reset timer and send sms again on resesnd btn
  resend_sms() {
    if (this.state.timer === 0) {
      this.setState({timer: 30});
      this.setTimer();
      this.send_sms();
    }
  }

  componentDidMount() {
    // send sms and set timer
    this.send_sms();
    console.log(this.state.otp);
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
    color: '#FAB624',
    fontWeight: 'bold',
    fontSize: 20,
  },
  timerStyle: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#FAB624',
    fontSize: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: 20,
    borderRadius: 10,
    color: '#FAB624',
  },
  underlineStyleBase: {
    width: 60,
    height: 60,
    borderWidth: 5,
    borderColor: '#FAB624',
    fontSize: 20,
    borderRadius: 10,
    color: 'black',
  },

  underlineStyleHighLighted: {
    borderWidth: 6,
  },
});