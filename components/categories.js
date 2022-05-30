import * as React from 'react';
import {
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  BackHandler,
  View,
  ScrollView,
} from 'react-native';
import {
  Badge,
  Body,
  Card,
  Container,
  Content,
  Text,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Tabs,
  Tab,
  Input,
  Label,
  Spinner,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Mixpanel} from 'mixpanel-react-native';
const mixpanel= new Mixpanel("bc7f90d8dffd6db873b39aad77b29bf0");
mixpanel.init();

import server from './fetch/baseURL';

export default class Categories extends React.Component {
  state = {
    data: [],
    brandsData:[],
    retailerData:'',
    showSpinner:true,
  };



  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      mixpanel.identify(JSON.parse(jsonValue).checkUser.PhoneNumber)
      this.getCategories();
      this.getBrands();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  categoryCardComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => this.props.navigation.navigate('CategoriesSearch', {
      id:itemData.item._id
      ,type:'category'
    })}>
      <Card style={styles.categoryCardStyle}>
        <Image
          style={styles.imageStyle}
          source={{uri: itemData.item.CategoryImage}}
        />
        <Text
        numberOfLines={2}
          style={{
            color: 'black',
            textAlign: 'center',
            textAlignVertical:'bottom',
            margin:5,
        
          
          }}>
          {itemData.item.Name}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  brandCardComponent = itemData => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => this.props.navigation.navigate('CategoriesSearch', {
      id:itemData.item._id
      ,type:'brand'
    })}>
      <Card style={styles.categoryCardStyle}>
        <Image
          style={styles.imageStyle}
          source={{uri: itemData.item.BrandImage}}
        />
        <Text
        numberOfLines={2}
          style={{
            color: 'black',
           margin:5,
            textAlign: 'center',
            textAlignVertical:'bottom',
          }}>
          {itemData.item.Name}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  //get all category names and images
  getCategories(){
    fetch(`${server}/categories/get`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data,showSpinner:false});
      });
  }

  //get specific category to search
  getCategoryById(id) {
    fetch(`${server}/categories/getById/${id}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        console.log(JSON.stringify(res.data));
      });
  }

    //get all brand names and images
    getBrands(){
      fetch(`${server}/brands/get`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res => {
          console.log("brands are:",res.data)
          this.setState({brandsData: res.data,showSpinner:false});
        });
    }

    //handle back button function
    backAction = () => {
      let currentScreen=this.props.route.name
      console.log(currentScreen)
      if(currentScreen==="Home"){
       Alert.alert(
         "Close?",
         "press OK to leave the App",
         [
           {
             text: "Cancel",
             onPress: () => console.log("Cancel Pressed"),
             style: "cancel"
           },
           { text: "OK", onPress: () => BackHandler.exitApp() }
         ]
       );
      }
      else{
        this.props.navigation.navigate("Home");
      }
       
       
       //BackHandler.exitApp()
       return true;
     };





  componentDidMount() {
    this.getData()
    BackHandler.addEventListener('hardwareBackPress', this.backAction);

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
    
        <FlatList
          columnWrapperStyle={{justifyContent: 'space-evenly'}}
          numColumns={3}
          ListHeaderComponent={
            <>
              <Text style={styles.labelStyle}>Categories</Text>
              {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}

              <Text style={styles.itemLabelStyle}>CATEGORIES</Text>
                <FlatList
                  columnWrapperStyle={{justifyContent: 'space-evenly'}}
                  numColumns={3}
      
                 data={this.state.data}
                  renderItem={item => this.categoryCardComponent(item)}

                />
              <Text style={styles.itemLabelStyle}>BRANDS</Text>
            </>
          }
          data={this.state.brandsData}
          renderItem={item => this.brandCardComponent(item)}
        />

       
        <Footer style={{height:70}}>
          <FooterTab style={styles.footerStyle}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Home');
              }}>
              <Icon name="home" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Home</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Categories');
              }}>
              <Icon name="grid" style={{color: '#FFC000'}} />
              <Label style={{color: '#737070'}}>Categories</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Cart');
              }}>
              <Icon name="cart" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Cart</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Account');
              }}>
              <Icon name="person" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Account</Label>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor:'#faf9f7',
  },
  headerStyle: {
    backgroundColor: '#FFC000',
  },
  footerStyle: {
    backgroundColor: 'white',
  },
  btnStyle: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#ffab03',
  },
  labelStyle: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
    
  },
  itemLabelStyle: {
    marginTop: 30,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
    marginLeft: 10,
  },
  categoryCardStyle: {
   
    borderRadius: 10,
    height: 130,
    width: 110,
    margin:20,
  },
  imageStyle: {
    height: "60%",
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
    resizeMode:'cover'
    
  },
});
