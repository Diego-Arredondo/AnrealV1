import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { DoubleCameraScreen } from '../screens/DoubleCameraScreen';
import { VideoScreen } from '../screens/VideoScreens';
import { PrincipalScreen } from '../screens/PrincipalScreen';



export type RootStackParams = {
    PrincipalScreen: undefined,
    DoubleCameraScreen: undefined,
    VideoScreen: undefined,
}

const Stack = createStackNavigator<RootStackParams>();

export const StackNavigator = () => {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown:false,     
    }}>
      <Stack.Screen name="PrincipalScreen" component={PrincipalScreen}/>
      <Stack.Screen name="DoubleCameraScreen" component={DoubleCameraScreen} />
      <Stack.Screen name="VideoScreen"  component={VideoScreen} />
    </Stack.Navigator>
  );
}