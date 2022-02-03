import * as React from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Alert,
  BackHandler,
  Modal
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
  Text,
  Input,
  Label,
  Left,
  Right,
  Spinner,
} from 'native-base';
import Icon from 'react-native-ionicons';

export default class Login extends React.Component {
  state = {
    search: '',
    retailerData: this.props.route.params.data,
    data: [],
    showSpinner:true,
    product:[],
    modalVisible:false,
    prices:[],
    price:'',
    total:0,
  };


  //product card components
  recommendedProductsItemComponent = itemData => (
    <TouchableOpacity>
      <Card style={styles.recommendedStyle}>
        <Image
          style={styles.imageStyle}
          source={{
            uri: 'https://buniyaad-images.s3.ap-southeast-1.amazonaws.com/9137167.jpg',
          }}
        />
        <Text>{itemData.item.title}</Text>
        <Text style={{color: '#FAB624', fontWeight: 'bold'}}>
          {itemData.item.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  allProductsItemComponent = itemData => (
    <TouchableOpacity onPress={()=>this.setState({modalVisible:true,product:itemData.item,price:itemData.item.MinPrice})}>
      <Card style={styles.allStyle}>
        <Image
          style={itemData.item.Image === '' ? null : styles.imageStyle}
          source={
            itemData.item.Image === ''
              ? require('./assets/logo.png')
              : {uri: itemData.item.Image}
          }
        />
        <Text>{itemData.item.Title}</Text>
        <Text style={{color: '#FAB624', fontWeight: 'bold'}}>
          {itemData.item.MinPrice.price}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  //get Sab Samaan products
  getAllProducts() {
    fetch(`https://api.buniyaad.pk/products`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data,showSpinner:false});
        //console.log(JSON.stringify(res.data));
      });
  }

  //get all prices
 async  getPrices() {
    let prices=this.state.product.Price
    let priceArr=[]
    console.log("prices are:", prices)
    for(let i=0; i<prices.length; i++){
      await fetch(`https://api.buniyaad.pk/price/get/${prices[i]}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => { priceArr.push(res.data)})
      .then(console.log(JSON.stringify(priceArr)))
    }
    
  }

  calculateTotal(qty){
    let total= qty > 0? parseInt(qty)*parseInt(this.state.price.price):0
    
     this.setState({total:total})
  }

  //handle back button function
  backAction = () => {
    Alert.alert('Close the Application?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => BackHandler.exitApp()},
    ]);
    return true;
  };

  componentDidMount() {
    this.getAllProducts();
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
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
              returnKeyType='search'
              onSubmitEditing={() =>
                this.state.search == ''
                  ? null
                  : this.props.navigation.navigate('Search', {
                      data: this.state.retailerData,
                      search: this.state.search,
                    })
              }
            />
          </Item>
        </View>

        {/*set aap keh liye as header to sab samaan */}

        <FlatList
          columnWrapperStyle={{justifyContent: 'space-evenly'}}
          ListHeaderComponent={
            <>
               {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
              <Card style={styles.bannerStyle}>
                <Image source={require('./assets/logo.png')} />
              </Card>

              <View>
                <Text style={styles.labelStyle}> AAP KEH LIYE</Text>
                <FlatList
                  horizontal={true}
                  data={this.state.data}
                  renderItem={item =>
                    this.recommendedProductsItemComponent(item)
                  }
                />
              </View>
              <Text style={styles.labelStyle}> SAB SAMAAN</Text>
            </>
          }
          data={this.state.data}
          numColumns={2}
          renderItem={item => this.allProductsItemComponent(item)}
        />

        {/*View product pop up */ }
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible:false});
          }}
        >
          <View >
            <View style={styles.modalView}>
            
            <Button
              transparent
              onPress={() => this.setState({modalVisible:false})}>
              <Icon name='close-circle-outline' color='#737070' style={{fontSize:30}}/>
            </Button>

           <Image
            style={this.state.product.Image === '' ? null : styles.imageModalStyle}
            source={
              this.state.product.Image === ''
              ? require('./assets/logo.png')
              : {uri: this.state.product.Image}
            }
           />

          <Body>
            
            <Text style={{fontSize:30}}>{this.state.product.Title}</Text>
            <Text>{this.state.product.Description}</Text>

          <Card style={{flexDirection:'row'}}>

            <Label style={{alignItems:'center',marginHorizontal:10,marginTop:10}}>
              <Text >Quantity</Text>
            </Label>

            <Button
              transparent
              onPress={() => this.setState({modalVisible:false})}>
              <Icon name='remove-circle' color='#FAB624' style={{fontSize:30,marginHorizontal:10}}/>
            </Button>

            <Input keyboardType='numeric' onChangeText={(text)=>this.calculateTotal(text)}
             style={{borderWidth:0.5,borderRadius:5,marginHorizontal:10,borderColor:'#737070'}}/>
            
            <Button
              transparent
              onPress={() => this.setState({modalVisible:false})}>
              <Icon name='add-circle' color='#FAB624' style={{fontSize:30,marginHorizontal:10}}/>
            </Button>
          </Card>

          <Card style={{width:400,flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{fontSize:30}}>{this.state.price.price}</Text>
            <Text>Per :{this.state.price.min}</Text>
          </Card>

          <Text style={{fontSize:30}}>TOTAL:{this.state.total}</Text>


         </Body>

          <Button full style={styles.fullBtnStyle} onPress={()=>this.getPrices()}>
            <Text>ADD TO CART</Text>
          </Button>
            </View>
          
          
          </View>
        </Modal>



        <Footer>
          <FooterTab style={styles.footerStyle}>
            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Home', {
                  data: this.state.retailerData,
                });
              }}>
              <Icon name="home" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Home</Label>
            </Button>

            <Button
              transparent
              onPress={() => {
                this.props.navigation.navigate('Categories', {
                  data: this.state.retailerData,
                });
              }}>
              <Icon name="grid" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Categories</Label>
            </Button>

            <Button
              transparent
              badge
              vertical
              onPress={() => {
                this.props.navigation.navigate('Cart', {
                  data: this.state.retailerData,
                });
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
                this.props.navigation.navigate('Account', {
                  data: this.state.retailerData,
                });
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
  fullBtnStyle:{
    backgroundColor: '#ffab03',
    borderRadius:10,
    marginBottom:20,
  },
  modalView: {
    marginTop:10,
    height:"100%",
    width:'100%',
    backgroundColor: "white",
    borderRadius: 10,
    padding:10,
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
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
    width: 150,
    justifyContent: 'space-between',
  },
  allStyle: {
    borderRadius: 5,
    height: 250,
    width: 150,
    justifyContent: 'space-between',
  },
  imageStyle: {
    height: 150,
    minWidth: 150,
  },
  imageModalStyle: {
    marginLeft:10,
    marginRight:10,
    height: 200,
    width: '100%',
    borderRadius:10,
    
  },
});
