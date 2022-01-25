import * as React from 'react';
import {StyleSheet, Image, View,TouchableOpacity} from 'react-native';
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




export default class Setpin extends React.Component{
    state={
        pin:'',
        confirmpin:'',
        matched:false,
        phoneno:this.props.route.params.phoneno,
        showSpinner:false,
        showPin:false,
    }

    check_pin(confirmpin){
       if(this.state.pin===confirmpin){
           console.log('pins matched');
           this.setState({matched:true})
       }
       else{
           console.log('pins do not matched');
           this.setState({matched:false})
       }
    }

    handle_register(){
      this.setState({showSpinner:true,matched:false})
        fetch('https://api.buniyaad.pk/auth/register', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "contactNo":`0${this.state.phoneno}`,
    "pin":this.state.pin,
  })
}).then((response)=>response.json())
.then(data=> console.log(data.data))
.then(() => this.props.navigation.navigate('NotVerified'));
    }

    componentDidMount(){
      Clipboard.setString('');
    }

    render(){return(
        <Container>
            <Content
             contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
              }}> 
              <Text style={styles.labelStyle}>Khush amdeed! baraye meharbaani apni password pin set karein </Text>

              <Text style={styles.smallLabelStyle}>Enter pin</Text>
              <OTPInputView
            style={{width: '80%', height: 100}}
            pinCount={4}
            onCodeChanged={pin => {
              this.setState({pin});
            }}
            codeInputFieldStyle={styles.underlineStyleBase}
            autoFocusOnLoad={false}
            secureTextEntry={!this.state.showPin}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={pin => {
              console.log(pin);
            }}
          />

              <Text style={styles.smallLabelStyle}>Re-Enter pin</Text>
              <OTPInputView
            style={{width: '80%', height: 100}}
            pinCount={4}
            onCodeChanged={confirmpin => {
              this.setState({confirmpin});
            }}
            codeInputFieldStyle={styles.underlineStyleBase}
            autoFocusOnLoad={false}
            secureTextEntry={!this.state.showPin}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            onCodeFilled={confirmpin => {
              console.log(confirmpin);
              this.check_pin(confirmpin);
            }}
          />

          <Button transparent style={{alignSelf:'center'}} onPress={()=>this.setState({showPin:!this.state.showPin})}>
            <Icon name={this.state.showPin?'eye-off':'eye'} color='black'/>
          </Button>

             {this.state.matched && (
            <Button
              style={styles.btnStyle}
              onPress={()=>this.handle_register()}>
              <Text
                style={{color: 'black', fontWeight: 'bold', fontSize: 20}}>
                Next
              </Text>
            </Button>
          )}

          {this.state.showSpinner && (
            <Spinner color={'black'}/>
          )}
            </Content>
        </Container>
    )}
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