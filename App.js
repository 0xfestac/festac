import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import axios from "axios";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [balance, setBalance] = useState(0);

  const API = "http://YOUR_IP:5000/api";

  const register = async () => {
    await axios.post(`${API}/auth/register`, { email, password });
    alert("Registered with $0.99 bonus");
  };

  const login = async () => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    setToken(res.data.token);
  };

  const getBalance = async () => {
    const res = await axios.get(`${API}/wallet/balance`, {
      headers: { authorization: token }
    });
    setBalance(res.data.balance);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>FESTAC Wallet</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Register" onPress={register} />
      <Button title="Login" onPress={login} />
      <Button title="Check Balance" onPress={getBalance} />

      <Text>Balance: ${balance}</Text>
    </View>
  );
      }
