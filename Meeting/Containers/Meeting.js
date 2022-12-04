/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import styles from '../Style.js';
import { NativeFunction, getSDKEventEmitter, MobileSDKEvent, MeetingError } from '../Bridge/Bridge.js';
import { RNVideoRenderView } from '../Components/RNVideoRenderView';
import Icon from 'react-native-vector-icons/Ionicons';
import RNSwitchAudioOutput from 'react-native-switch-audio-output';
import KeepAwake from 'react-native-keep-awake';

// Maps attendee Id to attendee Name
const attendeeNameMap = {};

export class Meeting extends React.Component {

  constructor(props) {
    super();
    this.state = {
      attendees: [],
      videoTiles: [],
      mutedAttendee: [],
      selfVideoEnabled: false,
      meetingTitle: '',
      screenShareTile: null,
      selfVideoTileId: null,
      showLoader: false,
      isWaiting: true,
      isSpeaker: false,
    };
  }

  componentDidMount() {
    /**
     * Attendee Join and Leave handler
     * 
     */
    this.onAttendeesJoinSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAttendeesJoin, ({ attendeeId, externalUserId }) => {
      if (!(attendeeId in attendeeNameMap)) {
        // The externalUserId will be a format such as c19587e7#Alice
        attendeeNameMap[attendeeId] = externalUserId.split('#')[1];
        //console.log('Joining Attendee Id: ',attendeeId,'externalUserId: ',externalUserId, this.state.attendees.length)
      }
      this.setState((oldState) => ({ 
        ...oldState, 
        attendees: oldState.attendees.concat([attendeeId]) 
      }),() =>{
        (this.state.attendees.length > 1) ?
          this.setState({isWaiting: false })
        :
          this.setState({isWaiting: true })
        //console.log('Joining Attendee Id: ',attendeeId,'externalUserId: ',externalUserId, this.state.attendees.length)
      });
    });

    this.onAttendeesLeaveSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAttendeesLeave, ({ attendeeId }) => {
      //console.log('Leaving Attendee Id: ',attendeeId)
      this.setState((oldState) => ({ 
        ...oldState,
        attendees: oldState.attendees.filter((attendeeToCompare => attendeeId != attendeeToCompare)) 
      }),()=>{
        (this.state.attendees.length > 1) ? 
          this.setState({isWaiting: false })
        :
          this.setState({isWaiting: true })
      });
    });

    /**
     * Attendee Mute & Unmute handler
     */
    this.onAttendeesMuteSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAttendeesMute, attendeeId => {
      this.setState((oldState) => ({ 
        ...oldState, 
        mutedAttendee: oldState.mutedAttendee.concat([attendeeId]) 
      }));
    });

    this.onAttendeesUnmuteSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAttendeesUnmute, attendeeId => {
      this.setState((oldState) => ({ 
        ...oldState,
        mutedAttendee: oldState.mutedAttendee.filter((attendeeToCompare => attendeeId != attendeeToCompare)) 
      }));
    });

    /**
     * Video tile Add & Remove Handler
     */
    this.onAddVideoTileSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAddVideoTile, (tileState) => {
      if (tileState.isScreenShare) {
        this.setState(oldState => ({ 
          ...oldState, 
          screenShareTile: tileState.tileId
        }));
      } else {
        // local means your own
        this.setState(oldState => ({ 
          ...oldState, 
          videoTiles: [...oldState.videoTiles, tileState.tileId], // append new stuff
          selfVideoEnabled: tileState.isLocal ? true : oldState.selfVideoEnabled,
          selfVideoTileId: (tileState.isLocal) ? tileState.tileId : null
        }));
      }
    });

    this.onRemoveVideoTileSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnRemoveVideoTile, (tileState) => {
      if (tileState.isScreenShare) {
        this.setState(oldState => ({ 
          ...oldState, 
          screenShareTile: null
        }));
      } else {
        this.setState(oldState => ({ 
          ...oldState, 
          videoTiles: oldState.videoTiles.filter(tileIdToCompare => tileIdToCompare != tileState.tileId),
          selfVideoEnabled: tileState.isLocal ? false : oldState.selfVideoEnabled
        }));
      }

    });

    /**
     * General Error handler
     */
    this.onErrorSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnError, (errorType) => {
      switch(errorType) {
        case MeetingError.OnMaximumConcurrentVideoReached:
          Alert.alert('Failed to enable video', 'maximum number of concurrent videos reached!');
          break;
        default:
          Alert.alert('Error', errorType);
          break;
      }
    });

    /**
     *  Swipe remove audio and video
     */ 
    this.props.navigation.addListener('didBlur', (e) => {
      NativeFunction.stopMeeting()
    })

    //console.log(this.props.navigation)
    console.log('this.state.videoTiles: ',this.state.videoTiles)
  }

  componentWillUnmount() {
    if (this.onAttendeesJoinSubscription) {
      this.onAttendeesJoinSubscription.remove();
    }
    if (this.onAttendeesLeaveSubscription) {
      this.onAttendeesLeaveSubscription.remove();
    }
    if (this.onAttendeesMuteSubscription) {
      this.onAttendeesMuteSubscription.remove();
    }
    if (this.onAttendeesUnmuteSubscription) {
      this.onAttendeesUnmuteSubscription.remove();
    }
    if (this.onAddVideoTileSubscription) {
      this.onAddVideoTileSubscription.remove();
    }
    if (this.onRemoveVideoTileSubscription) {
      this.onRemoveVideoTileSubscription.remove();
    }
    if (this.onErrorSubscription) {
      this.onErrorSubscription.remove();
    }
  }

  _switchAudioMode = () => {
    if(!this.state.isSpeaker){
      RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER)
      this.setState({
        isSpeaker : !this.state.isSpeaker
      })
    }else{
      RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_HEADPHONE)
      this.setState({
        isSpeaker : !this.state.isSpeaker
      })
    }
  }

  renderButton = (props) =>{
    return(
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.button,
        {backgroundColor: this.state.isSpeaker ? 'white' : 'gray'}
      ]} onPress={() => this._switchAudioMode()}>
        <Icon name={'volume-high-outline'} size={32}/> 
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button,
        {backgroundColor: props.currentMuted ? 'white' : 'gray'}
      ]} onPress={() => NativeFunction.setMute(!props.currentMuted) }>
        <Icon name={'mic-off-outline'} size={32}/> 
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button,{backgroundColor: 'red'}]} onPress={() => {
        this.setState(oldState => ({ 
          ...oldState, 
          isWaiting: true
        }));
        NativeFunction.stopMeeting()
        }
      }>
        <Icon name={'call'} size={32} color={'white'}/> 
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button,
        {backgroundColor: this.state.selfVideoEnabled ? 'white' : 'gray'}
      ]} onPress={() =>  NativeFunction.setCameraOn(!this.state.selfVideoEnabled)}>
        <Icon name={'videocam'} size={32}/> 
      </TouchableOpacity>
    </View>
    )
  }

  renderHeader = (props) => {
    return(
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={{
            flex: 1/10,
          }}
          onPress = {() => { 
            this.setState(oldState => ({ 
              ...oldState, 
              isWaiting: true
            }));
            NativeFunction.stopMeeting();
            //
          }}
          >
          <Icon name={'arrow-back'} size={28} style={styles.backArrow}/>
        </TouchableOpacity>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={styles.meetingTitle}> 
            Vincere Connect 
          </Text>
        </View>
      </View>
    )
  }

  renderAudioCall = (props) =>{
    return(
      <View style={styles.audioCallContainer}>
        <Text style={styles.subtitle}>No one is sharing video at this moment</Text>
      </View>
    )
  }

  loader = (props) =>{
    return(
      <ActivityIndicator
      /> 
    )
  }

  loaderText = () =>{
    return(
        <AnimatedLoader
        visible={this.state.isWaiting}
        source={loader}
        animationStyle={{ width: 100, height: 100}}
        speed={1}
        > 
          <Text style={
            {
              color:'white', 
              justifyContent: 'center', 
              alignContent: 'center',
              fontSize: 16,
            }
          }> Waiting for your coach to join </Text> 
        </AnimatedLoader>
    )
  }

  render() {
    const currentMuted = this.state.mutedAttendee.includes(this.props.selfAttendeeId);
    return (
      <React.Fragment>
        <SafeAreaView style={{ flex:0, backgroundColor: 'red' }} />
        <KeepAwake />
        <SafeAreaView style={[styles.container, { justifyContent: 'flex-start' }]}>
          {this.loader()}
          {(this.state.isWaiting) && this.loaderText()}
          {this.renderHeader()}
          {/* Video screen  */}
          { (!this.state.isWaiting) && 
            <>
              <View style={styles.videoContainer}>
                {
                  this.state.videoTiles.length > 0 ? this.state.videoTiles.map(tileId => 
                    <RNVideoRenderView style={((tileId === this.state.selfVideoTileId) && this.state.videoTiles.length > 1) ? styles.smallVideo : styles.fullVideo} key={tileId} tileId={tileId} isOnTop={tileId === this.state.selfVideoTileId} />
                  ) : this.renderAudioCall()
                }
              </View>
              <View key={'parentId'} style={[styles.tinyVideo]} >
                {this.state.videoTiles.map((tileId,index) => 
                    (tileId === this.state.selfVideoTileId) && <RNVideoRenderView style={{ position:'absolute', width: 100, height: 130}} key={index} id={'childId'} tileId={tileId} isOnTop={tileId === this.state.selfVideoTileId} />
                  )
                }
              </View>
            </>
          }
          {
            !!this.state.screenShareTile &&    
            <React.Fragment>
              <Text style={styles.title}>Screen Share</Text>
              <View style={styles.videoContainer}>
                <RNVideoRenderView style={styles.screenShare} key={this.state.screenShareTile} tileId={this.state.screenShareTile} />
              </View>
            </React.Fragment>
          }
          
          {!this.state.isWaiting && this.renderButton({currentMuted})}
        </SafeAreaView>
      </React.Fragment>
    );
  }
}
