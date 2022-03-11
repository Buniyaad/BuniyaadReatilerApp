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
          style={{
            color: 'black',
            backgroundColor:'#FFC000',
            fontWeight: 'bold',
            textAlign: 'center',
            textAlignVertical:'center',
            fontSize: 20,
            height:50,
            borderBottomRightRadius:10,
            borderBottomLeftRadius:10
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
          style={{
            color: 'black',
            backgroundColor:'#FFC000',
            fontWeight: 'bold',
            textAlign: 'center',
            textAlignVertical:'center',
            fontSize: 20,
            height:50,
            borderBottomRightRadius:10,
            borderBottomLeftRadius:10
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

    //get all brand names and images
    getBrands(){
      fetch('https://api.buniyaad.pk/brands/get', {
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
       <ScrollView>

        <Text style={styles.labelStyle}>Categories</Text>
           {this.state.showSpinner && (
             <Spinner color={'black'}/>
            )}

      <Text style={styles.itemLabelStyle}>SAB CATEGORIES</Text>
      
       <ScrollView
       horizontal
       showsVerticalScrollIndicator={false}
       showsHorizontalScrollIndicator={false}
       contentContainerStyle={{ paddingVertical: 20 }}>
        {this.state.data.length>0 &&(
       <FlatList
         scrollEnabled={false}
         contentContainerStyle={{
           alignSelf: 'flex-start',
         }}
         numColumns={ Math.ceil(this.state.data.length / 2)}
         showsVerticalScrollIndicator={false}
         showsHorizontalScrollIndicator={false}
         data={this.state.data}
         renderItem={item => this.categoryCardComponent(item)}
       />
       )}
     </ScrollView>

     <Text style={styles.itemLabelStyle}>SAB BRANDS</Text>

     <ScrollView
       horizontal
       showsVerticalScrollIndicator={false}
       showsHorizontalScrollIndicator={false}
       contentContainerStyle={{ paddingVertical: 20 }}>
        {this.state.brandsData.length>0 &&(
       <FlatList
         scrollEnabled={false}
         contentContainerStyle={{
           alignSelf: 'flex-start',
         }}
         numColumns={ Math.ceil(this.state.brandsData.length / 2)}
         showsVerticalScrollIndicator={false}
         showsHorizontalScrollIndicator={false}
         data={this.state.brandsData}
         renderItem={item => this.brandCardComponent(item)}
       />
       )}
     </ScrollView>

     </ScrollView>
 
   

        {/*<FlatList
          columnWrapperStyle={{justifyContent: 'space-evenly'}}
          numColumns={3}
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
        />*/}

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
   
    marginLeft: 10,
    borderRadius: 10,
    height: 150,
    width: 150,


   
  },
  imageStyle: {
    height: 100,
    borderTopRightRadius:10,
    borderTopLeftRadius:10,
    
  },
});
