import * as React from 'react';
import {StyleSheet, Image, Linking,BackHandler} from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
} from 'native-base';
import Icon from 'react-native-ionicons';
import {Mixpanel} from 'mixpanel-react-native';

import server from './fetch/baseURL';

const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

export default class NotVerified extends React.Component{



  open_WhatsApp(){
    //alert("hghj")
    mixpanel.track('WhatsApp contact Initiated',
    {"source":"App"});
    Linking.openURL("https://wa.me/+923213543115?text=Mainey%20abhi%20Buniyaad%20App%20per%20signup%20kia%20hai!%20Mera%20account%20activate%20kar%20dain")
  }

  backAction = () => {
    let currentScreen = this.props.route.name;
    console.log(currentScreen);
    this.props.navigation.push('Login')

    //BackHandler.exitApp()
    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
    
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }
  
    render(){return(
      <Container style={styles.containerStyle}>
        <Content>
              
         <Text style={styles.txt} >BUNIYAAD APP PER REGISTER KARNE KA SHUKRIYA. HAMARI TEAM JALD AAP SE CONTACT KAREGI!</Text>
         
         <Button
              style={styles.btnStyle}
              onPress={() => this.open_WhatsApp()

                 /*this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
           })*/}>
              <Text
                style={{color: '#FFC000', fontWeight: 'bold', fontSize: 20}}>
                 message Buniyaad
              </Text>
              <Icon color="#25D366" name="logo-whatsapp" />
            </Button>

            
        
        </Content>
      </Container>
        
    )}
    
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: '#FFC000',
    flex:1,
  },
  logoStyle: {
    alignSelf: 'center',
    marginTop: 100,
  },
  txt: {
    marginTop: 200,
    alignSelf: 'center',
    textAlign:'center',
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