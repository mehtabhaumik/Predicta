const React = require('react');
const ReactNative = require('react-native');

const makeSharedValue = value => ({
  value,
  get() {
    return this.value;
  },
  set(nextValue) {
    this.value =
      typeof nextValue === 'function' ? nextValue(this.value) : nextValue;
  },
});

const createAnimatedComponent = Component => Component;
const identity = value => value;
const animationBuilder = {
  delay() {
    return this;
  },
  duration() {
    return this;
  },
  easing() {
    return this;
  },
  springify() {
    return this;
  },
};

module.exports = {
  ...ReactNative.Animated,
  default: {
    ...ReactNative.Animated,
    createAnimatedComponent,
    Image: ReactNative.Image,
    ScrollView: ReactNative.ScrollView,
    Text: ReactNative.Text,
    View: ReactNative.View,
  },
  Easing: {
    bezier: () => identity,
    ease: identity,
    in: () => identity,
    inOut: () => identity,
    linear: identity,
    out: () => identity,
  },
  Extrapolation: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
  FadeInUp: animationBuilder,
  cancelAnimation: () => undefined,
  createAnimatedComponent,
  getAnimatedStyle: () => ({}),
  interpolate: value => value,
  makeMutable: makeSharedValue,
  runOnJS: fn => fn,
  runOnUI: fn => fn,
  setUpTests: () => undefined,
  useAnimatedProps: updater => updater(),
  useAnimatedReaction: () => undefined,
  useAnimatedRef: () => React.createRef(),
  useAnimatedStyle: updater => updater(),
  useDerivedValue: updater => makeSharedValue(updater()),
  useSharedValue: makeSharedValue,
  withDelay: (_delay, animation) => animation,
  withRepeat: animation => animation,
  withSequence: (...animations) => animations[animations.length - 1],
  withSpring: (value, _config, callback) => {
    callback?.(true);
    return value;
  },
  withTiming: (value, _config, callback) => {
    callback?.(true);
    return value;
  },
};
