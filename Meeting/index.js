/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Meeting } from './Containers/Meeting';
import { getSDKEventEmitter, MobileSDKEvent, NativeFunction } from './Bridge/Bridge';

//TODO: call this for deep linking
class MeetingController extends React.Component {

  constructor() {
    super();
    
    this.state = {
      isInMeeting: false,
      isLoading: false,
      meetingTitle: '',
      selfAttendeeId: ''
    }
  }

  createMeetingRequest(meetingId, passcode) {
    // let url = encodeURI('https://apidev.vincerehealth.org/api/core' + "/v3/meeting/joinMeeting?" + `meetingId=${meetingId}&passCode=${passcode}&region=us-east-1`);
    // return fetch(url, { method: 'GET' }).then(j => j.json());
    const SERVER_URL = 'https://apidev.vincerehealth.org/api/core'
    const SERVER_REGION = 'us-east-1'
    let url = encodeURI(SERVER_URL + '/v3/meeting/joinMeeting?' + `meetingId=${meetingId}&passCode=${passcode}&region=${SERVER_REGION}`);
    return fetch(url, { method: 'GET' }).then(j => j.json());
  }

  componentDidMount() {
    const { navigation } = this.props;
    const meetingId = navigation.getParam('meetingId')
    const passcode = navigation.getParam('passcode')
    console.log('App mounting:',meetingId,' ',passcode)
    this.onMeetingStartSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingStart, () => {
      this.setState({ isInMeeting: true, isLoading: false });
    });

    //TODO:- fix the navigation bug
    this.onMeetingEndSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingEnd, () => {
      this.setState({ isInMeeting: false, isLoading: false });
      // this is not getting called
      navigation.pop(); 
      //this.props.navigation.goBack()
    });

    this.onErrorSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnError, (message) => {
      Alert.alert('SDK Error', message,
      [
        {
          text: 'Ok',
          onPress: () => this.props.navigation.goBack(),
        },
      ]
      );
    });
    this.initializeMeetingSession(meetingId, passcode) // meetingId, passcode
  }

  componentWillUnmount() {
    if (this.onMeetingEndSubscription) {
      console.log('removing listeners')
      this.onMeetingEndSubscription.remove();
    }
    if (this.onMeetingStartSubscription) {
      console.log('removing listeners')
      this.onMeetingStartSubscription.remove();
    }
    if (this.onErrorSubscription) {
      console.log('removing listeners')
      this.onErrorSubscription.remove();
    }
  }

  initializeMeetingSession = (meetingName, userName) => {
    this.setState({
      isLoading: true,
    })
    this.createMeetingRequest(meetingName, userName).then(meetingResponse => {
      console.log('meetingResponse: ',JSON.stringify(meetingResponse, null, 4))
      this.setState({
        meetingTitle: meetingName,
        selfAttendeeId: meetingResponse.attendee.AttendeeId
      })
      setTimeout(() => {
        NativeFunction.startMeeting(meetingResponse.meeting, meetingResponse.attendee);
      }, 1000);
    }).catch(error => {
      // console.log('Error11: ',error)
      Alert.alert('Unable to find meeting', `There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired.\n ${error}`,
      [
        {
          text: 'Ok',
          onPress: () => this.props.navigation.goBack(),
        },
      ]
      );
      this.setState({ isLoading: false });
    });
  }

  renderRoute() {
    if (this.state.isInMeeting) {
      // meeting
      return <Meeting meetingTitle={this.state.meetingTitle} selfAttendeeId={this.state.selfAttendeeId} {...this.props} />;
    } else {
      // loading state
      return (
        <ActivityIndicator
        /> 
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <StatusBar/>
        <SafeAreaView style={{ flex:1, backgroundColor: 'black' }}>
          { this.renderRoute() }
        </SafeAreaView>
      </React.Fragment>
    );
  }
}
export default MeetingController;
