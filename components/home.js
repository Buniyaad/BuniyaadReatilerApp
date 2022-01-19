import * as React from 'react';
import { StyleSheet,FlatList,TouchableOpacity,Image,View} from 'react-native';
import {Badge,Body,Container,Content,CardItem,Card,Item,Button,Header,
Footer,FooterTab,Tabs,Tab,Text,Input,Label,Left,List,ListItem,Right} from 'native-base';
import Icon from 'react-native-ionicons'

export default class Login extends React.Component{
    state={
        search:'',
        data:[
            {
              id: '1',
              title: 'First Item',
              desc:'Description',
              
            },
            {
              id: '2',
              title: 'Second Item',
              desc:'Description',
              
            },
            {
              id: '3',
              title: 'Third Item',
              desc:'Description',
              
            },
            {
                id: '4',
                title: 'fourth Item',
                desc:'Description',
                
              },
              {
                id: '5',
                title: 'fifth Item',
                desc:'Description',
                
              },
              {
                id: '6',
                title: 'sixth Item',
                desc:'Description',
                
              },  
          ]
    }

    renderItemComponent = (itemData) => 
    <TouchableOpacity> 
        <Card style={styles.cardStyle}>
        <Text>{itemData.item.title}</Text>
        <Text>{itemData.item.id}</Text> 
        <Image source={require('./assets/logo.png')}/>
        <Text>{itemData.item.desc}</Text>
        </Card>  
       
    </TouchableOpacity>

    render(){
        return(
        <Container style={styles.containerStyle}>

            <Header style={styles.headerStyle}>
            <Left>
            <Image source={require('./assets/logosmall.png')}/>
            </Left>
            
            
            <Right>
                <Icon name='notifications'/>
            </Right>
            
            </Header>
            
            <View style={styles.searchViewStyle}>
                 <Item rounded style={styles.searchInputStyle}>
                 <Label>
                  <Icon name='search'/>
                 </Label>
                 <Input placeholder='search'
                 onChangeText={(text)=>this.setState({search:text})}
                 onSubmitEditing={()=>alert(this.state.search)} />
                </Item>
                 </View>
           
             <Content>


                <Card style={styles.bannerStyle}> 
                 <Image source={require('./assets/logo.png')}/>
                </Card>
                 
                <View>
                <Text style={styles.labelStyle}> AAP KEH LIYE</Text>
                 <FlatList
                 horizontal={true}
                 data={this.state.data}
                 renderItem={item=>this.renderItemComponent(item)}/>
                </View>

                <View>
                 <Text style={styles.labelStyle}> SAB SAMAAN</Text>
                 <FlatList
                 data={this.state.data}
                 numColumns={2}
                 renderItem={item=>this.renderItemComponent(item)}/>
                </View>

            </Content>

           

            <Footer >
                <FooterTab style={styles.footerStyle}>
                 <Button transparent
                  onPress={()=>{this.props.navigation.navigate('Home')}}>
                     <Icon name='home' style={{color:'#737070'}}/>
                     <Label style={{color:'#737070'}}>Home</Label>
                 </Button>

                 <Button transparent
                 onPress={()=>{this.props.navigation.navigate('Categories')}}>
                     <Icon name='grid' style={{color:'#737070'}}/>
                     <Label style={{color:'#737070'}}>Categories</Label>
                 </Button>

                 <Button transparent badge vertical
                 onPress={()=>{this.props.navigation.navigate('Cart')}}>
                     <Badge warning>
                         <Text>1</Text>
                     </Badge>
                     <Icon name='cart' style={{color:'#737070'}}/>
                     <Label style={{color:'#737070'}}>Cart</Label>
                 </Button>

                 <Button transparent
                 onPress={()=>{this.props.navigation.navigate('Account')}}>
                     <Icon name='person' style={{color:'#737070'}}/>
                     <Label style={{color:'#737070'}}>Account</Label>
                 </Button>
                 
                </FooterTab>
            </Footer>
        </Container>
    )}
}

const styles = StyleSheet.create({
 containerStyle:{
    justifyContent:'center',   

 },
 headerStyle:{
    backgroundColor:'#FAB624',
 },
 footerStyle:{
     backgroundColor:'white'
 },
 btnStyle:{
     marginTop:20,
     alignSelf:'center',
     backgroundColor:'#ffab03'
 },
 searchInputStyle:{
    alignSelf:'center',
    margin:10,
    backgroundColor:'white',
    borderRadius:15,
   
 },
 searchViewStyle:{
    backgroundColor:'#FAB624' , 
 },
 bannerStyle:{
     marginTop:75,
     alignSelf:'center',
     height:100,
     width:300,
 },
 labelStyle:{
    marginTop:50,
    fontWeight:'bold',
    color:'#737070',
},
cardStyle:{
   
}

});