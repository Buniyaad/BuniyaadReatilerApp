import * as React from 'react';
import { StyleSheet,Image} from 'react-native';
import {Container,Form,Content,Text,Item,Input,Label,Button} from 'native-base';



export default class Login extends React.Component{
    state={
      phoneno:'',
      btnShow:false,
    }

    handle_phoneno(text){
        this.setState({phoneno:text});
        if(text.length===10){
            this.setState({btnShow:true})
        }
        else{
            this.setState({btnShow:false})
        }
        
    }

    handle_loginbtn(){
        this.props.navigation.navigate("Home");
    }

    render(){
        return(
        <Container style={styles.containerStyle}>
            <Content>

            <Image style={styles.logoStyle} source={require('./assets/logo.png')}/>
                <Text style={styles.txt}>Mobile number darj karein!</Text>
                
                <Item style={styles.phoneInputStyle} inlineLabel>
                    <Label style={styles.inputlabelStyle}> +92</Label>
                    <Input placeholder='Enter phone number'
                    style={{marginLeft:10}}
                    keyboardType='numeric'
                    maxLength={10}
                    onChangeText={(text)=>{this.handle_phoneno(text)}}/>
                </Item>
                
                {this.state.btnShow&& <Button style={styles.btnStyle} 
                onPress={()=>this.handle_loginbtn()}>
                    <Text style={{color:'#FAB624',fontWeight:'bold',fontSize:20}}>Next</Text>
                </Button>}

                
            </Content>
        </Container>
    )}
}

const styles = StyleSheet.create({
 containerStyle:{
    justifyContent:'center',
    backgroundColor:'#FAB624',   

 },
 logoStyle:{
     alignSelf:'center',
     marginTop:100,
     
 },
 txt:{
    marginTop:200,
    alignSelf:'center',
    fontWeight:'bold',
    color:'#303030'

 },
 phoneInputStyle:{
    marginTop:20, 
    alignSelf:'center',
    marginLeft:20,
    marginRight:20,
    backgroundColor:'white',
    borderRadius:15
   
 },
 inputlabelStyle:{
   borderRightWidth:1,
   borderRightColor:'#FAB624'
 },
 btnStyle:{
     marginTop:30,
     alignSelf:'center',
     backgroundColor:'white',
     paddingHorizontal:20,
     borderRadius:15,
 }
});