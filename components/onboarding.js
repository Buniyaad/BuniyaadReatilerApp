import * as React from 'react';
import {StyleSheet, Image, BackHandler} from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
} from 'native-base';
import Icon from 'react-native-ionicons';
import Onboarding from 'react-native-onboarding-swiper';
import {Mixpanel} from 'mixpanel-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

export default class NotVerified extends React.Component{
  state={
    retailerData:[],
    phoneno:`${this.props.route.params.phoneno}`,
  }

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      await this.setState({retailerData:JSON.parse(jsonValue)})
      //this.sendToken();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  
 async storeData(value){
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('test', jsonValue)
  } catch (e) {
    // saving error
  }
}

update_retailerData() {
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
    }),
  })
    .then(response => response.json())
    .then(data =>
      {this.storeData(data.data)
      console.log("here is updated data ",data.data)}
    )
}

  

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
    this.update_retailerData();
    mixpanel.track('First Time Login',
    {"source":"App"});
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  onDone(){
    mixpanel.track('Tutorial Completed',
    {"source":"App"});
    mixpanel.track('First Time Login',
      {"source":"App"});
    this.props.navigation.push('Home')
  }

  onSkip(){
      mixpanel.track('Tutorial Skipped',
      {"source":"App"});
      mixpanel.track('First Time Login',
      {"source":"App"});
      this.props.navigation.replace('Home')
  }

    render(){return(
      <Container style={styles.containerStyle}>  
        <Onboarding
    onDone={() => this.onDone()}
    onSkip={()=> this.onSkip()}

    pages={[
      {
        backgroundColor: '#FFC000',
        subTitleStyles :{fontWeight:'bold'},
        titleStyles :{fontWeight:'bold'},   
        image: <Image  source={require('./assets/Delivery.png')} />,
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
        image: <Image source={require('./assets/orderShipment.png')} />,
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