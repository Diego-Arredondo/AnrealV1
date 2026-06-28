/*
Ahora todo el código se hace en un solo screen. e utiliza la posicióncomo gatillante del video
*/


import React, { useEffect, useState } from 'react'
import {View, NativeModules, Modal, StyleSheet, Image, Dimensions } from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import { Accelerometer } from 'expo-sensors';
import Video from 'react-native-video';

interface coordinates {
  x: number;
  y: number;
  z: number
}

const DoubleCamera = NativeModules.DiegoCamera

interface Props extends StackScreenProps<any,any>{};

export const PrincipalScreen = ({navigation, route}: Props) => {



  const [angulo, setAngulo] = useState("0")
  const [velocidad, setVelocidad] = useState("0")
  const [counter, setCounter] = useState(0)
  // const [source, setSource] = useState(require('/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/goku.mp4'))
  // Self-serve: if a trajectory was received over the network, play that file; otherwise the bundled one.
  const receivedUri: string | undefined = route?.params?.videoUri;
  const [source, setSource] = useState(receivedUri ? { uri: receivedUri } : require('../media/videos/wena.mp4'))
  const [pause, setpause] = useState(true)
  const video = React.useRef(null);
  const video2 = React.useRef(null);
  const [ckeck, setCkeck] = useState<boolean>(false)
  const [ckeck2, setCkeck2] = useState<boolean>(true)
  const [ckeck3, setCkeck3] = useState<boolean>(false)
  const [serie, setSerie] = useState("3")
  const [switchSerie2, setSwitchSerie2] = useState("0")

  const OpenMyCameraa = async () => {

    const value = await DoubleCamera.openCamera(counter, parseInt(serie), 30);
    setAngulo(value.substr(0,5)) //los primeros 5 dígitos son del angulo
    setSerie(value.substr(-3,1)) //qué serie está
    setCounter(parseInt(value.substr(-2)))
    setSwitchSerie2(value.substr(-4,1))
    
    if (switchSerie2 == "1") {
     console.log("Partiendo el conteo desde cero")
     setCounter(0)
    }
    
    if (value != null){
        setCkeck2(true)
    }
    
  }


  const [data, setData] = useState<coordinates>({
    x: 0,
    y: 0,
    z: 0,
  });

  

  Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
      })
  Accelerometer.setUpdateInterval(16);

  const { x, y, z } = data;
  var arr = [0,0,0,0,0,0,0,0,0,1]

  

  useEffect(() => {
    if (data.z >= 0){
        if (ckeck && ckeck2){

            
            if (video.current && video2.current){
                console.log("Tenemos angulo: " + angulo + " grados, serie: " + serie + " y contador: " + counter)   
                setpause(false)
                setCkeck(false)               
            } 
            // else {
            //     setCkeck(true)
            //     OpenMyCameraa()
            // }
        }
    } else if (data.z < 0 ) {
        if(!ckeck){
            if (video.current && video2.current){
                video.current.seek(0)
                video2.current.seek(0)
                setpause(true)
                setCkeck(true)
            }            
        console.log("OPENNIG CAMERAA")
        OpenMyCameraa()
        }
    }
  }, [degrees(data.x,data.z)])

  return (

    <View style = {styles.container}>
      <Modal
      animationType='none'
      transparent={true}
      visible = {true}>

        <Image
        source={require('../media/VR.png')}
        style={styles.VRComponent}
        />
      
      </Modal>
      
        <Video  
            ref={(ref) => {
                video.current = ref
              }}  
            source={source}                  // the video file
            paused={pause}                  // make it start    
            style={styles.video}  // any style you want
            repeat={false}                   // make it a loop
            resizeMode='stretch'
            muted = {true}
        />

        <Video  
            ref={(ref) => {
              video2.current = ref
            }}  
            source={source}                  // the video file
            paused={pause}                  // make it start    
            style={styles.video2}  // any style you want
            repeat={false}                   // make it a loop
            resizeMode='stretch'
            muted = {true}
            onEnd = {() => {
                if(!ckeck){
                    if (video.current && video2.current){
                        video.current.seek(0)
                        video2.current.seek(0)
                        setpause(true)
                        setCkeck(true)
                        setCkeck2(false)
                        console.log("openning camera")
                        OpenMyCameraa()
                    }            

                }                
            }}
        />

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
    alignItems: 'center',
    backgroundColor: '#000'
  },
  video: {
    //alignSelf: 'center',
    width: 370, //370
    height: 310, //310
    marginTop:65, //65 
    //paddingTop: 10,
    //paddingBottom: 20,
    backgroundColor: 'black',
    transform: [{rotate: '90deg'}],
    zIndex: 2
    
  },
  video2: {
    //alignSelf: 'center',
    width: 370,
    height: 310,
    marginBottom:20, //20
    backgroundColor: 'black',
    transform: [{rotate: '90deg'}],
    zIndex: 3    
  },  
  VRComponent: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    zIndex: 1
  },
});
