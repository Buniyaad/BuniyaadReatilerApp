import * as React from 'react';
import {StyleSheet, Image, } from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
} from 'native-base';
import Icon from 'react-native-ionicons';
import Onboarding from 'react-native-onboarding-swiper';

export default class NotVerified extends React.Component{

  
    render(){return(
      <Container style={styles.containerStyle}>  
        <Onboarding
    onDone={() => this.props.navigation.push('Home')}
    onSkip={()=> this.props.navigation.push('Home')}
    pages={[
      {
        backgroundColor: '#FFC000',
        subTitleStyles :{fontWeight:'bold'},
        titleStyles :{fontWeight:'bold'},   
        image: <Image source={require('./assets/Kabhibhi.png')} />,
        title: 'Khush Amdeed!',
        subtitle: 'Dukaan ka saman, mangwana hua asaan! Hamari app say mangwaey apna sab saman ab asani k sath!',
      },
      {
        backgroundColor: '#FFC000',
        subTitleStyles :{color:'white',fontWeight:'bold'},
        titleStyles :{color:'white',fontWeight:'bold'},
        image: <Image source={require('./assets/money.png')} />,
        title: 'Guaranteed Munaafa!',
        subtitle: ' Paey behtareen rates or barhaey apna munaafa! ',
      },
      {
        backgroundColor: 'white',
        subTitleStyles :{fontWeight:'bold'},
        titleStyles :{fontWeight:'bold'},   
        image: <Image source={require('./assets/delivery.png')} />,
        title: 'Tez Delivery!',
        subtitle: " Order ana k agla din maal ap ki dukan per hazir!",
      },
    ]}
  />
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
    marginTop:50,
    width:200,
    height:75
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