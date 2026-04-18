const React = require('react');
const { View } = require('react-native');

function MaskedView({ children, ...props }) {
  return <View {...props}>{children}</View>;
}

module.exports = MaskedView;
module.exports.default = MaskedView;
