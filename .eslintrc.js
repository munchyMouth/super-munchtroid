module.exports = {
  root: true,

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },

  env: {
    browser: true
  },

  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    '@vue/standard',
    'plugin:vue/recommended',
  ],

  // required to lint *.vue files
  plugins: [
    'vue'
  ],

  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true
  },

  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow paren-less arrow functions
    // 'arrow-parens': 'off',
    // 'one-var': 'off',
    'prefer-promise-reject-errors': 'off',

    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',

    "arrow-parens": 0,
    "no-debugger": 0,
    "no-console": 0,
    "brace-style": 0,
    "curly": 0,
    "no-trailing-spaces": 0,
    "vue/no-v-html": 0,
    "vue/name-property-casing": 0,
    "vue/require-prop-types": 0,
    // allow console.log during development only
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
// module.exports = {
//   root: true,
//   env: {
//     browser: true,
//     node: true
//   },
//   parserOptions: {
//     parser: 'babel-eslint',
//   },
//   extends: [
//     '@nuxtjs',
//     'plugin:nuxt/recommended',
//     'plugin:vue/recommended',
//   ],
//   // add your custom rules here
//   rules: {
//     "arrow-parens": 0,
//     "no-debugger": 0,
//     "no-console": 0,
//     "brace-style": 0,
//     "curly": 0,
//     "no-trailing-spaces": 0,
//     "vue/no-v-html": 0
//   }
// }