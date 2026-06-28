import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, NativeModules, NativeEventEmitter } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

const { TcpReceiver } = NativeModules;

interface Props extends StackScreenProps<any, any> {}

// Self-serve entry screen: the phone listens for a video pushed from the PC over TCP.
export const ReceiverScreen = ({ navigation }: Props) => {
  const port: number = TcpReceiver && TcpReceiver.port ? TcpReceiver.port : 8888;

  const [ip, setIp] = useState<string>('…');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'connected' | 'receiving' | 'done' | 'error'>('idle');
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    TcpReceiver.getDeviceIp()
      .then((addr: string) => { if (mounted) setIp(addr); })
      .catch(() => { if (mounted) setIp('not on Wi-Fi'); });

    const emitter = new NativeEventEmitter(TcpReceiver);
    const subs = [
      emitter.addListener('waiting', () => setStatus('waiting')),
      emitter.addListener('connected', () => setStatus('connected')),
      emitter.addListener('progress', (e: any) => { setStatus('receiving'); setPercent(e?.percent ?? 0); }),
      emitter.addListener('error', (e: any) => { setStatus('error'); setError(e?.message ?? 'error'); }),
      emitter.addListener('completed', () => setStatus('done')),
    ];

    return () => {
      mounted = false;
      subs.forEach(s => s.remove());
      if (listeningRef.current) {
        TcpReceiver.stopListening().catch(() => {});
      }
    };
  }, []);

  const startListening = async () => {
    setError(null);
    setPercent(0);
    listeningRef.current = true;
    try {
      const uri: string = await TcpReceiver.startListening(port);
      listeningRef.current = false;
      navigation.replace('PrincipalScreen', { videoUri: uri });
    } catch (e: any) {
      listeningRef.current = false;
      if (e?.code !== 'CANCELLED') {
        setStatus('error');
        setError(e?.message ?? 'Transfer failed');
      }
    }
  };

  const useBundled = () => {
    if (listeningRef.current) { TcpReceiver.stopListening().catch(() => {}); }
    navigation.replace('PrincipalScreen', { videoUri: null });
  };

  const busy = status === 'waiting' || status === 'connected' || status === 'receiving';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AnReal — receive trajectory</Text>

      <Text style={styles.label}>On the PC (same Wi-Fi), run:</Text>
      <Text style={styles.cmd}>python send_video.py {ip} {port}</Text>

      <View style={styles.statusBox}>
        {status === 'idle' && <Text style={styles.status}>Ready.</Text>}
        {status === 'waiting' && <Text style={styles.status}>Waiting for the PC to connect…</Text>}
        {status === 'connected' && <Text style={styles.status}>Connected. Starting transfer…</Text>}
        {status === 'receiving' && <Text style={styles.status}>Receiving… {percent}%</Text>}
        {status === 'done' && <Text style={styles.status}>Done! Loading…</Text>}
        {status === 'error' && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>

      {!busy && (
        <TouchableOpacity style={styles.button} onPress={startListening}>
          <Text style={styles.buttonText}>Start listening</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondary} onPress={useBundled}>
        <Text style={styles.secondaryText}>Use bundled video instead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 6,
  },
  cmd: {
    color: '#7CFC00',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 28,
    textAlign: 'center',
  },
  statusBox: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 28,
  },
  status: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryText: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
