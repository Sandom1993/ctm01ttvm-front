const isPro = process.env.NODE_ENV === 'production';

module.exports = {
  widget: {
    path: isPro
      ? ['./src/style/hui.scss', './src/style/project.scss']
      : ['./src/style/hui.scss']
  }
};
