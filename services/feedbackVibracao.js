
import { Vibration, Platform } from 'react-native';

export function vibrarConfirmacao() {
  Vibration.vibrate(90);
}

export function vibrarAdicao() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 65, 90, 65]);
  } else {
    Vibration.vibrate();
  }
}

export function vibrarRemocao() {
  Vibration.vibrate(55);
}

export function vibrarExclusao() {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 100, 70, 180]);
  } else {
    Vibration.vibrate();
  }
}

export function vibrarSelecao() {
  Vibration.vibrate(25);
}
