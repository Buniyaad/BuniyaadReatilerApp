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
        msg:'',
    }

    check_pin(confirmpin){
       if(this.state.pin===confirmpin){
           console.log('pins matched');
           this.setState({matched:true, msg:''})
       }
       else{
           console.log('pins do not matched');
           this.setState({matched:false, msg:'Pins do not match'})
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
    "contactNo":this.state.phoneno,
    
    
  })
}).then((response)=>response.json())
.then(data=> console.log(data.data))
.then(() => this.props.navigation.navigate('NotVerified'));
    }

    componentDidMount(){
      Clipboard.setString('');
    }

    render(){return(
        <Container style={styles.containerStyle}>
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
            <Icon name={this.state.showPin?'eye':'eye-off'} color='black'/>
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

          <Text style={styles.errorStyle}>{this.state.msg}</Text>
            </Content>
        </Container>
    )}
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
      marginLeft:10,
      marginRight:10,
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
        padding:40,
        borderRadius: 15,
      },
  });