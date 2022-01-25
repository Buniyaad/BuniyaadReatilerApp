import * as React from 'react';
import {StyleSheet, Image} from 'react-native';
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

export default class Login extends React.Component {
  state = {
    phoneno: '',
    showBtn: false,
    isRegistered:false,
    showSpinner:false,
  };

  // check if complete phone num is entered then show next btn
  handle_phoneno(text) {
    this.setState({phoneno: text});
    if (text.length === 10) {
      this.setState({showBtn: true});
    } else {
      this.setState({showBtn: false});
    }
  }

  //check whether to route to otp or pin screen
  check_registered() {
    if(this.state.isRegistered===true){
      //alert("User exists")
      this.props.navigation.navigate('Pin', {phoneno: this.state.phoneno})
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
    "contactNo":`0${this.state.phoneno}`,
  })
}).then((response)=>response.json())
.then(data=>this.setState({isRegistered:data.data}))
.then(()=> this.check_registered());
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({showSpinner:false,phoneno:''})
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <Content>
          <Image
            style={styles.logoStyle}
            source={require('./assets/logo.png')}
          />
          <Text style={styles.txt}>Mobile number darj karein!</Text>

          <Item style={styles.phoneInputStyle} inlineLabel>
            <Label style={styles.inputlabelStyle}> +92</Label>
            <Input
              placeholder="Enter phone number"
              style={{marginLeft: 10}}
              keyboardType="numeric"
              maxLength={10}
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
                style={{color: '#FAB624', fontWeight: 'bold', fontSize: 20}}>
                Next
              </Text>
            </Button>
          )}

          {this.state.showSpinner && (
            <Spinner color={'black'}/>
          )}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: '#FAB624',
  },
  logoStyle: {
    alignSelf: 'center',
    marginTop: 100,
  },
  txt: {
    marginTop: 200,
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
    borderRightColor: '#FAB624',
  },
  btnStyle: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});
