'use strict';

var {
  StyleSheet,
  Image,
  Text,
  View,
} = React;

var FBLogin = require('react-native-facebook-login');
var FBLoginMock = require('./facebook/FBLoginMock.js');
var FBLoginManager = require('NativeModules').FBLoginManager;

var FB_PHOTO_WIDTH = 200;

var Login = React.createClass({
  getInitialState: function(){
    return {
      user: null,
    };
  },

  componentWillMount: function(){
    this.updateView();
  },

  updateView: function(){
    var _this = this;
    FBLoginManager.getCredentials(function(error, credentials){
      if (!error) {
        _this.setState({ user : credentials });
      } else {
        _this.setState({ user : null });
      }
    });
  },

  render: function() {
    var _this = this;
    var user = this.state.user;

    return (
      <View style={styles.loginContainer}>

        { user && <Photo user={user} /> }
        { user && <Info user={user} /> }

        <FBLoginMock style={{ marginBottom: 10, }}
          onPress={function(){
            console.log("FBLoginMock clicked.");
          }}
          onLogin={function(){
            console.log("FBLoginMock logged in!");
          }}
          onLogout={function(){
            console.log("FBLoginMock logged out.");
          }}
        />

        <FBLogin style={{ marginBottom: 10, }}
          permissions={["email","user_friends"]}
          onLogin={function(){
            console.log("Logged in!");
            _this.updateView();
          }}
          onLogout={function(){
            console.log("Logged out.");
            _this.updateView();
          }}
          onError={function(){
            console.log("ERROR");
          }}
          onCancel={function(){
            console.log("User cancelled.");
          }}
          onPermissionsMissing={function(){
            console.log("Check permissions!");
          }}
          onLoginNotFound={function(){
            console.log("No user logged in.");
          }}
        />

        <Text>{ user ? user.token : "N/A" }</Text>
      </View>
    );
  }
});

var Photo = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired,
  },

  getInitialState: function(){
    return {
      photo: null,
    };
  },

  componentWillMount: function(){
    var _this = this;
    var user = this.props.user;
    var api = `https://graph.facebook.com/v2.3/${user.userId}/picture?width=${FB_PHOTO_WIDTH}&redirect=false&access_token=${user.token}`;

    fetch(api)
      .then((response) => response.json())
      .then((responseData) => {
        _this.setState({
          photo : {
            url : responseData.data.url,
            height: responseData.data.height,
            width: responseData.data.width,
          },
        });
      })
      .done();
  },

  render: function(){
    var photo = this.state.photo;

    return (
      <View style={styles.bottomBump}>

        <Image
          style={photo &&
            {
              height: photo.height,
              width: photo.width,
            }
          }
          source={{uri: photo && photo.url}}
        />
      </View>
    );
  }
});

var Info = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired,
  },

  getInitialState: function(){
    return {
      info: null,
    };
  },

  componentWillMount: function(){
    var _this = this;
    var user = this.props.user;
    var api = `https://graph.facebook.com/v2.3/${user.userId}?fields=name,email&access_token=${user.token}`;

    fetch(api)
      .then((response) => response.json())
      .then((responseData) => {
        _this.setState({
          info : {
            name : responseData.name,
            email: responseData.email,
          },
        });
      })
      .done();
  },

  render: function(){
    var info = this.state.info;

    return (
      <View style={styles.bottomBump}>
        <Text>{ info && this.props.user.userId }</Text>
        <Text>{ info && info.name }</Text>
        <Text>{ info && info.email }</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  loginContainer: {
    marginTop: 150,

    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBump: {
    marginBottom: 15,
  },
});

module.exports = Login;
