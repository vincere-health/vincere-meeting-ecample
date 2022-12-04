/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    position: 'absolute',
  },
  navigationContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: '10%',
    paddingRight: 20,
    paddingLeft: 20,
    alignItems: 'center',
    zIndex : 101, 
    elevation: 11,
    flex : 0,
  },
  video: {
    width: '100%',
    height: '50%',
    margin: '1%',
  },
  title: {
    fontSize: 30,
    fontWeight: '700'
  },
  subtitle: {
    marginBottom: 25,
    marginTop: 10,
    color: 'white' 
  },
  overlayTopView:{
    position: 'absolute', 
    top: 0, left: 0, 
    width: '100%', 
    height: '100%', 
    justifyContent: 'space-evenly'
  },
  videoContainer: {
    // // that use GLSurfaceView (We use this internally), the entire screen will
    width: '100%',
    overflow: 'visible',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  fullVideo: {
    width: '100%',
    //aspectRatio: 8/16,
    zIndex: -1,
    elevation:-1, 
    position: 'absolute',
    top: -50 ,  
    height: '115%',
  },
  smallVideo:{
    width: 100,
    height: 150,
    position: 'absolute',
    top: 110, 
    right: 15,
    zIndex:100,
    elevation:10, 
  },
  tinyVideo:{
    width: 100,
    height: 150,
    position: 'absolute',
    top: 100, 
    right: 15,
    zIndex:100,
    elevation:10, 
  },
  screenShare: {
    width: '90%',
    margin: '1%',
    aspectRatio: 16 / 9,
  },
  attendeeList: {
    flex: 1,
    width: '80%'
  },
  attendeeContainer: {
    fontSize: 20,
    margin: 5,
    padding: 5,
    height: 30,
    backgroundColor: '#eee',
    justifyContent: 'space-between', 
    flexDirection: 'row',  
  },
  attendeeMuteImage: {
    resizeMode: 'contain',
    width: 20,
    height: 20
  },
  inputBox: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    margin: 5,
    width: '50%',
    padding: 10,
    color: 'black'
  },
  meetingButton: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
    backgroundColor: 'yellow'
  },
  button:{
    backgroundColor: 'white',
    height: 80,
    width: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // shadow
    elevation:11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5, 
  },
  meetingTitle:{
    fontSize: 22, 
    color: 'white',
    elevation:5,
    shadowColor: '#001',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5, 
    alignSelf: 'center',
  },
  backArrow:{
    color: 'white',
    elevation:5,
    shadowColor: '#001',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5, 
    justifyContent: 'flex-start',
  },
  audioCallContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    elevation: 1
  }
});

export default styles;
