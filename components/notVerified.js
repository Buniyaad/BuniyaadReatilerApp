import * as React from 'react';
import {StyleSheet, Image} from 'react-native';
import {
  Container,
  Content,
  Text,
  Button,
} from 'native-base';

export default class NotVerified extends React.Component{
    render(){return(
      <Container style={styles.containerStyle}>
        <Content>
              
         <Text style={styles.txt} >Unfortunatley You cannot access this page until admin verifies your account</Text>
         
         <Button
              style={styles.btnStyle}
              onPress={() => this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
           })}>
              <Text
                style={{color: '#FAB624', fontWeight: 'bold', fontSize: 20}}>
                Back to Login
              </Text>
            </Button>
        
        </Content>
      </Container>
        
    )}
    
}

const styles = StyleSheet.create({
  containerStyle: {
    justifyContent: 'center',
    backgroundColor: '#FAB624',
  },
  logoStyle: {
    alignSelf: 'center',
    marginTop: 100,
  },
  txt: {
    marginTop: 200,
    alignSelf: 'center',
    textAlign:'center',
    fontWeight: 'bold',
    color: '#303030',
  },
  phoneInputStyle: {
    marginTop: 20,
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  inputlabelStyle: {
    borderRightWidth: 1,
    borderRightColor: '#FAB624',
  },
  btnStyle: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderRadius: 15,
  },
});