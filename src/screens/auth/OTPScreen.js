import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import { authAPI } from '../../services/api';
import { loginSuccess } from '../../store/slices/authSlice';
import { saveToken, saveUser } from '../../utils/storage';
import { initSocket } from '../../services/socketService';

export default function OTPScreen({ navigation, route }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);
  const dispatch = useDispatch();

  // 60 second countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // OTP input handle karo — auto focus next box
  const handleOTPChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', '6 digit OTP dalein');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otpString);

      if (response.data.isNewUser) {
        // Naya user — profile setup
        navigation.navigate('ProfileSetup', { phone, token: response.data.token });
      } else {
        // Purana user — seedha app mein
        await saveToken(response.data.token);
        await saveUser(response.data.user);
        initSocket(response.data.token);
        dispatch(loginSuccess({ token: response.data.token, user: response.data.user }));
      }
    } catch (error) {
      Alert.alert('Error', 'OTP galat hai ya expire ho gaya');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.sendOTP(phone);
      setTimer(60);
      Alert.alert('Success', 'OTP dobara bhej diya gaya!');
    } catch (error) {
      Alert.alert('Error', 'OTP nahi gaya');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Enter Karein</Text>
      <Text style={styles.subtitle}>
        Aapke <Text style={styles.phone}>{phone}</Text> par bheja gaya
      </Text>

      {/* 6 OTP Input Boxes */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            value={digit}
            onChangeText={text => handleOTPChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      {/* Resend Timer */}
      {timer > 0 ? (
        <Text style={styles.timerText}>Dobara bhejein: {timer}s</Text>
      ) : (
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>OTP Dobara Bhejein</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.disabled]}
        onPress={handleVerify}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.verifyText}>Verify Karein ✓</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1418', padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#8696a0', marginBottom: 40 },
  phone: { color: '#00bfa5', fontWeight: 'bold' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 50, height: 55, borderRadius: 10,
    backgroundColor: '#1c2733', color: '#fff',
    fontSize: 24, fontWeight: 'bold',
    borderWidth: 1, borderColor: '#2a3942',
  },
  otpBoxFilled: { borderColor: '#00bfa5' },
  timerText: { color: '#8696a0', textAlign: 'center', marginBottom: 30 },
  resendText: { color: '#00bfa5', textAlign: 'center', marginBottom: 30, fontSize: 16 },
  verifyButton: { backgroundColor: '#00bfa5', padding: 16, borderRadius: 12, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  verifyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
