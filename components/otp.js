import * as React from 'react';
import {StyleSheet, Image, View,TouchableOpacity} from 'react-native';
import {
  Container,
  Form,
  Content,
  Text,
  Item,
  Input,
  Label,
  Button,
  textInput,
} from 'native-base';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {route} from 'express/lib/application';
import { CloudWatchLogs } from 'aws-sdk';


export default class Otp extends React.Component {
  state = {
    code: '',
    otp: this.generate_otp(),
    timer: 30,
    phoneno:`92${this.props.route.params.phoneno}`,
    showResendBtn:false,
  };

  setTimer(){
    this.interval = setInterval(
      () => this.setState(prevState => ({timer: prevState.timer - 1})),
      1000,
    );
  }

  generate_otp(){

    return parseInt(Math.random() * (9999 - 1000) + 1000)
  }

  send_sms(){
    fetch(`https://sms.lrt.com.pk/api/sms-single-or-bulk-api.php?username=Waze&password=Waze0987654321asdfghjkl&apikey=f5df4546ce2eac4b86172e2d29aa4046&sender=HELI-KZK&phone=${this.state.phoneno}&type=English&message=your%20passcode%20is:${this.state.otp}`)
  }

  check_otp(code) {
    console.log(code);
    if (parseInt(this.state.otp) === parseInt(code)) {
      this.props.navigation.navigate('Setpin',{phoneno: this.props.route.params.phoneno});
    }
  }

  resend_sms(){
    if(this.state.timer===0){
      this.setState({timer:30});
      this.setTimer();
      this.send_sms();
    }

  }

 

  componentDidMount() {
  
   this.send_sms();
    console.log(this.state.otp);
    this.setTimer();
 
    
  
  }

  componentDidUpdate() {
    if (this.state.timer === 0) {

      clearInterval(this.interval);
      
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <Container>
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
            }>{`0${this.props.route.params.phoneno}`}</Text>
          <Text style={styles.timerStyle}>{this.state.timer}</Text>

          <TouchableOpacity onPress={()=>this.resend_sms()}>
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
    textDecorationLine:'underline',
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
