/*
Ultimo check fue cambiarle el ratio a la pantalla de la camara. Falta volver a correrlo con runandorid, cambiar la direccion ip del host y 
comentar el ngulo para poder hacer los acmbios. luego adaptar las resoluciones paque queden de pana.
*/


import React, { useEffect, useState } from 'react'
import { Button, Text, TouchableOpacity, View, NativeModules, Modal, StyleSheet } from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import { Accelerometer } from 'expo-sensors';

interface coordinates {
  x: number;
  y: number;
  z: number
}

const DoubleCamera = NativeModules.DiegoCamera

interface Props extends StackScreenProps<any,any>{};

export const DoubleCameraScreen = ({navigation, route}: Props) => {


  const params = route.params;

  const [angulo, setAngulo] = useState("0")
  const [velocidad, setVelocidad] = useState("0")
  

  const OpenMyCameraa = async () => {
    const value = await DoubleCamera.openCamera();
    setAngulo(value.substr(0,5)) //los primeros 5 dígitos son del angulo
    setVelocidad(value.substr(-4)) //los últimos 4 digitos son de la velocidad
    
  }


  const [data, setData] = useState<coordinates>({
    x: 0,
    y: 0,
    z: 0,
  });

  const [ckeck, setCkeck] = useState<boolean>(false)

  Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
      })
  Accelerometer.setUpdateInterval(16);

  const { x, y, z } = data;

  React.useEffect(() => {
    if (data.z >= 0){
        if (ckeck){
          // console.log("Tenemos angulo: " + angulo + " grados y velocidad: " + velocidad + " rad/s")
          navigation.navigate('VideoScreen',{
            angle: angulo, 
            pause:false
          })
          setCkeck(false)
        }
    } else if (data.z < 0 ) {
        if(!ckeck){
        setCkeck(true)
        navigation.navigate('VideoScreen',{
          angle: angulo, 
          pause:true
        })
        OpenMyCameraa()
        }
        // if(params!.native == "go") {
        //   OpenMyCameraa()
        // }
    }
  }, [degrees(data.x,data.z)])

  return (
  <View style={styles.container}>
      <Text style={styles.welcome}>Welcome!</Text>
  </View>
  )
}

function round(n: number) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

function degrees(x:number, z: number) {
  let calculo = ( Math.atan( (x)/( Math.sqrt( Math.pow(x,2) + Math.pow(z,2)) ) ) )*(2*180/Math.PI)
  calculo = -calculo + 90
  return(
    calculo
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
