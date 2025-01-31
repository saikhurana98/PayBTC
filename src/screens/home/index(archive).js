import React, { useState } from "react";
import { Alert, RefreshControl, View, Text, SafeAreaView, ScrollView } from "react-native";
import { Button, Overlay } from 'react-native-elements';
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Separators, Buttons, Lists, Header } from "_components";
import Colors from "../../constants/Colors";
import styles from "./styles";
import helpers from "../../helpers";
import services from "../../mock/services.json";

const satoshiToB = 100000000 //100,000,000
const buttonAdd = {
  id: "1",
  fullName: "template",
  avatar: "",
};

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


const Home = ({ navigation }) => {

  const [accountBalance, setAccountBalance] = useState('Loading');
  const [accountDetails, setAccountDetails] = useState(null);
  const [friends, setFriends] = useState(helpers.genFriendsList());
  const [address, setAddress] = useState('');

  // For refresh: 
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  // For overlay: 
  const [visible, setVisible] = useState(false);
  const toggleOverlay = () => {
    setVisible(!visible);
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@address')
      if (value !== null) {
        console.log("val: ", value)
        setAddress(value);
      } else {
        console.log("E<P: ", value)
      }
    } catch (e) {
      Alert.alert("We could not find your address!", "\n Error: ", e);
    }
  }

  // API call to get the address details
  const getDetails = () => {
    fetch(`https://api.blockcypher.com/v1/bcy/test/addrs/${address}`)
      .then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log("TXN: ", data);
        setAccountBalance(data.final_balance);
        setAccountDetails(data);
      })
      .catch((err) => {
        Alert.alert("An error occurred: ", err)
        console.log("Error in getting details: ", err)
      });
  }

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    console.log("ASDSA", address)
    if (!address) { return; }
    // API call to get the address details
    getDetails(); 
  }, [address, refreshing]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <Header.Default
        openDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
      />

      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
        <Overlay isVisible={visible} onBackdropPress={toggleOverlay} >
          <View style={{  "justifyContent": "center","width": 200, "height": 200 }}>
            <Button title="P2PKH" style={styles.overlayButtons, {"marginTop": 1000}} onPress={() => {navigation.navigate("@makeTransaction", {
              currentAddress: address, 
              payeeProp: "BvSQEFWSZt1pFvBckCAArzYxN99GViERNK"
            })}}/>
            {/* <Button title="Multisig" style={styles.overlayButtons}></Button> */}
          </View>
        </Overlay>

        <View style={styles.balanceContainer}>
          <View>
            <Text style={styles.currentAmountValeuText}>{accountBalance / satoshiToB} ฿</Text>
            <Text style={styles.currentAmountLabelText}>Current Balance</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
          <Buttons.Default label="See More" icon="" onPress={() => { navigation.navigate("@details", { accountDetails: accountDetails }) }} />
        </View>

        <Separators.Default label="Send Money" />
        <Lists.FriendsList list={[buttonAdd, ...friends]} onPress={toggleOverlay} />

        <Separators.Default label="Services" />
        <Lists.ServicesList list={services} />
      </ScrollView>
    </SafeAreaView >
  );
};

export default Home;
