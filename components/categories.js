import * as React from 'react';
import {
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  View,
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

export default class Categories extends React.Component {
  state = {
    data: [],
    retailerData:'',
    showSpinner:true,
  };

  async getData(){
    try {
      const jsonValue = await AsyncStorage.getItem('test')
      this.setState({retailerData:JSON.parse(jsonValue)})
      this.getCategories();
      //return jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log("this is async data: ",JSON.parse(jsonValue))
      
    } catch(e) {
      // error reading value
    }
  }

  categoryCardComponent = itemData => (
    <TouchableOpacity onPress={() => this.getCategoryById(itemData.item._id)}>
      <Card style={styles.categoryCardStyle}>
        <Image
          style={styles.imageStyle}
          source={{uri: itemData.item.CategoryImage}}
        />
        <Text
          style={{
            color: '#FAB624',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: 25,
          }}>
          {itemData.item.Name}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  //get all category names and images
  getCategories(){
    fetch('https://api.buniyaad.pk/categories/get', {
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
    fetch(`https://api.buniyaad.pk/categories/getById/${id}`, {
      headers: {
        token: `bearer ${this.state.retailerData.token}`,
      },
    })
      .then(response => response.json())
      .then(res => {
        console.log(JSON.stringify(res.data));
      });
  }

  componentDidMount() {
    this.getData()


  }

  render() {
    return (
      <Container style={styles.containerStyle}>
        <FlatList
         
          ListHeaderComponent={
            <>
              <Text style={styles.labelStyle}>Categories</Text>
              {this.state.showSpinner && (
                <Spinner color={'black'}/>
               )}
            </>
          }
          data={this.state.data}
          renderItem={item => this.categoryCardComponent(item)}
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
  labelStyle: {
    marginTop: 50,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#737070',
    alignSelf: 'center',
    fontSize: 30,
  },
  categoryCardStyle: {
    marginLeft: 20,
    borderRadius: 5,
    height: 200,
    marginRight:20,
    marginRight:20,
    justifyContent: 'space-between',
  },
  imageStyle: {
    height: 150,
    
  },
});
