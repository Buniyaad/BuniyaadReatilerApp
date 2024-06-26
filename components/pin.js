import * as React from 'react';
import {StyleSheet, Image, View, TouchableOpacity} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {
  Container,
  Content,
  Text,
  Button,
  Spinner,
} from 'native-base';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import server from './fetch/baseURL';

export default class Pin extends React.Component {
  state = {
    enteredpin: '',
    showBtn: false,
    phoneno: this.props.route.params.phoneno,
    authenticated: false,
    data: '',
    showSpinner: false,
    showPin:false,
    showError:false,
    msg:''
  };

  async storeData(value){
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('test', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  //call api to authenticte pin
  check_pin() {
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
        //pin: this.state.enteredpin,
      }),
    })
      .then(response => response.json())
      .then(data =>
        this.setState({data: data.data, authenticated: !data.error}),
      ).then(() => console.log(this.state))
      .then(() => this.check_Verified());
  }

  //check whether user is verified
  check_Verified() {
    if (this.state.authenticated === false) {
      this.setState({showSpinner:false,msg:"Invalid pin"})
     
    }
    if (this.state.data.checkUser.Verified === true) {
      console.log('you have permission');
      this.storeData(this.state.data);
      this.props.navigation.navigate('Home',{data: this.state.data});
    } else {
      console.log('you dont have permission');
      this.props.navigation.navigate('NotVerified');
    }
  }

 

  componentDidMount(){
    Clipboard.setString('');
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
            Khush amdeed! baraye meharbaani apni password pin darj karein{' '}
          </Text>

          <Text style={styles.smallLabelStyle}>Enter pin</Text>
          <OTPInputView
            style={{width: '80%', height: 100}}
            pinCount={4}
            onCodeChanged={pin => {
              this.setState({enteredpin: pin});
            }}
            codeInputFieldStyle={styles.underlineStyleBase}
            autoFocusOnLoad={false}
            secureTextEntry={!this.state.showPin}
            clearInputs={this.state.enteredpin?false:true}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={() => this.setState({showBtn: true,msg:''})}
          />

          <Button transparent style={{alignSelf:'center'}} onPress={()=>this.setState({showPin:!this.state.showPin})}>
            <Icon name={this.state.showPin?'eye':'eye-off'} color='black'/>
          </Button>

          {this.state.showBtn && (
            <Button style={styles.btnStyle} onPress={() => this.check_pin()}>
              <Text style={{color: 'black', fontWeight: 'bold', fontSize: 20}}>
                Next
              </Text>
            </Button>
          )}

        <Text style={styles.errorStyle}>{this.state.msg}</Text>

          {this.state.showSpinner && <Spinner color={'black'} />}
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
    marginTop: 100,
    marginLeft:10,
    marginRight:10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallLabelStyle: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  errorStyle: {
    marginTop: 20,
    fontWeight: 'bold',
    color:'red'
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
  btnStyle: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#FFC000',
    padding: 40,
    borderRadius: 15,
  },
});