import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View, NativeModules, Dimensions, StyleSheet, Modal, Image } from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import Video from 'react-native-video';


interface Props extends StackScreenProps<any,any>{};

export const VideoScreen = ({route, navigation}: Props) => {

  const [angulo, setAngulo] = useState(0.0)
  const [duration, setDuration] = useState(0.0)
  // const [source1, setSource1] = useState(require('/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/output.mp4'))
  const [source, setSource] = useState(require('/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/goku.mp4'))
  // const [source2, setSource2] = useState(require('/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/goku.mp4'))

  const params = route.params;
  useEffect(() => {

    if (video.current && video2.current){
      

      const r = params!.angle
      console.log("El angulo ingresado es: " + params!.angle)
      // console.log("Elduracion es: " + duration)
      // setAngulo( (r/90) * duration) //es para saber a qué frame corresponde
      // console.log("El porcentaje es: " + (params!.angle/90))
      // console.log("El angulo ingresado es: " + (r/90) * duration)
      video.current.seek(0)
      video2.current.seek(0)

      // if (params!.angle<40.0)  {
      //     console.log("video 1 jiji: " + params!.angle)
      //     setSource(source1)
      // } else {
      //     console.log("video 2 jiji: " + params!.angle)
      //     setSource(source2)
      // }

     
    }
    setpause(params!.pause)
  }, [params])

  const video = React.useRef(null);
  const video2 = React.useRef(null);

  const [visibility, setVisivility] = React.useState(true);
  const [pause, setpause] = useState(true)
  const [holi, setholi] = useState(true)



  return ( 
    <View style = {styles.container}>
      <Modal
      animationType='none'
      transparent={true}
      visible = {visibility}>

        <Image
        source={require('/home/diegodinho/Documentos/Escritorio/Magister/Desarrollo App/React Native/Principal/src/media/VR.png')}
        style={styles.VRComponent}>
        </Image>
      
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
            onLoad = {(data) => {
              setDuration(data.duration)
            }}
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
              navigation.navigate(
                'DoubleCameraScreen',
                {
                  native: "go"
                }
              )
            }}
        />

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
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