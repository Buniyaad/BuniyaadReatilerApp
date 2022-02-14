import * as React from 'react';
import {StyleSheet, Image, FlatList,TouchableOpacity} from 'react-native';
import {
  Badge,
  Body,
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
  Card,
  CardItem,
} from 'native-base';
import Icon from 'react-native-ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class Account extends React.Component {
  state = {
    data: [],
    retailerData:'',
  };

  orderHistoryItemsComponent = itemData => (
    <TouchableOpacity onPress={()=>alert("coming soon")}>
      <Card>
      
        <Text>order id: {itemData.item._id}</Text>
        <Text>date: {itemData.item.date}</Text>
        <Text>status: {itemData.item.status}</Text>
      </Card>
    </TouchableOpacity>
  );

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getOrderHistory()
      console.log("hello")
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",jsonValue)
      
    } catch(e) {
      // error reading value
    }
  }

    //get order history
    getOrderHistory() {
      fetch(`https://api.buniyaad.pk/orders/history/${this.state.retailerData.checkUser._id}`, {
        headers: {
          token: `bearer ${this.state.retailerData.token}`,
        },
      })
        .then(response => response.json())
        .then(res => {
          this.setState({data: res.data});
          //console.log(JSON.stringify(res.data));
        });
    }

  componentDidMount(){
    this.getData();
   ;
    
  }

  render() {
    
    return (
      <Container style={styles.containerStyle}>
       
  
          {this.state.retailerData != '' && (
           <FlatList
          ListHeaderComponent={<>
                
            <Card>
            <CardItem header>
              <Text>Retailer: </Text>
            </CardItem>
            <Text>Shop: {this.state.retailerData.checkUser.ShopName}</Text>
            <Text>Retailer Name: {this.state.retailerData.checkUser.Name}</Text>
            <Text>Address: {this.state.retailerData.checkUser.ShopAddress}</Text>
          </Card>
          
         
           </>}
           data={this.state.data}
           renderItem={item => this.orderHistoryItemsComponent(item)}
        />
        )}
 
          
     

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
                this.props.navigation.navigate('Categories');
              }}>
              <Icon name="grid" style={{color: '#737070'}} />
              <Label style={{color: '#737070'}}>Categories</Label>
            </Button>

            <Button
              transparent
              badge
              vertical
              onPress={() => {
                this.props.navigation.navigate('Cart');
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
  phoneInputStyle: {
    marginTop: 20,
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 15,
  },
 
});
