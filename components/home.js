import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Alert,
  BackHandler,
} from 'react-native';
import {
  Badge,
  Body,
  Container,
  Content,
  CardItem,
  Card,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Tabs,
  Tab,
  Text,
  Input,
  Label,
  Left,
  List,
  ListItem,
  Right,
} from 'native-base';
import Icon from 'react-native-ionicons';

export default class Login extends React.Component {
  state = {
    search: '',
    retailerData:this.props.route.params.data,
    data: [],
    prices:[],
  };

     getPrices(prices){
    let pricesArr=[]
      for(let i=0;i<prices.length;i++){
         fetch(`https://api.buniyaad.pk/price/get/${prices[i]}`,{
          headers:{
              token:`bearer ${this.state.retailerData.token}`
          }})
          .then((response)=>response.json())
          .then((res)=>{console.log(res.data.price)})
      }

     
      
     console.log(prices)
     return 600
  }

  //product card components
  recommendedProductsItemComponent = itemData => (
    <TouchableOpacity>
      <Card style={styles.recommendedStyle}>
      <Image style={styles.imageStyle} source={{uri:'https://buniyaad-images.s3.ap-southeast-1.amazonaws.com/9137167.jpg'}} />
        <Text>{itemData.item.title}</Text>
        <Text style={{color: '#FAB624', fontWeight: 'bold'}}>
          {itemData.item.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  allProductsItemComponent = itemData => (
    <TouchableOpacity>
      <Card style={styles.allStyle}>
        <Image style={styles.imageStyle} source={{uri:itemData.item.Image}} />
        <Text>{itemData.item.Title}</Text>
        <Text style={{color: '#FAB624', fontWeight: 'bold'}}>
          {500/*this.getPrices(itemData.item.Price)*/}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  getAllProducts(){
    fetch(`https://api.buniyaad.pk/products`,{
         headers:{
             token:`bearer ${this.state.retailerData.token}`
         }})
         .then((response)=>response.json())
         .then((res)=>{this.setState({data:res.data})
           console.log(JSON.stringify(res.data))})
  }

  getAllPrices(){
    fetch(`https://api.buniyaad.pk/price/get`,{
         headers:{
             token:`bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZjNlOTM5ZTEyMmRlMmU1YmE0MjFlNCIsImVtYWlsIjoiaGFpZGVyQGdtYWlsLmNvbSIsImlzQWRtaW4iOiJBZG1pbiIsImlhdCI6MTY0MzYyMTcxNSwiZXhwIjoxNjQ0MjI2NTE1fQ.PEJ5_EdEvqvyAZYvhnFfGBdkF1tzM5Kxxsglnnp55Cc`
         }})
         .then((response)=>response.json())
         .then((res)=>{this.setState({prices:res.data})
           console.log(JSON.stringify(res.data))})
  }
 
  //handle back button function
  backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => BackHandler.exitApp() }
    ]);
    return true;
  };

 
  componentDidMount(){
    this.getAllProducts()
    //this.getAllPrices()
   
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }



  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.backAction);
  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <Header style={styles.headerStyle}>
          <Left>
            <Image source={require('./assets/logosmall.png')} />
          </Left>

          <Right>
            <Icon name="notifications" />
          </Right>
        </Header>

        <View style={styles.searchViewStyle}>
          <Item rounded style={styles.searchInputStyle}>
            <Label>
              <Icon name="search" />
            </Label>
            <Input
              placeholder="search"
              onChangeText={text => this.setState({search: text})}
              onSubmitEditing={() => alert(this.state.search)}
            />
          </Item>
        </View>

        {/*set aap keh liye as header to sab samaan */}
          
            
            <FlatList
            columnWrapperStyle={{justifyContent: 'space-evenly'}}
            ListHeaderComponent={ <><Card style={styles.bannerStyle}>
            <Image source={require('./assets/logo.png')} />
          </Card>

          <View>
            <Text style={styles.labelStyle}> AAP KEH LIYE</Text>
            <FlatList
              horizontal={true}
              data={this.state.data}
              renderItem={item => this.recommendedProductsItemComponent(item)}
            />
          </View>
          <Text style={styles.labelStyle}> SAB SAMAAN</Text></>}
              data={this.state.data}
              numColumns={2}
              renderItem={item => this.allProductsItemComponent(item)}
            />
        
     

        <Footer>
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
                this.props.navigation.navigate('Categories',{data: this.state.retailerData});
              }}>
              <Icon name="grid" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Categories</Label>
            </Button>

            <Button
              transparent
              badge
              vertical
              onPress={() => {
                this.props.navigation.navigate('Cart',{data: this.state.retailerData});
              }}>
              <Badge warning>
                <Text>1</Text>
              </Badge>
              <Icon name="cart" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Cart</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Account',{data: this.state.retailerData});
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
  },
  headerStyle: {
    backgroundColor: '#FAB624',
  },
  footerStyle: {
    backgroundColor: 'white',
  },
  btnStyle: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#ffab03',
  },
  searchInputStyle: {
    alignSelf: 'center',
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  searchViewStyle: {
    backgroundColor: '#FAB624',
  },
  bannerStyle: {
    marginTop: 10,
    alignSelf: 'center',
    height: 100,
    width: 300,
  },
  labelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
  },
  recommendedStyle: {
    marginLeft: 10,
    borderRadius: 5,
    height: 250,
    width:150,
    justifyContent: 'space-between',
  },
  allStyle: {
 
    borderRadius: 5,
    height: 250,
    width:150,
    justifyContent: 'space-between',
  },
  imageStyle:{
    height:150,
    minWidth:150,
    
  }
});
