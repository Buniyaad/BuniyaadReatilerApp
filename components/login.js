import * as React from 'react';
import {StyleSheet, Image, ToastAndroid, Animated} from 'react-native';
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



export default class Login extends React.Component {
  state = {
    phoneno: '',
    showBtn: false,
    isRegistered:false,
    showSpinner:false,
    fadeAnim: new Animated.Value(1),
  };
 
  //welcome animation
  fadeIn = () => {
   
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 1000,
      delay:2000,
      useNativeDriver: true
    }).start(()=>{
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

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({showSpinner:false,phoneno:''})
    });
  
    this.fadeIn()
   this.getPhoneNumber() 
  
    
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

       
            
            <Animated.Image
            tintColor='white'
            style={{opacity: this.state.fadeAnim,height:200,width:200,marginTop:50, alignSelf:'center'}}
            source={{uri:'https://s3-alpha-sig.figma.com/img/9a7c/b540/b889255794869b2f6c4df338a66d4c02?Expires=1646006400&Signature=DUMAwLe3YEHDMhJD0TdT6H-K-uGPW9NFOiJ6zlrXg0w5G1enw5nXaLQXkux1sFemO1DzhWudNftk5elpbOm45UyvZr582skb~jfFlxbjFVToa-4S7-Kt8hghN~RcOdqvo1ydG-zkt8EEMmVyWSamcICWFbj7wWujeJ9BMc-9i8AVZFb6L3VhEU9IbG4mo-9-yUvJRVF2tumaB4GsUz3tqw3ZeQHvwbKwzpdMoNmWMHsVXMgjFF8HLNZG6UHimr9w6EzKuikKwoi7nn858vCEyRGC6IwpZLoQAD2VVHINkzOsJH5DpceG2w6EkaPGDuH~1CiHBIVTpbsOL~TbpTnArQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA'}}
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
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});