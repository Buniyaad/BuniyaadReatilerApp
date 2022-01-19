import * as React from 'react';
import { StyleSheet} from 'react-native';
import {Container,Form,Content,Text,Item,Input,Label,Button} from 'native-base';


export default class Login extends React.Component{
    state={
      phoneno:'',
      btnDisabled:false,
    }

    handle_phoneno(text){
        this.setState({phoneno:text});
        if(this.state.phoneno.length===9){
            this.setState({btnDisabled:true})
        }
        else{
            this.setState({btnDisabled:false})
        }
        
    }

    render(){
        return(
        <Container style={styles.containerStyle}>
            <Content>

                <Item style={styles.phoneInputStyle} inlineLabel>
                    <Label>+92</Label>
                    <Input placeholder='Enter phone number'
                    keyboardType='numeric'
                    maxLength={10}
                    onChangeText={(text)=>{this.handle_phoneno(text)}}/>
                </Item>
                
                {this.state.btnDisabled&& <Button style={styles.btnStyle}  rounded>
                    <Text>Login</Text>
                </Button>}

                <Text>{JSON.stringify(this.state)}</Text>
                
            </Content>
        </Container>
    )}
}

const styles = StyleSheet.create({
 containerStyle:{
    justifyContent:'center',

 },
 phoneInputStyle:{
    
    marginTop:300,
    alignSelf:'center',
    marginLeft:20,
    marginRight:20,
   
 },
 btnStyle:{
     marginTop:20,
     alignSelf:'center',
     backgroundColor:'#ffab03'
 }
});