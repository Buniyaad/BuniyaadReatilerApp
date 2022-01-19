import * as React from 'react';
import { StyleSheet,Image} from 'react-native';
import {Body,Container,Content,Text,Item,Button,Header,Footer,FooterTab,Tabs,Tab,Input,Label} from 'native-base';
import Icon from 'react-native-ionicons'

export default class Cart extends React.Component{
    render(){return(
        <Container>
            <Content>
             <Text>Cart</Text>
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

                 <Button transparent
                 onPress={()=>{this.props.navigation.navigate('Cart')}}>
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
       backgroundColor:'#FAB624'
    },
    footerStyle:{
        backgroundColor:'white'
    },
    btnStyle:{
        marginTop:20,
        alignSelf:'center',
        backgroundColor:'#ffab03'
    },
    phoneInputStyle:{
       marginTop:20, 
       alignSelf:'center',
       marginLeft:20,
       marginRight:20,
       backgroundColor:'white',
       borderRadius:15
      
    },
   });