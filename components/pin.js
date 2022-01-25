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

export default class Pin extends React.Component {
  state = {
    enteredpin: '',
    showBtn: false,
    phoneno: this.props.route.params.phoneno,
    authenticated: false,
    data: '',
    showSpinner: false,
    showPin:false,
  };

  //call api to authenticte pin
  check_pin() {
    this.setState({showSpinner: true, showBtn: false});
    fetch('https://api.buniyaad.pk/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactNo: `0${this.state.phoneno}`,
        pin: this.state.enteredpin,
      }),
    })
      .then(response => response.json())
      .then(data =>
        this.setState({data: data.data.checkUser, authenticated: !data.error}),
      )
      .then(() => console.log(this.state))
      .then(() => this.check_Verified());
  }

  //check whether user is verified
  check_Verified() {
    if (this.state.authenticated === false) {
      alert('invalid pin');
    }
    if (this.state.data.Verified === true) {
      console.log('you have permission');
      this.props.navigation.navigate('Home');
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
      <Container>
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
            onCodeFilled={() => this.setState({showBtn: true})}
          />

          <Button transparent style={{alignSelf:'center'}} onPress={()=>this.setState({showPin:!this.state.showPin})}>
            <Icon name={this.state.showPin?'eye-off':'eye'} color='black'/>
          </Button>

          {this.state.showBtn && (
            <Button style={styles.btnStyle} onPress={() => this.check_pin()}>
              <Text style={{color: 'black', fontWeight: 'bold', fontSize: 20}}>
                Next
              </Text>
            </Button>
          )}

          {this.state.showSpinner && <Spinner color={'black'} />}
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
  btnStyle: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#FAB624',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});
