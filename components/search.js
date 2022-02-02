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
  Container,
  Card,
  Item,
  Button,
  Header,
  Footer,
  FooterTab,
  Text,
  Input,
  Label,
  Spinner,
} from 'native-base';
import Icon from 'react-native-ionicons';

export default class Login extends React.Component {
  state = {
    search: this.props.route.params.search,
    retailerData: this.props.route.params.data,
    data: [],
    showSpinner:true,
  };

  allProductsItemComponent = itemData => (
    <TouchableOpacity>
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

  
 // get search results
  getProductsBySearch() {
    fetch(`https://api.buniyaad.pk/products/withDetail/${this.state.search}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        this.setState({data: res.data, showSpinner:false});
      });
  }

  backAction = () => {
    this.props.navigation.pop();
    return true;
  };

  componentDidMount() {
    this.getProductsBySearch();
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
          ListHeaderComponent={
            <>
              {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
              <Text style={styles.labelStyle}>
                found {this.state.data.length} results for " {this.state.search}{' '}
                "
              </Text>
            </>
          }
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
});
